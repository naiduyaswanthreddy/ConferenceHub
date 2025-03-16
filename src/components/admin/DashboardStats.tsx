
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DashboardStatsProps {
  onRequestClick: (type: string) => void;
}

export interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  pendingRequests: number;
  recentEvents: any[];
  recentRequests: any[];
}

// Use static data for demos
const USE_STATIC_DATA = true;

const DashboardStats: React.FC<DashboardStatsProps> = ({ onRequestClick }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalUsers: 0,
    pendingRequests: 0,
    recentEvents: [],
    recentRequests: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardStats = async () => {
      setIsLoading(true);
      
      try {
        if (USE_STATIC_DATA) {
          const events = staticDemoData.events;
          const users = staticDemoData.users;
          const micRequests = staticDemoData.micRequests.filter(req => req.status === 'pending');
          const complaints = staticDemoData.complaints.filter(comp => comp.status === 'pending');
          
          const allRequests = [
            ...micRequests.map(req => ({ 
              ...req, 
              type: 'mic_request' 
            })),
            ...complaints.map(comp => ({ 
              ...comp, 
              type: 'complaint', 
              reason: comp.description 
            }))
          ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setStats({
            totalEvents: events.length,
            totalUsers: users.length,
            pendingRequests: micRequests.length + complaints.length,
            recentEvents: events.slice(0, 5),
            recentRequests: allRequests.slice(0, 3)
          });
          
          setTimeout(() => setIsLoading(false), 500);
          return;
        }
        
        // Actual Supabase calls if not using static data
        const { count: eventsCount, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });

        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: micRequestsCount, error: micRequestsError } = await supabase
          .from('mic_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: complaintsCount, error: complaintsError } = await supabase
          .from('complaints')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { data: recentEvents, error: recentEventsError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: recentMicRequests, error: recentMicRequestsError } = await supabase
          .from('mic_requests')
          .select('*, profiles(name)')
          .order('created_at', { ascending: false })
          .limit(3);

        setStats({
          totalEvents: eventsCount || 0,
          totalUsers: usersCount || 0,
          pendingRequests: (micRequestsCount || 0) + (complaintsCount || 0),
          recentEvents: recentEvents || [],
          recentRequests: recentMicRequests || []
        });

        if (eventsError || usersError || micRequestsError || complaintsError || recentEventsError || recentMicRequestsError) {
          console.error("Error fetching dashboard stats:", { eventsError, usersError, micRequestsError, complaintsError });
          toast.error("Failed to load some dashboard data");
        }
      } catch (error) {
        console.error("Dashboard stats fetch error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalEvents}</p>
            <p className="text-sm text-muted-foreground">Active events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            <p className="text-sm text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Events</h2>
          <Card>
            <CardContent className="p-6">
              {stats.recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentEvents.map((event) => (
                    <div key={event.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} • {event.venue}
                      </p>
                      <p className="text-xs mt-1 text-primary">{event.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No events created yet</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Requests</h2>
          <Card>
            <CardContent className="p-6">
              {stats.recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="border-b border-border pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-700/30 p-2 rounded transition-colors"
                      onClick={() => onRequestClick(request.type === 'complaint' ? 'mics' : 'mics')}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">
                          {request.type === 'complaint' ? 'Complaint' : 'Mic Request'}
                        </h3>
                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From: {request.profiles?.name || 'Unknown user'}
                      </p>
                      <p className="text-xs mt-1">{request.reason || 'No reason provided'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No requests received yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
