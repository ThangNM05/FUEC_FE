import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, BookOpen, ClipboardList, Award, Megaphone, Info } from 'lucide-react';
import type { NotificationItem } from '@/types/notification.types';
import { useNotificationHub } from '@/hooks/useNotificationHub';

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
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } =
    useNotificationHub();

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
                    className={`group relative flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !n.isRead ? 'bg-[#F37022]/5' : ''
                    }`}
                    onClick={() => {
                      handleMarkRead(n.id);
                      if (n.relatedEntityId && n.type === 'Message') {
                        // Redirect to messenger conversation
                        navigate(`/messenger?conversationId=${n.relatedEntityId}`);
                        setOpen(false);
                      }
                    }}
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
                      <div className="flex-shrink-0 mt-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F37022] block" />
                      </div>
                    )}
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
