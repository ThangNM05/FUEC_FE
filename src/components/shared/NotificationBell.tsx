import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell, CheckCheck, BookOpen, ClipboardList, Award, Megaphone, Info, MessageSquare, FileText, HelpCircle, ShieldAlert, Trash2, Flag } from 'lucide-react';
import type { NotificationItem } from '@/types/notification.types';
import { useNotificationHub } from '@/contexts/NotificationContext';
import { selectCurrentUser } from '@/redux/authSlice';
import { useDeleteNotificationMutation } from '@/api/notificationsApi';

function getTypeIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'Assignment':
      return <ClipboardList className="w-4 h-4 text-blue-500" />;
    case 'Exam':
      return <BookOpen className="w-4 h-4 text-purple-500" />;
    case 'Grade':
      return <Award className="w-4 h-4 text-green-500" />;
    case 'Announcement':
      return <Megaphone className="w-4 h-4 text-orange-500" />;
    case 'Message':
      return <MessageSquare className="w-4 h-4 text-teal-500" />;
    case 'CourseMaterial':
      return <FileText className="w-4 h-4 text-indigo-500" />;
    case 'SlotQuestion':
      return <HelpCircle className="w-4 h-4 text-amber-500" />;
    case 'CheatDetected':
      return <ShieldAlert className="w-4 h-4 text-red-500" />;
    case 'QuestionReport':
      return <Flag className="w-4 h-4 text-red-500" />;
    default:
      return <Info className="w-4 h-4 text-gray-500" />;
  }
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NotificationBellProps {
  /** Optional extra css classes */
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } =
    useNotificationHub();
  const [deleteNotification] = useDeleteNotificationMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleBellClick() {
    setOpen((v) => !v);
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
  }

  async function handleMarkRead(id: string) {
    await markAsRead(id);
  }

  async function handleClearAll() {
    if (notifications.length === 0) return;

    await Promise.allSettled(
      notifications.map((notification) => deleteNotification(notification.id).unwrap()),
    );
    clearAll();
  }

  async function handleDeleteNotification(id: string, event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    try {
      await deleteNotification(id).unwrap();
      clearNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  const handleNotificationClick = (n: NotificationItem) => {
    handleMarkRead(n.id);
    setOpen(false);

    const role = currentUser?.role;
    const entityType = n.relatedEntityType;
    const entityId = n.relatedEntityId;

    // Always deep-link cheating alerts to the exact evidence detail page when an id exists.
    if (role === 'Teacher' && n.type === 'CheatDetected' && entityId) {
      navigate(`/teacher/reports?cheatLogId=${entityId}`);
      return;
    }

    // For notifications without a related entity, use type-based fallback
    if (!entityId) {
      switch (n.type) {
        case 'Grade':
          navigate(role === 'Teacher' ? '/teacher/reports' : '/student/grades');
          break;
        case 'Announcement':
        case 'System':
          // No specific page, just mark as read
          break;
      }
      return;
    }

    // Route based on relatedEntityType — precisely describes what entityId refers to
    switch (entityType) {
      case 'Conversation':
        navigate(`/messenger?conversationId=${entityId}`);
        break;

      case 'Assignment':
        if (role === 'Teacher') {
          navigate(`/teacher/assignment/${entityId}/submissions`);
        } else {
          navigate(`/student/assignment-submission/${entityId}`);
        }
        break;

      case 'Exam':
        if (role === 'Teacher') {
          navigate('/teacher/classrooms');
        } else {
          navigate(`/student/exam-lobby/${entityId}`);
        }
        break;

      case 'CourseMaterial':
        navigate(role === 'Teacher' ? '/teacher/classrooms' : '/student/courses');
        break;

      case 'SlotQuestionContent':
        navigate(role === 'Teacher' ? '/teacher/classrooms' : '/student/courses');
        break;

      case 'StudentCheatLog':
      case 'StudentCheatLogs':
      case 'CheatLog':
        if (role === 'Teacher') {
          navigate(`/teacher/reports?cheatLogId=${entityId}`);
        }
        break;

      case 'Question':
        if (role === 'Teacher') {
          navigate(`/teacher/question-banks?questionId=${entityId}`);
        }
        break;

      default:
        // Fallback: use notification type for routing
        switch (n.type) {
          case 'Message':
            navigate('/messenger');
            break;
          case 'Grade':
            navigate(role === 'Teacher' ? '/teacher/reports' : '/student/grades');
            break;
          case 'Assignment':
            navigate(role === 'Teacher' ? '/teacher/classrooms' : '/student/courses');
            break;
          case 'Exam':
            navigate(role === 'Teacher' ? '/teacher/classrooms' : '/student/exams');
            break;
          case 'CourseMaterial':
            navigate(role === 'Teacher' ? '/teacher/classrooms' : '/student/courses');
            break;
          case 'SlotQuestion':
            navigate(role === 'Teacher' ? '/teacher/classrooms' : '/student/courses');
            break;
          case 'CheatDetected':
            if (role === 'Teacher') {
              navigate('/teacher/reports');
            }
            break;
          case 'QuestionReport':
            if (role === 'Teacher') {
              navigate(`/teacher/question-banks?questionId=${entityId}`);
            }
            break;
        }
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell button */}
      <button
        ref={buttonRef}
        id="notification-bell-btn"
        onClick={handleBellClick}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
        title={isConnected ? 'Notifications (connected)' : 'Notifications (connecting…)'}
      >
        <Bell className="w-5 h-5 text-gray-600" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Tiny connection dot */}
        <span
          className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          id="notification-panel"
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          style={{ maxHeight: '480px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#F37022]/10 to-orange-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#F37022]" />
              <span className="font-semibold text-sm text-gray-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-[#F37022] text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Clear all notifications"
                  aria-label="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-[#F37022] hover:text-[#D96419] font-medium transition-colors px-2 py-1 rounded-md hover:bg-orange-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  All read
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
                <Bell className="w-10 h-10 opacity-30" />
                <p className="text-sm">No notifications yet</p>
                {!isConnected && (
                  <p className="text-xs text-orange-400">Connecting to server…</p>
                )}
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`group relative flex gap-3 px-4 py-3 pr-11 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !n.isRead ? 'bg-[#F37022]/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {/* Type icon */}
                    <div className="mt-0.5 flex-shrink-0">{getTypeIcon(n.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug truncate ${
                          !n.isRead ? 'font-bold text-gray-900' : 'font-normal text-gray-500'
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${
                        !n.isRead ? 'text-gray-700 font-medium' : 'text-gray-400'
                      }`}>{n.message}</p>
                      <p className={`text-xs mt-1 ${
                        !n.isRead ? 'text-[#F37022] font-medium' : 'text-gray-400'
                      }`}>{formatRelativeTime(n.createdAt)}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity group-hover:opacity-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F37022] block" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(event) => handleDeleteNotification(n.id, event)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                      aria-label="Delete notification"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
