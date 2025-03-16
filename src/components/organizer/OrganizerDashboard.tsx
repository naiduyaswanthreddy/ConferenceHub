
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, CalendarDays, MessageSquare } from "lucide-react";

interface OrganizerDashboardProps {
  onRequestClick: (requestType: string) => void;
}

interface DashboardStats {
  totalEvents: number;
  totalAttendees: number;
  pendingRequests: number;
  recentRequests: any[];
}

const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ onRequestClick }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalAttendees: 0,
    pendingRequests: 0,
    recentRequests: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch total events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id', { count: 'exact' });

      if (eventsError) throw eventsError;

      // Fetch total attendees (sum from event_attendees table)
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('event_attendees')
        .select('id', { count: 'exact' });

      if (attendeesError) throw attendeesError;

      // Fetch pending mic requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('mic_requests')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Fetch recent mic requests with user names
       const { data: recentRequestsData, error: recentRequestsError } = await supabase
        .from('mic_requests')
        .select(`
          id, created_at, reason,
          profiles (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentRequestsError) throw recentRequestsError;

      setStats({
        totalEvents: eventsData ? eventsData.length : 0,
        totalAttendees: attendeesData ? attendeesData.length : 0,
        pendingRequests: requestsData ? requestsData.length : 0,
        recentRequests: recentRequestsData || []
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast.error(`Failed to load stats: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
            <p className="text-sm text-muted-foreground">Events organized</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalAttendees}</p>
            <p className="text-sm text-muted-foreground">Total participants</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-yellow-500" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pendingRequests}</p>
            <p className="text-sm text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentRequests.length > 0 ? (
            <div className="space-y-3">
              {stats.recentRequests.map((request) => (
                <div 
                  key={request.id}
                  className="p-3 border-b border-border last:border-0 hover:bg-gray-800/20 rounded cursor-pointer transition-colors"
                  onClick={() => onRequestClick('mics')}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{request.profiles?.name || "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No pending requests</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizerDashboard;
