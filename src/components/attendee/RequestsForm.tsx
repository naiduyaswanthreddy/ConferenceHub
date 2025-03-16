
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/CustomCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mic, AlertTriangle } from "lucide-react";
import { useInView } from "@/lib/animations";
import MicRequestForm from "./forms/MicRequestForm";
import ComplaintRequestForm from "./forms/ComplaintRequestForm";

interface Event {
  id: string;
  title: string;
}

export default function RequestsForm() {
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'mic' | 'complaint'>('mic');
  const [requestsDisabled, setRequestsDisabled] = useState(false);
  const [ref, isInView] = useInView<HTMLDivElement>();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('event_attendees')
          .select(`
            event_id,
            events (
              id,
              title
            )
          `)
          .eq('user_id', user.id)
          .eq('checked_in', true);
        
        if (error) throw error;
        
        // Format the events data
        const formattedEvents: Event[] = data
          .filter(item => item.events) // Filter out any null events
          .map(item => ({
            id: item.events.id,
            title: item.events.title
          }));
        
        setEvents(formattedEvents);
        if (formattedEvents.length > 0) {
          setSelectedEventId(formattedEvents[0].id);
        } else {
          setRequestsDisabled(true);
        }
        
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
        setRequestsDisabled(true);
      }
    };
    
    fetchEvents();
  }, [user]);

  return (
    <div ref={ref} className={`transition-opacity duration-500 ${isInView ? 'opacity-100' : 'opacity-0'}`}>
      <Card>
        <CardHeader>
          <CardTitle>Submit Requests</CardTitle>
          <CardDescription>
            Submit a mic request or report an issue during an event
          </CardDescription>
          
          <div className="flex border-b mt-4">
            <button
              className={`px-4 py-2 ${activeTab === 'mic' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('mic')}
            >
              <Mic className="w-4 h-4 inline mr-2" />
              Mic Request
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'complaint' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('complaint')}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Report Issue
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'mic' ? (
            <MicRequestForm 
              selectedEventId={selectedEventId} 
              events={events}
              disabled={requestsDisabled}
            />
          ) : (
            <ComplaintRequestForm 
              selectedEventId={selectedEventId}
              events={events}
              disabled={requestsDisabled}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
