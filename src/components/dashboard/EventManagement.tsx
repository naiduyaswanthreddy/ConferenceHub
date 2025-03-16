
import React, { useState, useEffect } from "react";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EventType, normalizeEventData } from "@/utils/eventUtils";
import EventForm from "@/components/events/EventForm";
import EventList from "@/components/events/EventList";

// Use static data for presentations
const USE_STATIC_DATA = true;

export default function EventManagement() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
    
      if (USE_STATIC_DATA) {
        // Using normalizeEventData to ensure consistent shape
        const normalizedEvents = staticDemoData.events.map(normalizeEventData);
        setEvents(normalizedEvents);
      
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        return;
      }
    
      // Actual Supabase call
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
    
      // Normalize the data to ensure it has all required fields including time
      const normalizedEvents = (data || []).map(normalizeEventData);
      setEvents(normalizedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventCreated = (newEvent: EventType) => {
    setEvents([...events, newEvent]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Event Management</h1>
      <EventForm onEventCreated={handleEventCreated} />
      <EventList events={events} isLoading={isLoading} />
    </div>
  );
}
