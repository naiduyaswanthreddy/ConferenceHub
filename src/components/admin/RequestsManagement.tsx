
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { supabase, staticDemoData, safeCast } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNotifications } from "@/context/NotificationContext";
import { 
  CheckCircle, 
  XCircle, 
  Mic, 
  AlertTriangle,
  Filter,
  Search,
  UserCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MicRequestData, ComplaintData, normalizeMicRequestData, normalizeComplaintData } from "@/utils/eventUtils";

// Use static data for presentations
const USE_STATIC_DATA = true;

type RequestType = 'mic' | 'complaint';

export default function RequestsManagement() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<RequestType>('mic');
  const [micRequests, setMicRequests] = useState<MicRequestData[]>([]);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');

  useEffect(() => {
    if (user) {
      fetchRequests(activeTab);
      
      // If using static data, no need for realtime subscriptions
      if (!USE_STATIC_DATA) {
        // Setup realtime subscriptions
        const micChannel = supabase
          .channel('admin-mic-requests')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'mic_requests',
            },
            () => {
              fetchRequests('mic');
            }
          )
          .subscribe();
          
        const complaintChannel = supabase
          .channel('admin-complaints')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'complaints',
            },
            () => {
              fetchRequests('complaint');
            }
          )
          .subscribe();
          
        return () => {
          supabase.removeChannel(micChannel);
          supabase.removeChannel(complaintChannel);
        };
      }
    }
  }, [user, activeTab]);

  const fetchRequests = async (type: RequestType) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      if (USE_STATIC_DATA) {
        if (type === 'mic') {
          // Use the static data with enhanced user and event info
          const enhancedRequests = staticDemoData.micRequests.map(request => 
            normalizeMicRequestData({
              ...request,
              user_name: request.profiles?.name || 'Unknown User',
              event_title: request.events?.title || 'Unknown Event',
              // Ensure profiles and events exist for type safety
              profiles: request.profiles || { name: 'Unknown User' },
              events: request.events || { title: 'Unknown Event' },
              // Ensure status is properly typed
              status: request.status as 'pending' | 'approved' | 'denied'
            })
          );
          setMicRequests(enhancedRequests);
        } else {
          // Use the static data with enhanced user and event info
          const enhancedComplaints = staticDemoData.complaints.map(complaint => 
            normalizeComplaintData({
              ...complaint,
              user_name: complaint.profiles?.name || 'Unknown User',
              event_title: complaint.events?.title || 'Unknown Event',
              // Ensure profiles and events exist for type safety
              profiles: complaint.profiles || { name: 'Unknown User' },
              events: complaint.events || { title: 'Unknown Event' },
              // Ensure status is properly typed
              status: complaint.status as 'pending' | 'approved' | 'denied'
            })
          );
          setComplaints(enhancedComplaints);
        }
        setTimeout(() => setIsLoading(false), 500);
        return;
      }
      
      if (type === 'mic') {
        // First fetch the mic requests
        const { data: micData, error: micError } = await supabase
          .from('mic_requests')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (micError) throw micError;
        
        // Then manually fetch user profiles and events separately
        const enhancedRequests = await Promise.all((micData || []).map(async (request) => {
          let userName = 'Unknown User';
          let eventTitle = 'Unknown Event';
          
          try {
            // Get user profile - handle potential errors
            const { data: userData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', request.user_id || '')
              .single();
              
            if (userData) {
              userName = userData.name || 'Unknown User';
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
          
          try {
            // Get event data - handle potential errors
            const { data: eventData } = await supabase
              .from('events')
              .select('title')
              .eq('id', request.event_id || '')
              .single();
              
            if (eventData) {
              eventTitle = eventData.title || 'Unknown Event';
            }
          } catch (error) {
            console.error("Error fetching event data:", error);
          }
          
          // Return enhanced request with user name and event title using normalization function
          return normalizeMicRequestData({
            ...request,
            user_name: userName,
            event_title: eventTitle,
            profiles: { name: userName },
            events: { title: eventTitle }
          });
        }));
        
        setMicRequests(enhancedRequests);
      } else if (type === 'complaint') {
        // First fetch complaints
        const { data: complaintData, error: complaintError } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (complaintError) throw complaintError;
        
        // Then manually fetch user profiles and events separately
        const enhancedComplaints = await Promise.all((complaintData || []).map(async (complaint) => {
          let userName = 'Unknown User';
          let eventTitle = 'Unknown Event';
          
          try {
            // Get user profile
            const { data: userData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', complaint.user_id || '')
              .single();
              
            if (userData) {
              userName = userData.name || 'Unknown User';
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
          
          try {
            // Get event data
            const { data: eventData } = await supabase
              .from('events')
              .select('title')
              .eq('id', complaint.event_id || '')
              .single();
              
            if (eventData) {
              eventTitle = eventData.title || 'Unknown Event';
            }
          } catch (error) {
            console.error("Error fetching event data:", error);
          }
          
          // Return enhanced complaint with user name and event title using normalization function
          return normalizeComplaintData({
            ...complaint,
            user_name: userName,
            event_title: eventTitle,
            profiles: { name: userName },
            events: { title: eventTitle }
          });
        }));
        
        setComplaints(enhancedComplaints);
      }
      
    } catch (error) {
      console.error(`Error fetching ${type} requests:`, error);
      toast.error(`Failed to load ${type} requests`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMicRequest = async (id: string, status: 'approved' | 'denied', userId: string) => {
    try {
      setIsLoading(true);
      
      if (USE_STATIC_DATA) {
        // Update in the static data
        const index = staticDemoData.micRequests.findIndex(req => req.id === id);
        if (index !== -1) {
          staticDemoData.micRequests[index].status = status;
          
          // Update local state
          setMicRequests(prev => 
            prev.map(req => 
              req.id === id ? { ...req, status } : req
            )
          );
          
          // Get event title for notification
          const requestData = staticDemoData.micRequests[index];
          const eventTitle = requestData.events?.title || 'the event';
          
          // Add notification to static data
          const newNotification = {
            id: `${Date.now()}`,
            user_id: userId,
            title: `Mic Request ${status === 'approved' ? 'Approved' : 'Denied'}`,
            message: `Your mic request for "${eventTitle}" has been ${status}.`,
            type: 'mic_request' as const,
            read: false,
            created_at: new Date().toISOString(),
            reference_id: id
          };
          
          staticDemoData.notifications.unshift(newNotification);
          
          // Send notification
          await sendNotification({
            user_id: userId,
            title: `Mic Request ${status === 'approved' ? 'Approved' : 'Denied'}`,
            message: `Your mic request for "${eventTitle}" has been ${status}.`,
            type: 'mic_request',
            reference_id: id
          });
          
          toast.success(`Mic request ${status}`);
        }
        return;
      }
      
      // Update the status
      const { error } = await supabase
        .from('mic_requests')
        .update({ 
          status: status as any
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Get the request details for notification
      const { data: requestData, error: requestError } = await supabase
        .from('mic_requests')
        .select(`
          *,
          events:event_id (title)
        `)
        .eq('id', id)
        .single();
        
      if (requestError) throw requestError;
      
      // Safely extract event title from the response
      const eventTitle = requestData?.events?.title || 'the event';
      
      // Send notification to the user
      await sendNotification({
        user_id: userId,
        title: `Mic Request ${status === 'approved' ? 'Approved' : 'Denied'}`,
        message: `Your mic request for "${eventTitle}" has been ${status}.`,
        type: 'mic_request',
        reference_id: id
      });
      
      // Update local state
      setMicRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status } : req
        )
      );
      
      toast.success(`Mic request ${status}`);
      
    } catch (error) {
      console.error("Error updating mic request:", error);
      toast.error("Failed to update request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateComplaint = async (id: string, status: 'approved' | 'denied', userId: string) => {
    try {
      setIsLoading(true);
      
      if (USE_STATIC_DATA) {
        // Update in the static data
        const index = staticDemoData.complaints.findIndex(req => req.id === id);
        if (index !== -1) {
          staticDemoData.complaints[index].status = status;
          
          // Update local state
          setComplaints(prev => 
            prev.map(comp => 
              comp.id === id ? { ...comp, status } : comp
            )
          );
          
          // Get event title for notification
          const complaintData = staticDemoData.complaints[index];
          const eventTitle = complaintData.events?.title || 'the event';
          
          // Add notification to static data
          const newNotification = {
            id: `${Date.now()}`,
            user_id: userId,
            title: `Complaint ${status === 'approved' ? 'Acknowledged' : 'Dismissed'}`,
            message: `Your complaint about "${eventTitle}" has been ${
              status === 'approved' ? 'acknowledged and will be addressed' : 'dismissed'
            }.`,
            type: 'complaint' as const,
            read: false,
            created_at: new Date().toISOString(),
            reference_id: id
          };
          
          staticDemoData.notifications.unshift(newNotification);
          
          // Send notification
          await sendNotification({
            user_id: userId,
            title: `Complaint ${status === 'approved' ? 'Acknowledged' : 'Dismissed'}`,
            message: `Your complaint about "${eventTitle}" has been ${
              status === 'approved' ? 'acknowledged and will be addressed' : 'dismissed'
            }.`,
            type: 'complaint',
            reference_id: id
          });
          
          toast.success(`Complaint ${status === 'approved' ? 'acknowledged' : 'dismissed'}`);
        }
        return;
      }
      
      // Update the status
      const { error } = await supabase
        .from('complaints')
        .update({ 
          status: status as any
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Get the complaint details for notification
      const { data: complaintData, error: complaintError } = await supabase
        .from('complaints')
        .select(`
          *,
          events:event_id (title)
        `)
        .eq('id', id)
        .single();
        
      if (complaintError) throw complaintError;
      
      // Safely extract event title from the response
      const eventTitle = complaintData?.events?.title || 'the event';
      
      // Send notification to the user
      await sendNotification({
        user_id: userId,
        title: `Complaint ${status === 'approved' ? 'Acknowledged' : 'Dismissed'}`,
        message: `Your complaint about "${eventTitle}" has been ${
          status === 'approved' ? 'acknowledged and will be addressed' : 'dismissed'
        }.`,
        type: 'complaint',
        reference_id: id
      });
      
      // Update local state
      setComplaints(prev => 
        prev.map(comp => 
          comp.id === id ? { ...comp, status } : comp
        )
      );
      
      toast.success(`Complaint ${status === 'approved' ? 'acknowledged' : 'dismissed'}`);
      
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error("Failed to update complaint");
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (activeTab === 'mic') {
      return micRequests.filter(req => {
        // Apply status filter
        if (filterStatus !== 'all' && req.status !== filterStatus) {
          return false;
        }
        
        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            req.profiles?.name?.toLowerCase().includes(searchLower) ||
            req.events?.title?.toLowerCase().includes(searchLower) ||
            req.reason.toLowerCase().includes(searchLower)
          );
        }
        
        return true;
      });
    } else {
      return complaints.filter(comp => {
        // Apply status filter
        if (filterStatus !== 'all' && comp.status !== filterStatus) {
          return false;
        }
        
        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            comp.profiles?.name?.toLowerCase().includes(searchLower) ||
            comp.events?.title?.toLowerCase().includes(searchLower) ||
            comp.issue_type.toLowerCase().includes(searchLower) ||
            comp.description.toLowerCase().includes(searchLower)
          );
        }
        
        return true;
      });
    }
  };
  
  const renderMicRequests = () => {
    const filteredRequests = getFilteredRequests();
    
    if (filteredRequests.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg">
          <Mic className="h-12 w-12 mx-auto text-gray-500 mb-3" />
          <p className="text-lg font-medium">No mic requests found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filterStatus !== 'all' 
              ? "Try changing your filters" 
              : "Mic requests from attendees will appear here"}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="overflow-hidden border border-gray-800">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center mb-1">
                    <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">{request.user_name}</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    Event: {request.event_title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                )}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md mb-4">
                <p className="italic text-gray-300">"{request.reason}"</p>
              </div>
              
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <AnimatedButton 
                    className="flex-1"
                    onClick={() => handleUpdateMicRequest(request.id, 'approved', request.user_id)}
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </AnimatedButton>
                  <AnimatedButton 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleUpdateMicRequest(request.id, 'denied', request.user_id)}
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny
                  </AnimatedButton>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderComplaints = () => {
    const filteredComplaints = getFilteredRequests();
    
    if (filteredComplaints.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto text-gray-500 mb-3" />
          <p className="text-lg font-medium">No complaints found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || filterStatus !== 'all' 
              ? "Try changing your filters" 
              : "Complaints from attendees will appear here"}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredComplaints.map((complaint) => (
          <Card key={complaint.id} className="overflow-hidden border border-gray-800">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center mb-1">
                    <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">{complaint.user_name}</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    Event: {complaint.event_title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(complaint.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  complaint.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  complaint.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                )}>
                  {complaint.status === 'approved' ? 'Acknowledged' : 
                   complaint.status === 'denied' ? 'Dismissed' : 'Pending'}
                </div>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md mb-2">
                <div className="text-sm font-medium mb-1 text-gray-300">
                  Issue Type: {complaint.issue_type}
                </div>
                <p className="text-gray-300">"{complaint.description}"</p>
              </div>
              
              {complaint.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <AnimatedButton 
                    className="flex-1"
                    onClick={() => handleUpdateComplaint(complaint.id, 'approved', complaint.user_id)}
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Acknowledge
                  </AnimatedButton>
                  <AnimatedButton 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleUpdateComplaint(complaint.id, 'denied', complaint.user_id)}
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Dismiss
                  </AnimatedButton>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Request Management</h1>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-800">
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center ${
              activeTab === 'mic' ? 'border-b-2 border-primary font-medium' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('mic')}
          >
            <Mic className="h-4 w-4 mr-2" />
            Mic Requests
          </button>
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center ${
              activeTab === 'complaint' ? 'border-b-2 border-primary font-medium' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('complaint')}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Complaints
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-gray-900 border-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <Filter className="h-4 w-4 text-gray-400 mr-2" />
          <select
            className="bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>
      
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-400">Loading requests...</p>
        </div>
      )}
      
      {!isLoading && (
        activeTab === 'mic' ? renderMicRequests() : renderComplaints()
      )}
    </div>
  );
}
