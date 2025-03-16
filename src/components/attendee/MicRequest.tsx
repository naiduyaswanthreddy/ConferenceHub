import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuth } from "@/context/AuthContext";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mic, Check, X, Clock } from "lucide-react";
import { EventType, MicRequestData, normalizeEventData, normalizeMicRequestData } from "@/utils/eventUtils";

// Use static data for presentations
const USE_STATIC_DATA = true;

export default function MicRequest() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [existingRequests, setExistingRequests] = useState<MicRequestData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchExistingRequests();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      if (USE_STATIC_DATA) {
        // Filter for current and upcoming events
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const availableEvents = staticDemoData.events
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now || event.date === today;
          })
          .map(normalizeEventData);
        
        setEvents(availableEvents);
        return;
      }
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, venue');

      if (error) throw error;
      
      // Normalize the events to ensure they have the time property
      const normalizedEvents = (data || []).map(event => normalizeEventData({
        ...event,
        time: '12:00' // Default time if not in database
      }));
      
      setEvents(normalizedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (USE_STATIC_DATA) {
        // Filter static data for this user
        const userRequests = staticDemoData.micRequests
          .filter(req => req.user_id === user.id)
          .map(req => normalizeMicRequestData(req));
          
        setExistingRequests(userRequests);
        return;
      }
      
      const { data, error } = await supabase
        .from('mic_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Normalize the data
      const normalizedRequests = (data || []).map(req => normalizeMicRequestData(req));
      setExistingRequests(normalizedRequests);
    } catch (error) {
      console.error("Error fetching your mic requests:", error);
      toast.error("Failed to load your mic requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!selectedEvent) {
      toast.error("Please select an event");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for mic request");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if a request already exists for this event
      const existingRequest = existingRequests.find(req => 
        req.event_id === selectedEvent && 
        (req.status === "pending" || req.status === "approved")
      );
      
      if (existingRequest) {
        toast.error("You already have an active request for this event");
        return;
      }

      if (USE_STATIC_DATA) {
        // Create a new mock request for demo
        const event = events.find(e => e.id === selectedEvent);
        const newRequest = normalizeMicRequestData({
          id: Math.random().toString(36).substring(2, 15),
          user_id: user.id,
          event_id: selectedEvent,
          reason: reason,
          status: "pending",
          created_at: new Date().toISOString(),
          profiles: { name: user.name },
          events: { title: event?.title || "Unknown Event" }
        });
        
        // Add to the global static data for admin to see
        staticDemoData.micRequests.unshift(newRequest);
        
        // Update local state
        setExistingRequests([newRequest, ...existingRequests]);
        toast.success("Mic request submitted successfully");
        setReason("");
        setSelectedEvent("");
        return;
      }

      const { data, error } = await supabase
        .from('mic_requests')
        .insert({
          user_id: user.id,
          event_id: selectedEvent,
          reason: reason,
          status: "pending"
        })
        .select();

      if (error) throw error;
      
      toast.success("Mic request submitted successfully");
      setReason("");
      setSelectedEvent("");
      
      // Add the new request to the list
      if (data && data[0]) {
        // Normalize the new request data
        const normalizedRequest = normalizeMicRequestData(data[0]);
        setExistingRequests([normalizedRequest, ...existingRequests]);
      }
      
    } catch (error) {
      console.error("Error submitting mic request:", error);
      toast.error("Failed to submit mic request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="h-4 w-4 text-green-500" />;
      case "denied":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "denied":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const formatEventDate = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    return eventDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isEventLive = (date: string, time: string) => {
    const now = new Date();
    const eventDate = new Date(`${date}T${time}`);
    const today = now.toISOString().split('T')[0];
    
    return date === today;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse-subtle text-center">
            Loading mic request data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="mr-2 h-5 w-5 text-primary" />
          Request Microphone Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="event" className="block text-sm font-medium mb-1 text-gray-200">
              Select Event
            </label>
            <select
              id="event"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200"
              disabled={isSubmitting}
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {formatEventDate(event.date, event.time)} {isEventLive(event.date, event.time) && "(Live)"}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-1 text-gray-200">
              Reason for Mic Request
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200"
              placeholder="Explain why you need microphone access during the event..."
              disabled={isSubmitting}
            />
          </div>
          
          <AnimatedButton
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </AnimatedButton>
        </form>
        
        {existingRequests.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4 text-gray-200">Your Mic Requests</h3>
            <div className="space-y-3">
              {existingRequests.map((request) => {
                const event = events.find(e => e.id === request.event_id);
                return (
                  <div key={request.id} className="border border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-200">
                        {event?.title || request.events?.title || "Unknown Event"}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusClass(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{request.reason}</p>
                    <p className="text-xs text-gray-500">
                      Submitted on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
