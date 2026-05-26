import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../api/notifications.api';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import PageTransition from '../components/motion/PageTransition';

interface Notification {
  _id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const notifications: Notification[] = Array.isArray(data)
    ? data
    : data?.notifications ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: (_data, id) => {
      setLocalRead((prev) => new Set(prev).add(id));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: () => toast.error('Failed to mark as read'),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: () => toast.error('Failed to mark all as read'),
  });

  const hasUnread = notifications.some((n) => !n.isRead && !localRead.has(n._id));

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text">Notifications</h1>
          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              {markAllMutation.isPending ? 'Marking…' : 'Mark all as read'}
            </Button>
          )}
        </div>

        {isLoading ? (
          <Spinner size="lg" className="py-20" />
        ) : isError ? (
          <p className="text-center text-red-500 py-10">Failed to load notifications.</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400 dark:text-dark-muted">
            <Bell size={48} strokeWidth={1.5} />
            <p className="text-base font-medium">You're all caught up!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => {
              const read = n.isRead || localRead.has(n._id);
              return (
                <li
                  key={n._id}
                  onClick={() => {
                    if (!read) markReadMutation.mutate(n._id);
                  }}
                  className={`rounded-lg p-4 cursor-pointer transition-colors ${
                    read
                      ? 'bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border'
                      : 'bg-white dark:bg-dark-surface border-l-4 border-pink-500 shadow-sm dark:shadow-none'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          read ? 'font-normal text-gray-700 dark:text-dark-muted' : 'font-bold text-gray-800 dark:text-dark-text'
                        }`}
                      >
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-dark-muted shrink-0 mt-0.5">
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  {!read && (
                    <div className="mt-2">
                      <span className="w-2 h-2 bg-pink-500 rounded-full inline-block" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageTransition>
  );
}
