
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePageTransition } from "@/lib/animations";
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Check, QrCode } from "lucide-react";
import { format } from "date-fns";
import QRCode from "react-qr-code";

interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  capacity: number;
  status: string;
  created_by: string;
  speakers: { id: string; name: string }[];
}

export default function EventView() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const pageTransition = usePageTransition();

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      
      // Setup realtime subscription for this event
      const channel = supabase
        .channel(`event-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
            filter: `id=eq.${id}`,
          },
          () => {
            fetchEventDetails();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && user && id) {
      checkRegistrationStatus();
    }
  }, [isAuthenticated, user, id]);

  const fetchEventDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (eventError) throw eventError;
      if (!eventData) {
        toast.error("Event not found");
        navigate('/');
        return;
      }
      
      // Fetch speakers for this event
      const { data: speakersData, error: speakersError } = await supabase
        .from('event_speakers')
        .select('id, name')
        .eq('event_id', id);
      
      if (speakersError) throw speakersError;
      
      setEvent({
        ...eventData,
        speakers: speakersData || []
      });
      
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast.error("Failed to load event details");
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!id || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is expected if user is not registered
        console.error("Error checking registration status:", error);
        return;
      }
      
      setIsRegistered(!!data);
      setIsCheckedIn(data?.checked_in || false);
      
    } catch (error) {
      console.error("Failed to check registration status:", error);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to register for this event");
      navigate('/login');
      return;
    }
    
    if (!id || !user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: id,
          user_id: user.id,
          checked_in: false
        });
      
      if (error) throw error;
      
      toast.success("Successfully registered for this event");
      setIsRegistered(true);
      
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Failed to register for this event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!id || !user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success("Registration cancelled");
      setIsRegistered(false);
      setIsCheckedIn(false);
      
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error("Failed to cancel registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!id || !user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('event_attendees')
        .update({ checked_in: true })
        .eq('event_id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success("Successfully checked in to the event");
      setIsCheckedIn(true);
      
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Failed to check in");
    } finally {
      setIsLoading(false);
    }
  };

  const getCheckInQRCode = () => {
    if (!id) return null;
    
    const checkInUrl = `${window.location.origin}/event/${id}/checkin?userId=${user?.id}`;
    
    return (
      <div className="flex flex-col items-center p-6 bg-gray-900 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Your Check-in QR Code</h3>
        <QRCode value={checkInUrl} size={200} className="mb-4" />
        <p className="text-sm text-center text-gray-400 mb-4">
          Show this QR code to the event staff when you arrive.
        </p>
        <AnimatedButton 
          variant="ghost" 
          className="mt-2"
          onClick={() => setShowQRCode(false)}
        >
          Close
        </AnimatedButton>
      </div>
    );
  };

  if (isLoading && !event) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>
              The event you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <AnimatedButton className="w-full">
                Return Home
              </AnimatedButton>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 px-4 max-w-5xl mx-auto ${pageTransition}`}>
      <div className="mb-6 flex items-center">
        <Link to="/" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-2 inline-block" />
          Back
        </Link>
      </div>
      
      {showQRCode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          {getCheckInQRCode()}
        </div>
      )}
      
      <Card className="mb-8 overflow-hidden border-none shadow-lg bg-gray-900/80 backdrop-blur">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold mb-2">{event.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : 
                    event.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 
                    'bg-gray-500/20 text-gray-400'}`}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-medium">{format(new Date(event.date), 'MMMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">Venue</p>
                <p className="font-medium">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">Capacity</p>
                <p className="font-medium">{event.capacity} people</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-lg font-medium mb-2">About this event</h3>
            <p className="text-gray-300 whitespace-pre-line">
              {event.description || 'No description provided.'}
            </p>
          </div>
          
          {event.speakers.length > 0 && (
            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-lg font-medium mb-3">Speakers</h3>
              <div className="space-y-3">
                {event.speakers.map(speaker => (
                  <div key={speaker.id} className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">{speaker.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{speaker.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-6 flex flex-wrap gap-3">
            {isRegistered ? (
              <>
                {isCheckedIn ? (
                  <AnimatedButton 
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                    disabled
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Checked In
                  </AnimatedButton>
                ) : (
                  <>
                    <AnimatedButton 
                      className="flex-1"
                      onClick={handleCheckIn}
                    >
                      Check In
                    </AnimatedButton>
                    <AnimatedButton 
                      variant="outline"
                      onClick={() => setShowQRCode(true)}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Check-in QR
                    </AnimatedButton>
                  </>
                )}
                <AnimatedButton 
                  variant="destructive" 
                  onClick={handleCancelRegistration}
                >
                  Cancel Registration
                </AnimatedButton>
              </>
            ) : (
              <AnimatedButton 
                className="w-full" 
                onClick={handleRegister}
              >
                Register for this Event
              </AnimatedButton>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
