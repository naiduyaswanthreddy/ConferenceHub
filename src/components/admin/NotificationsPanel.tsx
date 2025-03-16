
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Use static data for demos
const USE_STATIC_DATA = true;

const NotificationsPanel: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      
      try {
        if (USE_STATIC_DATA) {
          setNotifications(staticDemoData.notifications);
          
          setTimeout(() => setIsLoading(false), 500);
          return;
        }
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3 border-b border-border last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex gap-2 mt-2">
                    <AnimatedButton variant="subtle" size="sm">View</AnimatedButton>
                    <AnimatedButton variant="ghost" size="sm">Dismiss</AnimatedButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground p-6">No notifications to display</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="notifType" className="block text-sm font-medium mb-1">
                Notification Type
              </label>
              <select
                id="notifType"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="announcement">Announcement</option>
                <option value="event_update">Event Update</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="notifTitle" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input id="notifTitle" placeholder="Notification title" />
            </div>
            
            <div>
              <label htmlFor="notifMessage" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id="notifMessage"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter notification message"
              />
            </div>
            
            <AnimatedButton>Send Notification</AnimatedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPanel;
