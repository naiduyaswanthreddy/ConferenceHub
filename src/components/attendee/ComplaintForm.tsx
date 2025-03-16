
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuth } from "@/context/AuthContext";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Check, X, Clock } from "lucide-react";
import { ComplaintData, normalizeComplaintData } from "@/utils/eventUtils";

interface EventType {
  id: string;
  title: string;
  date: string;
  venue: string;
}

const USE_STATIC_DATA = true;

export default function ComplaintForm() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [issueType, setIssueType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [existingComplaints, setExistingComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchExistingComplaints();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      if (USE_STATIC_DATA) {
        const demoEvents: EventType[] = staticDemoData.events.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          venue: event.venue
        }));
        
        setEvents(demoEvents);
        
        setTimeout(() => setLoading(false), 500);
        return;
      }
      
      const { data, error } = await supabase
        .from('events')
        .select('id, title, date, venue')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingComplaints = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (USE_STATIC_DATA) {
        const demoComplaints = staticDemoData.complaints
          .filter(complaint => complaint.user_id === user.id)
          .map(complaint => normalizeComplaintData({
            ...complaint,
            profiles: complaint.profiles || { name: "Unknown User" },
            events: complaint.events || { title: "Unknown Event" }
          }));
        
        setExistingComplaints(demoComplaints);
        
        setTimeout(() => setLoading(false), 500);
        return;
      }
      
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Normalize the data before setting state
      const normalizedComplaints = (data || []).map(complaint => normalizeComplaintData(complaint));
      setExistingComplaints(normalizedComplaints);
    } catch (error) {
      console.error("Error fetching your complaints:", error);
      toast.error("Failed to load your complaints");
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

    if (!issueType) {
      toast.error("Please select an issue type");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    try {
      setIsSubmitting(true);

      if (USE_STATIC_DATA) {
        const newComplaint = normalizeComplaintData({
          id: `complaint-${Date.now()}`,
          event_id: selectedEvent,
          issue_type: issueType,
          description: description,
          status: "pending",
          created_at: new Date().toISOString(),
          user_id: user.id,
          profiles: { name: user.name },
          events: { title: events.find(e => e.id === selectedEvent)?.title || "Unknown Event" }
        });
        
        setExistingComplaints([newComplaint, ...existingComplaints]);
        
        staticDemoData.complaints = [newComplaint, ...staticDemoData.complaints];
        
        toast.success("Complaint submitted successfully");
        
        setDescription("");
        setSelectedEvent("");
        setIssueType("");
        
        setTimeout(() => setIsSubmitting(false), 500);
        return;
      }
      
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          event_id: selectedEvent,
          issue_type: issueType,
          description: description,
          status: "pending"
        })
        .select();

      if (error) throw error;
      
      toast.success("Complaint submitted successfully");
      setDescription("");
      setSelectedEvent("");
      setIssueType("");
      
      if (data && data[0]) {
        // Normalize the data before adding to existing complaints
        const normalizedComplaint = normalizeComplaintData(data[0]);
        setExistingComplaints([normalizedComplaint, ...existingComplaints]);
      }
      
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint");
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse-subtle text-center">
            Loading complaint data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
          Submit a Complaint
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
                  {event.title} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium mb-1 text-gray-200">
              Issue Type
            </label>
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200"
              disabled={isSubmitting}
            >
              <option value="">Select issue type</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Audio Problem">Audio Problem</option>
              <option value="Video Problem">Video Problem</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-200">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200"
              placeholder="Describe the issue in detail..."
              disabled={isSubmitting}
            />
          </div>
          
          <AnimatedButton
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </AnimatedButton>
        </form>
        
        {existingComplaints.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4 text-gray-200">Your Complaints</h3>
            <div className="space-y-3">
              {existingComplaints.map((complaint) => {
                const event = events.find(e => e.id === complaint.event_id);
                return (
                  <div key={complaint.id} className="border border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-200">
                        {event?.title || "Unknown Event"}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusClass(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        <span className="ml-1">
                          {complaint.status === "approved" ? "Acknowledged" : 
                           complaint.status === "denied" ? "Dismissed" : "Pending"}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 mb-1">
                      Issue Type: {complaint.issue_type}
                    </p>
                    <p className="text-sm text-gray-400 mb-1">{complaint.description}</p>
                    <p className="text-xs text-gray-500">
                      Submitted on {new Date(complaint.created_at).toLocaleDateString()}
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
