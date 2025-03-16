
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase, staticDemoData, safeCast } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { BellRing, Mic, AlertTriangle, Megaphone, Calendar } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'mic_request' | 'complaint' | 'announcement' | 'event_update';
  read: boolean;
  created_at: string;
  reference_id?: string;
  user_id: string;
  sender_id?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  sendNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Use static data for presentations
const USE_STATIC_DATA = true;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      console.log("Fetching notifications for user:", user.id);
      
      if (USE_STATIC_DATA) {
        // Use static data
        const staticNotifications = staticDemoData.notifications as Notification[];
        setNotifications(staticNotifications);
        setUnreadCount(staticNotifications.filter(n => !n.read).length);
        return;
      }
      
      // If not using static data, fetch from Supabase
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }
      
      console.log("Fetched notifications:", data);
      const typedNotifications = safeCast<Notification[]>(data || []);
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      if (USE_STATIC_DATA) {
        // Update local state only for demo
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return;
      }
      
      // If not using static data, update in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true
        } as any)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      if (USE_STATIC_DATA) {
        // Update local state only for demo
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        return;
      }
      
      // If not using static data, update in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true
        } as any)
        .eq('user_id', user.id)
        .eq('read', false as any);
      
      if (error) {
        console.error("Error marking all notifications as read:", error);
        return;
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const sendNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      console.log("Sending notification:", notification);
      
      if (USE_STATIC_DATA) {
        // Simulate sending notification in demo mode
        const newNotification: Notification = {
          id: `demo-${Date.now()}`,
          ...notification,
          read: false,
          created_at: new Date().toISOString(),
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification for demo
        toast.success("Notification sent successfully");
        return;
      }
      
      // Create the insert object with the right types for Supabase
      const insertData = {
        user_id: notification.user_id,
        sender_id: user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        reference_id: notification.reference_id,
        read: false
      } as any;
      
      const { error } = await supabase
        .from('notifications')
        .insert(insertData);
      
      if (error) {
        console.error("Error sending notification:", error);
        throw error;
      }
      
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Failed to send notification:", error);
      throw error;
    }
  };

  // Helper function to get icon for notification toast
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

  // Initialize notifications on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // For automatic data generation, add a new notification every 15 seconds
    if (USE_STATIC_DATA) {
      const interval = setInterval(() => {
        // Skip adding notifications sometimes to make it less predictable
        if (Math.random() < 0.3) {
          const notificationTypes = ['announcement', 'mic_request', 'event_update', 'complaint'] as const;
          const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          
          const notificationMessages = {
            announcement: [
              "New speaker added to Tech Summit 2024",
              "Schedule update for Developer Conference",
              "Important venue information for AI Workshop"
            ],
            mic_request: [
              "Your microphone request has been processed",
              "Speaker queue position update",
              "Question opportunity available"
            ],
            event_update: [
              "Room change for the upcoming session",
              "Session starting in 10 minutes",
              "New material available for download"
            ],
            complaint: [
              "Your feedback has been received",
              "Resolution update for your recent report",
              "Thank you for helping improve our events"
            ]
          };
          
          const randomMessage = notificationMessages[randomType][Math.floor(Math.random() * notificationMessages[randomType].length)];
          
          const newNotification: Notification = {
            id: `${Date.now()}`,
            title: `${randomType === 'mic_request' ? 'Microphone Request' : 
                     randomType === 'event_update' ? 'Event Update' :
                     randomType === 'complaint' ? 'Feedback Follow-up' : 'Announcement'}`,
            message: randomMessage,
            type: randomType,
            read: false,
            created_at: new Date().toISOString(),
            user_id: user.id
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast(newNotification.title, {
            description: newNotification.message,
            icon: getNotificationIcon(newNotification.type),
          });
        }
      }, 15000); // Every 15 seconds
      
      return () => clearInterval(interval);
    }
    
    // Real-time subscription for live use
    console.log("Setting up realtime notification subscription for user:", user.id);
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          console.log('New notification received:', newNotification);
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast(newNotification.title, {
            description: newNotification.message,
            icon: getNotificationIcon(newNotification.type),
          });
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up notification subscription");
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
