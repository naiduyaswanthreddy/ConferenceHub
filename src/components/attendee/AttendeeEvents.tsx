import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Calendar, MapPin, Users, Clock, Loader2, Headphones, VolumeX } from "lucide-react";
import { useInView } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isFuture, isToday } from "date-fns";
import { EventType, normalizeEventData } from "@/utils/eventUtils";
import AudioPlayer from "./AudioPlayer";

// Use static data for demo presentation
const USE_STATIC_DATA = true;

// Extended EventType for the AttendeeEvents component
interface AttendeeEventType extends EventType {
  displayStatus: string;
  isLive: boolean;
  isAttending: boolean;
  speakers: string[];
  isListening?: boolean;
}

export default function AttendeeEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AttendeeEventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ref, isInView] = useInView<HTMLDivElement>();
  const [activeAudioEvent, setActiveAudioEvent] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        if (USE_STATIC_DATA) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          
          const demoEvents: AttendeeEventType[] = staticDemoData.events.map(event => {
            const baseEvent = normalizeEventData(event);
            const eventDate = new Date(`${baseEvent.date}T${baseEvent.time}`);
            const isLiveEvent = baseEvent.date === todayStr;
            
            let eventStatus: 'upcoming' | 'ongoing' | 'completed';
            let displayStatus: string;
            
            if (isLiveEvent) {
              eventStatus = 'ongoing';
              displayStatus = 'Live Now';
            } else if (isPast(eventDate) && !isToday(new Date(baseEvent.date))) {
              eventStatus = 'completed';
              displayStatus = 'Completed';
            } else if (isToday(new Date(baseEvent.date))) {
              eventStatus = 'ongoing';
              displayStatus = 'Today';
            } else if (isFuture(new Date(baseEvent.date))) {
              eventStatus = 'upcoming';
              displayStatus = 'Upcoming';
            } else {
              eventStatus = 'completed';
              displayStatus = 'Completed';
            }
            
            return {
              ...baseEvent,
              status: eventStatus,
              displayStatus: displayStatus,
              isAttending: Math.random() > 0.5,
              isLive: isLiveEvent,
              speakers: event.event_speakers?.map(speaker => speaker.name) || []
            } as AttendeeEventType;
          });
          
          setEvents(demoEvents);
          
          setTimeout(() => setIsLoading(false), 500);
          return;
        }
        
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            event_speakers(name)
          `)
          .order('date', { ascending: true });
        
        if (eventsError) throw eventsError;
        
        const { data: attendingData, error: attendingError } = await supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', user.id);
          
        if (attendingError) throw attendingError;
        
        const attendingEventIds = new Set(attendingData.map(item => item.event_id));
        
        const today = new Date().toISOString().split('T')[0];
        
        const formattedEvents: AttendeeEventType[] = (eventsData || []).map(event => {
          const normalizedEvent = normalizeEventData(event);
          const eventDate = new Date(`${normalizedEvent.date}T${normalizedEvent.time}`);
          const isLiveEvent = normalizedEvent.date === today;
          
          let eventStatus: 'upcoming' | 'ongoing' | 'completed';
          let displayStatus: string;
          
          if (isLiveEvent) {
            eventStatus = 'ongoing';
            displayStatus = 'Live Now';
          } else if (isPast(eventDate) && !isToday(new Date(normalizedEvent.date))) {
            eventStatus = 'completed';
            displayStatus = 'Completed';
          } else if (isToday(new Date(normalizedEvent.date))) {
            eventStatus = 'ongoing';
            displayStatus = 'Today';
          } else if (isFuture(new Date(normalizedEvent.date))) {
            eventStatus = 'upcoming';
            displayStatus = 'Upcoming';
          } else {
            eventStatus = 'completed';
            displayStatus = 'Completed';
          }
          
          return {
            ...normalizedEvent,
            status: eventStatus,
            displayStatus: displayStatus,
            isAttending: attendingEventIds.has(normalizedEvent.id),
            isLive: isLiveEvent,
            speakers: event.event_speakers?.map((speaker: any) => speaker.name) || []
          } as AttendeeEventType;
        });
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    
    try {
      if (USE_STATIC_DATA) {
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId 
              ? { ...event, isAttending: true } 
              : event
          )
        );
        
        toast.success("Successfully registered for the event");
        return;
      }
      
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .single();
        
      if (data) {
        toast.info("You're already registered for this event");
        return;
      }
      
      const { error: insertError } = await supabase
        .from('event_attendees')
        .insert({
          user_id: user.id,
          event_id: eventId,
          checked_in: false
        });
      
      if (insertError) throw insertError;
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, isAttending: true } 
            : event
        )
      );
      
      toast.success("Successfully registered for the event");
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Failed to register for the event");
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!user) return;
    
    try {
      if (USE_STATIC_DATA) {
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId 
              ? { ...event, isAttending: false } 
              : event
          )
        );
        
        toast.success("Registration cancelled");
        return;
      }
      
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);
      
      if (error) throw error;
      
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, isAttending: false } 
            : event
        )
      );
      
      toast.success("Registration cancelled");
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error("Failed to cancel registration");
    }
  };

  const toggleAudio = (eventId: string) => {
    if (activeAudioEvent === eventId) {
      setActiveAudioEvent(null);
      toast.info("Audio stopped");
      return;
    }
    
    setActiveAudioEvent(eventId);
    toast.success("Connected to live audio stream");
  };

  const getStatusBadge = (event: EventType) => {
    let color = "bg-gray-500";
    let label = event.displayStatus || event.status;
    
    if (event.isLive) {
      color = "bg-green-500";
    } else if (isPast(new Date(event.date)) && !isToday(new Date(event.date))) {
      color = "bg-gray-500";
    } else if (isToday(new Date(event.date))) {
      color = "bg-green-500";
    } else if (isFuture(new Date(event.date))) {
      color = "bg-blue-500";
    }
    
    return (
      <Badge className={`${color} text-white`}>
        {label}
      </Badge>
    );
  };

  const liveEvents = events.filter(event => event.isLive);
  
  const upcomingEvents = events.filter(event => 
    !event.isLive && 
    isFuture(new Date(`${event.date}T${event.time}`))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-6">
      {activeAudioEvent && <AudioPlayer eventId={activeAudioEvent} onStop={() => setActiveAudioEvent(null)} />}
      
      {liveEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Live Now</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {liveEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden border-green-500/30 bg-green-900/10">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    {getStatusBadge(event)}
                  </div>
                  <CardDescription>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{event.time}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                    {event.speakers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-sm font-medium">Speakers:</span>
                        {event.speakers.map((speaker, index) => (
                          <span key={index} className="text-sm">{speaker}{index < event.speakers.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    {event.isAttending ? (
                      <>
                        <AnimatedButton 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => handleCancelRegistration(event.id)}
                        >
                          Cancel Registration
                        </AnimatedButton>
                        <AnimatedButton 
                          variant={activeAudioEvent === event.id ? "destructive" : "secondary"}
                          onClick={() => toggleAudio(event.id)}
                        >
                          {activeAudioEvent === event.id ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Headphones className="w-4 h-4" />
                          )}
                        </AnimatedButton>
                      </>
                    ) : (
                      <AnimatedButton 
                        className="w-full" 
                        onClick={() => handleRegister(event.id)}
                      >
                        Join Now
                      </AnimatedButton>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      
      {upcomingEvents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No upcoming events available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  {getStatusBadge(event)}
                </div>
                <CardDescription>
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{format(new Date(event.date), 'MMM d, yyyy')} at {event.time}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Capacity: {event.capacity}</span>
                  </div>
                  {event.speakers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-sm font-medium">Speakers:</span>
                      {event.speakers.map((speaker, index) => (
                        <span key={index} className="text-sm">{speaker}{index < event.speakers.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="pt-2">
                  {event.isAttending ? (
                    <AnimatedButton 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleCancelRegistration(event.id)}
                    >
                      Cancel Registration
                    </AnimatedButton>
                  ) : (
                    <AnimatedButton 
                      className="w-full" 
                      onClick={() => handleRegister(event.id)}
                    >
                      Register
                    </AnimatedButton>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
