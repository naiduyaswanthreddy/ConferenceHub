
import React, { useState } from "react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface MicRequestFormProps {
  selectedEventId: string;
  events: { id: string; title: string }[];
  disabled: boolean;
}

const MicRequestForm: React.FC<MicRequestFormProps> = ({ 
  selectedEventId, 
  events, 
  disabled 
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMicRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEventId || !reason) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('mic_requests')
        .insert({
          user_id: user.id,
          event_id: selectedEventId,
          reason,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast.success("Mic request submitted successfully");
      setReason("");
    } catch (error) {
      console.error("Error submitting mic request:", error);
      toast.error("Failed to submit mic request");
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
    <form onSubmit={handleMicRequest}>
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
        <label htmlFor="reason" className="block text-sm font-medium mb-1">
          Reason for Mic Request
        </label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly explain why you need the mic"
          required
        />
      </div>
      <AnimatedButton
        type="submit"
        className="w-full"
        disabled={isLoading || !reason}
      >
        {isLoading ? "Submitting..." : "Submit Mic Request"}
      </AnimatedButton>
    </form>
  );
};

export default MicRequestForm;
