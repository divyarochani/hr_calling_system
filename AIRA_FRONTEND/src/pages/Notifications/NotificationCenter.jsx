import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertCircle, Phone, UserCheck } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { getAllNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await getAllNotifications();
      // FastAPI returns data directly
      setNotifications(response.notifications || response || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
        });
      }
    });

    return () => {
      socket.off('notification:new');
    };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type) => {
    const icons = {
      missed_call: Phone,
      call_completed: Phone,
      screening_done: UserCheck,
      interview_scheduled: UserCheck,
      system: AlertCircle,
    };
    return icons[type] || Bell;
  };

  const getColor = (type, priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-600';
    if (type === 'missed_call') return 'bg-red-100 text-red-600';
    if (type === 'screening_done') return 'bg-green-100 text-green-600';
    return 'bg-blue-100 text-blue-600';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-secondary flex items-center"
          >
            <CheckCheck size={20} className="mr-2" />
            Mark All Read
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'unread' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'read' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications to display
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getColor(notification.type, notification.priority)}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(new Date(notification.created_at || notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                          >
                            <Check size={16} className="mr-1" />
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
