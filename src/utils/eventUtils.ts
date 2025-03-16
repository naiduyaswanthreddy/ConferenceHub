
import { supabase, staticDemoData } from "@/integrations/supabase/client";

export interface EventType {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string; // Ensure time is non-optional since it's used in multiple components
  venue: string;
  capacity: number;
  status: "upcoming" | "ongoing" | "completed";
  created_by?: string;
  event_speakers?: Array<{ name: string }>;
  // Additional properties used in AttendeeEvents.tsx
  displayStatus?: string;
  isLive?: boolean;
  isAttending?: boolean;
  speakers?: string[];
}

export interface MicRequestData {
  id: string;
  event_id: string;
  user_id: string;
  reason: string;
  status: string;
  created_at: string;
  profiles: { name: string };
  events: { title: string };
}

export interface ComplaintData {
  id: string;
  event_id: string;
  user_id: string;
  issue_type: string;
  description: string;
  status: string;
  created_at: string;
  events: { title: string };
  profiles: { name: string };
}

export interface FeedbackData {
  id: string;
  user_id: string;
  event_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { name: string };
  events: { title: string };
}

export const normalizeEventData = (eventData: any): EventType => {
  // Ensure consistent structure between static and Supabase data
  return {
    id: eventData.id,
    title: eventData.title,
    description: eventData.description || '',
    date: eventData.date,
    time: eventData.time || '09:00', // Default time if not provided
    venue: eventData.venue,
    capacity: eventData.capacity || 100,
    status: eventData.status || 'upcoming',
    created_by: eventData.created_by,
    event_speakers: eventData.event_speakers || [],
    // Additional properties for AttendeeEvents
    displayStatus: eventData.displayStatus,
    isLive: eventData.isLive,
    isAttending: eventData.isAttending,
    speakers: eventData.speakers || []
  };
};

// Create a function to normalize MicRequestData
export const normalizeMicRequestData = (requestData: any): MicRequestData => {
  return {
    id: requestData.id,
    event_id: requestData.event_id || '',
    user_id: requestData.user_id || '',
    reason: requestData.reason || '',
    status: requestData.status || 'pending',
    created_at: requestData.created_at || new Date().toISOString(),
    profiles: requestData.profiles || { name: requestData.user_name || 'Unknown User' },
    events: requestData.events || { title: requestData.event_title || 'Unknown Event' }
  };
};

// Create a function to normalize ComplaintData
export const normalizeComplaintData = (complaintData: any): ComplaintData => {
  return {
    id: complaintData.id,
    event_id: complaintData.event_id || '',
    user_id: complaintData.user_id || '',
    issue_type: complaintData.issue_type || '',
    description: complaintData.description || '',
    status: complaintData.status || 'pending',
    created_at: complaintData.created_at || new Date().toISOString(),
    profiles: complaintData.profiles || { name: complaintData.user_name || 'Unknown User' },
    events: complaintData.events || { title: complaintData.event_title || 'Unknown Event' }
  };
};

export const fetchAllEvents = async (useStaticData = true): Promise<EventType[]> => {
  if (useStaticData) {
    return staticDemoData.events.map(normalizeEventData);
  }

  try {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;
    
    return (data || []).map(normalizeEventData);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

// Check if an event is currently live based on date and time
export const isEventLive = (event: EventType): boolean => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  // Set event time if available
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    eventDate.setHours(hours, minutes);
  }
  
  // Event is live if it's today and within a reasonable time window (3 hours)
  const eventEndTime = new Date(eventDate);
  eventEndTime.setHours(eventEndTime.getHours() + 3);
  
  return now >= eventDate && now <= eventEndTime;
};

export const getUpcomingEvents = (events: EventType[]): EventType[] => {
  const now = new Date();
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate > now || isEventLive(event);
  });
};

export const getLiveEvents = (events: EventType[]): EventType[] => {
  return events.filter(isEventLive);
};
