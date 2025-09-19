"use client";

import { Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'match' | 'alert' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  alertName?: string;
}

interface NotificationsSidebarProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onClearAll: () => void;
}

export default function NotificationsSidebar({ 
  notifications, 
  onMarkAsRead, 
  onClearAll 
}: NotificationsSidebarProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    
    switch (type) {
      case 'match':
        return 'bg-green-50 border-green-200';
      case 'alert':
        return 'bg-blue-50 border-blue-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune notification</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-colors cursor-pointer hover:shadow-sm ${
                getNotificationBg(notification.type, notification.isRead)
              }`}
              onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  {notification.alertName && (
                    <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {notification.alertName}
                    </span>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer avec statistiques */}
      {notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total: {notifications.length}</span>
            <span>Non lues: {unreadCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
