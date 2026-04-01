import { useEffect, useRef, useCallback, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import type {
  NotificationDto,
  AssignmentNotificationDto,
  ExamNotificationDto,
  GradeNotificationDto,
  AnnouncementDto,
  NotificationItem,
} from '@/types/notification.types';

/**
 * Hub URL: the BE maps NotificationHub to /hubs/notification (Program.cs line 123)
 * PathBase is /api, so full path is: {baseUrl}/hubs/notification
 */
const getHubUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL as string; // e.g. http://localhost:5077/api/v1
  // Strip /v1 suffix to get base path: http://localhost:5077/api
  const base = apiUrl.replace(/\/v1\/?$/, '');
  return `${base}/hubs/notification`;
};

/** Convert any incoming BE event into a unified NotificationItem */
function toNotificationItem(
  id: string,
  title: string,
  message: string,
  type: NotificationItem['type'],
  createdAt: string,
  relatedEntityId?: string,
): NotificationItem {
  return { id, title, message, type, isRead: false, createdAt, relatedEntityId };
}

export interface NotificationHubCallbacks {
  onReceiveNotification?: (notification: NotificationDto) => void;
  onNotificationRead?: (event: { NotificationId: string }) => void;
  onAllNotificationsRead?: () => void;
  onAssignmentNotification?: (notification: AssignmentNotificationDto) => void;
  onExamNotification?: (notification: ExamNotificationDto) => void;
  onGradeNotification?: (notification: GradeNotificationDto) => void;
  onSystemAnnouncement?: (announcement: AnnouncementDto) => void;
}

export interface UseNotificationHubReturn {
  connectionState: signalR.HubConnectionState;
  isConnected: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToChannel: (channelName: string) => Promise<void>;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

export function useNotificationHub(
  callbacks?: NotificationHubCallbacks,
): UseNotificationHubReturn {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected,
  );
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Local notification store (accumulates real-time items)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((item: NotificationItem) => {
    setNotifications((prev) => {
      // Avoid duplicates by id
      if (prev.some((n) => n.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, []);

  // ── Build and start connection ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[NotificationHub] No auth token found, skipping connection.');
      return;
    }

    const hubUrl = getHubUrl();
    console.log('[NotificationHub] Connecting to:', hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || '',
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // ── Event: ReceiveNotification (general) ──
    connection.on('ReceiveNotification', (dto: NotificationDto) => {
      callbacksRef.current?.onReceiveNotification?.(dto);
      addNotification({
        id: dto.id,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        isRead: dto.isRead,
        createdAt: dto.createdAt,
        relatedEntityId: dto.relatedEntityId,
      });
    });

    // ── Event: NotificationMarkedRead ──
    connection.on('NotificationMarkedRead', (notificationId: string) => {
      callbacksRef.current?.onNotificationRead?.({ NotificationId: notificationId });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
    });

    // ── Event: AllNotificationsMarkedRead (from hub method) ──
    connection.on('AllNotificationsMarkedRead', () => {
      callbacksRef.current?.onAllNotificationsRead?.();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });

    // ── Event: AssignmentNotification ──
    connection.on('AssignmentNotification', (dto: AssignmentNotificationDto) => {
      callbacksRef.current?.onAssignmentNotification?.(dto);
      addNotification(
        toNotificationItem(
          `assignment-${dto.assignmentId}-${Date.now()}`,
          `Assignment: ${dto.assignmentTitle}`,
          dto.message,
          'Assignment',
          dto.createdAt,
          dto.assignmentId,
        ),
      );
    });

    // ── Event: ExamNotification ──
    connection.on('ExamNotification', (dto: ExamNotificationDto) => {
      callbacksRef.current?.onExamNotification?.(dto);
      addNotification(
        toNotificationItem(
          `exam-${dto.examId}-${Date.now()}`,
          `Exam: ${dto.examTitle}`,
          dto.message,
          'Exam',
          dto.createdAt,
          dto.examId,
        ),
      );
    });

    // ── Event: GradeNotification ──
    connection.on('GradeNotification', (dto: GradeNotificationDto) => {
      callbacksRef.current?.onGradeNotification?.(dto);
      addNotification(
        toNotificationItem(
          `grade-${dto.assignmentId ?? dto.examId ?? Date.now()}`,
          `Grade: ${dto.subjectName}`,
          dto.message,
          'Grade',
          dto.createdAt,
        ),
      );
    });

    // ── Event: SystemAnnouncement ──
    connection.on('SystemAnnouncement', (dto: AnnouncementDto) => {
      callbacksRef.current?.onSystemAnnouncement?.(dto);
      addNotification(
        toNotificationItem(dto.id, dto.title, dto.content, 'Announcement', dto.createdAt),
      );
    });

    // ── Connection lifecycle ──
    connection.onreconnecting(() => {
      console.log('[NotificationHub] Reconnecting...');
      setConnectionState(signalR.HubConnectionState.Reconnecting);
    });
    connection.onreconnected(() => {
      console.log('[NotificationHub] Reconnected.');
      setConnectionState(signalR.HubConnectionState.Connected);
    });
    connection.onclose(() => {
      console.log('[NotificationHub] Connection closed.');
      setConnectionState(signalR.HubConnectionState.Disconnected);
    });

    // Start connection
    connection
      .start()
      .then(() => {
        console.log('[NotificationHub] Connected successfully.');
        setConnectionState(signalR.HubConnectionState.Connected);
      })
      .catch((err) => {
        console.error('[NotificationHub] Connection error:', err);
        setConnectionState(signalR.HubConnectionState.Disconnected);
      });

    connectionRef.current = connection;

    return () => {
      connection.stop().catch(console.error);
    };
  }, [addNotification]);

  // ── Hub method invocations ──

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
    const conn = connectionRef.current;
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke('MarkNotificationAsRead', notificationId);
      } catch (err) {
        console.error('[NotificationHub] MarkNotificationAsRead error:', err);
      }
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const conn = connectionRef.current;
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke('MarkAllNotificationsAsRead');
      } catch (err) {
        console.error('[NotificationHub] MarkAllNotificationsAsRead error:', err);
      }
    }
  }, []);

  const subscribeToChannel = useCallback(async (channelName: string) => {
    const conn = connectionRef.current;
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke('SubscribeToChannel', channelName);
      } catch (err) {
        console.error('[NotificationHub] SubscribeToChannel error:', err);
      }
    }
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    connectionState,
    isConnected: connectionState === signalR.HubConnectionState.Connected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    subscribeToChannel,
    clearNotification,
    clearAll,
  };
}
