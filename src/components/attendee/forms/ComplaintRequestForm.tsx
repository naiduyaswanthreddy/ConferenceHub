
import React, { useState } from "react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComplaintRequestFormProps {
  selectedEventId: string;
  events: { id: string; title: string }[];
  disabled: boolean;
}

const ComplaintRequestForm: React.FC<ComplaintRequestFormProps> = ({ 
  selectedEventId,
  events,
  disabled 
}) => {
  const { user } = useAuth();
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEventId || !issueType || !description) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          event_id: selectedEventId,
          issue_type: issueType,
          description,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast.success("Complaint submitted successfully");
      setIssueType("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint");
    } finally {
      setIsLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">You need to be checked in to an event to submit requests</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleComplaintSubmit}>
      <div className="mb-4">
        <label htmlFor="event" className="block text-sm font-medium mb-1">
          Select Event
        </label>
        <select
          id="event"
          value={selectedEventId}
          className="w-full p-2 border border-gray-300 rounded-md bg-background"
          disabled={events.length === 0}
        >
          {events.length === 0 ? (
            <option>No events available</option>
          ) : (
            events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))
          )}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="issueType" className="block text-sm font-medium mb-1">
          Issue Type
        </label>
        <select
          id="issueType"
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md bg-background"
          required
        >
          <option value="">Select an issue type</option>
          <option value="Technical Problem">Technical Problem</option>
          <option value="Speaker Issue">Speaker Issue</option>
          <option value="Venue Problem">Venue Problem</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md bg-background"
          rows={4}
          placeholder="Describe the issue in detail"
          required
        />
      </div>
      <AnimatedButton
        type="submit"
        className="w-full"
        disabled={isLoading || !issueType || !description}
      >
        {isLoading ? "Submitting..." : "Submit Report"}
      </AnimatedButton>
    </form>
  );
};

export default ComplaintRequestForm;
