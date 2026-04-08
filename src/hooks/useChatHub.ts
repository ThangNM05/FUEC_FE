import { useEffect, useRef, useCallback, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import type {
  SignalRMessageDto,
  SignalRConversationDto,
  UserTypingEvent,
  MessageDeletedEvent,
  MemberRemovedEvent,
  MemberAddedEvent,
} from '@/types/messenger.types';

/**
 * Hub URL: the BE maps ChatHub to /hubs/chat (see Program.cs line 122)
 * PathBase is /api, so full path is: {baseUrl}/hubs/chat
 */
const getHubUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL as string; // e.g. http://localhost:5077/api/v1
  // Strip /v1 suffix to get base path: http://localhost:5077/api
  const base = apiUrl.replace(/\/v1\/?$/, '');
  return `${base}/hubs/chat`;
};

export interface ChatHubCallbacks {
  onReceiveMessage?: (message: SignalRMessageDto) => void;
  onMessageUpdated?: (message: SignalRMessageDto) => void;
  onMessageDeleted?: (event: MessageDeletedEvent) => void;
  onReceiveDirectMessage?: (message: SignalRMessageDto) => void;
  onNewConversation?: (conversation: SignalRConversationDto) => void;
  onAddedToConversation?: (conversation: SignalRConversationDto) => void;
  onRemovedFromConversation?: (event: { conversationId: string }) => void;
  onMemberRemoved?: (event: MemberRemovedEvent) => void;
  onMemberAdded?: (event: MemberAddedEvent) => void;
  onUserJoined?: (event: { userId: string; conversationId: string }) => void;
  onUserLeft?: (event: { userId: string; conversationId: string }) => void;
  onUserTyping?: (event: UserTypingEvent) => void;
  onMessagesRead?: (event: { userId: string; conversationId: string; messageIds: string[] }) => void;
}

export function useChatHub(callbacks: ChatHubCallbacks) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Build and start the connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[ChatHub] No auth token found, skipping connection.');
      return;
    }

    const hubUrl = getHubUrl();
    console.log('[ChatHub] Connecting to:', hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || '',
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // ── Register event handlers ──
    connection.on('ReceiveMessage', (msg: SignalRMessageDto) => {
      callbacksRef.current.onReceiveMessage?.(msg);
    });
    connection.on('MessageUpdated', (msg: SignalRMessageDto) => {
      callbacksRef.current.onMessageUpdated?.(msg);
    });
    connection.on('MessageDeleted', (evt: MessageDeletedEvent) => {
      callbacksRef.current.onMessageDeleted?.(evt);
    });
    connection.on('ReceiveDirectMessage', (msg: SignalRMessageDto) => {
      callbacksRef.current.onReceiveDirectMessage?.(msg);
    });
    connection.on('NewConversation', (conv: SignalRConversationDto) => {
      callbacksRef.current.onNewConversation?.(conv);
    });
    connection.on('AddedToConversation', (conv: SignalRConversationDto) => {
      callbacksRef.current.onAddedToConversation?.(conv);
    });
    connection.on('RemovedFromConversation', (evt: { conversationId: string }) => {
      callbacksRef.current.onRemovedFromConversation?.(evt);
    });
    connection.on('MemberRemoved', (evt: MemberRemovedEvent) => {
      callbacksRef.current.onMemberRemoved?.(evt);
    });
    connection.on('MemberAdded', (evt: MemberAddedEvent) => {
      callbacksRef.current.onMemberAdded?.(evt);
    });
    connection.on('UserJoined', (evt: { userId: string; conversationId: string }) => {
      callbacksRef.current.onUserJoined?.(evt);
    });
    connection.on('UserLeft', (evt: { userId: string; conversationId: string }) => {
      callbacksRef.current.onUserLeft?.(evt);
    });
    connection.on('UserTyping', (evt: UserTypingEvent) => {
      callbacksRef.current.onUserTyping?.(evt);
    });
    connection.on('MessagesRead', (evt: { userId: string; conversationId: string; messageIds: string[] }) => {
      callbacksRef.current.onMessagesRead?.(evt);
    });

    // ── Connection lifecycle ──
    connection.onreconnecting(() => {
      console.log('[ChatHub] Reconnecting...');
      setConnectionState(signalR.HubConnectionState.Reconnecting);
    });
    connection.onreconnected(() => {
      console.log('[ChatHub] Reconnected.');
      setConnectionState(signalR.HubConnectionState.Connected);
    });
    connection.onclose(() => {
      console.log('[ChatHub] Connection closed.');
      setConnectionState(signalR.HubConnectionState.Disconnected);
    });

    // Start connection
    connection
      .start()
      .then(() => {
        console.log('[ChatHub] Connected successfully.');
        setConnectionState(signalR.HubConnectionState.Connected);
      })
      .catch((err) => {
        console.error('[ChatHub] Connection error:', err);
        setConnectionState(signalR.HubConnectionState.Disconnected);
      });

    connectionRef.current = connection;

    return () => {
      connection.stop().catch(console.error);
    };
  }, []);

  // ── Hub method invocations (mirrors ChatHub.cs) ──

  const joinConversation = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke('JoinConversation', conversationId);
      } catch (err) {
        console.error('[ChatHub] JoinConversation error:', err);
      }
    }
  }, []);

  const leaveConversation = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke('LeaveConversation', conversationId);
      } catch (err) {
        console.error('[ChatHub] LeaveConversation error:', err);
      }
    }
  }, []);

  const startTyping = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke('StartTyping', conversationId);
      } catch (err) {
        console.error('[ChatHub] StartTyping error:', err);
      }
    }
  }, []);

  const stopTyping = useCallback(async (conversationId: string) => {
    const conn = connectionRef.current;
    if (conn?.state === signalR.HubConnectionState.Connected) {
      try {
        await conn.invoke('StopTyping', conversationId);
      } catch (err) {
        console.error('[ChatHub] StopTyping error:', err);
      }
    }
  }, []);

  const markMessagesAsRead = useCallback(
    async (conversationId: string, messageIds: string[]) => {
      const conn = connectionRef.current;
      if (conn?.state === signalR.HubConnectionState.Connected) {
        try {
          await conn.invoke('MarkMessagesAsRead', conversationId, messageIds);
        } catch (err) {
          console.error('[ChatHub] MarkMessagesAsRead error:', err);
        }
      }
    },
    []
  );

  return {
    connectionState,
    isConnected: connectionState === signalR.HubConnectionState.Connected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
  };
}
