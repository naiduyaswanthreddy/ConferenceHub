
import React from "react";
import { Card, CardContent } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useNotifications } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import {
  BellRing,
  Mic,
  AlertTriangle,
  Megaphone,
  Calendar,
  CheckCircle,
} from "lucide-react";

const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mic_request':
        return <Mic className="h-4 w-4" />;
      case 'complaint':
        return <AlertTriangle className="h-4 w-4" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4" />;
      case 'event_update':
        return <Calendar className="h-4 w-4" />;
      default:
        return <BellRing className="h-4 w-4" />;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <BellRing className="h-10 w-10 mx-auto mb-2 opacity-20" />
        <p>No notifications available</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-auto">
      {unreadCount > 0 && (
        <div className="sticky top-0 p-2 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
          <span className="text-sm text-blue-400">{unreadCount} unread</span>
          <AnimatedButton variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </AnimatedButton>
        </div>
      )}
      
      <div className="divide-y divide-gray-800">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`border-0 rounded-none hover:bg-gray-900/50 ${!notification.read ? 'bg-primary/5' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${!notification.read ? 'bg-primary/10 text-primary' : 'bg-gray-800 text-gray-400'}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{notification.title}</p>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                  
                  {!notification.read && (
                    <AnimatedButton 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark as read
                    </AnimatedButton>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;
