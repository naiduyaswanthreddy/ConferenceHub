import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import QRCheckIn from "@/components/attendee/QRCheckIn";
import LivePolling from "@/components/attendee/LivePolling";
import SeatAvailability from "@/components/attendee/SeatAvailability";
import MicRequest from "@/components/attendee/MicRequest";
import AttendeeEvents from "@/components/attendee/AttendeeEvents";
import FeedbackForm from "@/components/attendee/FeedbackForm";
import ComplaintForm from "@/components/attendee/ComplaintForm";
import AttendeeProfile from "@/components/attendee/AttendeeProfile";
import Leaderboard from "@/components/attendee/Leaderboard";
import { useAuth } from "@/context/AuthContext";
import { staticDemoData } from "@/integrations/supabase/client";
import { Calendar, QrCode, Mic, ChevronRight, Trophy, Headphones } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useNavigate } from "react-router-dom";
import { format, isToday } from "date-fns";

interface AttendeePanelProps {
  activePanel: string;
}

interface EventType {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
}

const AttendeePanel: React.FC<AttendeePanelProps> = ({ activePanel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
  const [liveEvents, setLiveEvents] = useState<EventType[]>([]);
  
  const [loadedPanels, setLoadedPanels] = useState<Record<string, boolean>>({
    dashboard: true
  });

  useEffect(() => {
    setLoadedPanels(prev => ({
      ...prev,
      [activePanel]: true
    }));
  }, [activePanel]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const allEvents = staticDemoData.events;
    
    const liveEvts = allEvents
      .filter(event => event.date === today)
      .map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time || "12:00",
        venue: event.venue
      }));
    
    const upcomingEvts = allEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now && event.date !== today;
      })
      .map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time || "12:00",
        venue: event.venue
      }))
      .slice(0, 3);
    
    setLiveEvents(liveEvts);
    setUpcomingEvents(upcomingEvts);
  };

  const goToPanel = (panel: string) => {
    setActivePanel(panel);
  };

  const setActivePanel = (panel: string) => {
    window.history.pushState({targetPanel: panel}, "", `/dashboard?panel=${panel}`);
    navigate(`/dashboard?panel=${panel}`, { state: { targetPanel: panel } });
  };

  return (
    <div>
      {loadedPanels["dashboard"] && activePanel === "dashboard" && (
        <div>
          <h1 className="text-2xl font-bold mb-6 text-white">Attendee Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveEvents.length > 0 && (
              <Card 
                className="overflow-hidden border-gray-700/30 bg-black/40 backdrop-blur-md hover:bg-black/60 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => goToPanel("events")}
              >
                <CardHeader className="bg-black/60 text-white">
                  <CardTitle className="text-center text-white">
                    Live Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {liveEvents.map(event => (
                      <div key={event.id} className="p-2 border border-gray-700/30 rounded-md">
                        <h3 className="font-medium text-white">{event.title}</h3>
                        <p className="text-sm text-gray-400">{event.venue} at {event.time}</p>
                        <div className="mt-1">
                          <AnimatedButton 
                            variant="subtle" 
                            className="w-full mt-1 text-xs py-1 h-7" 
                            onClick={(e) => {
                              e.stopPropagation();
                              goToPanel("events");
                            }}
                          >
                            <Headphones className="w-3 h-3 mr-1" />
                            Listen Audio
                          </AnimatedButton>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <AnimatedButton 
                      variant="outline" 
                      className="w-full hover:bg-white/10 hover:text-white" 
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPanel("events");
                      }}
                    >
                      View Live Sessions
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </AnimatedButton>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card 
              className="overflow-hidden border-gray-700/30 bg-black/40 backdrop-blur-md hover:bg-black/60 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => goToPanel("events")}
            >
              <CardHeader className="bg-black/60 text-white">
                <CardTitle className="text-center text-white">
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="p-2 border border-gray-700 rounded-md">
                        <h3 className="font-medium text-white">{event.title}</h3>
                        <p className="text-sm text-gray-400">{format(new Date(event.date), 'MMM d, yyyy')} at {event.time}</p>
                      </div>
                    ))}
                    <div className="mt-2">
                      <AnimatedButton 
                        variant="outline" 
                        className="w-full hover:bg-white/10 hover:text-white" 
                        onClick={(e) => {
                          e.stopPropagation();
                          goToPanel("events");
                        }}
                      >
                        View All Events
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 mb-4">No upcoming events scheduled.</p>
                )}
              </CardContent>
            </Card>
            
            <Card 
              className="overflow-hidden border-gray-700/30 bg-black/40 backdrop-blur-md hover:bg-black/60 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => goToPanel("checkin")}
            >
              <CardHeader className="bg-black/60 text-white">
                <CardTitle className="text-center text-white">
                  Quick Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-gray-400">Scan the QR code at the event entrance.</p>
                <AnimatedButton 
                  variant="outline"
                  className="w-full hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPanel("checkin");
                  }}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Open Scanner
                </AnimatedButton>
              </CardContent>
            </Card>
            
            <Card 
              className="overflow-hidden border-gray-700/30 bg-black/40 backdrop-blur-md hover:bg-black/60 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => goToPanel("mics")}
            >
              <CardHeader className="bg-black/60 text-white">
                <CardTitle className="text-center text-white">
                  Microphone Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-gray-400">Request to speak during Q&A sessions.</p>
                <AnimatedButton 
                  variant="outline"
                  className="w-full hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPanel("mics");
                  }}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Request Mic
                </AnimatedButton>
              </CardContent>
            </Card>
            
            <Card 
              className="overflow-hidden border-gray-700/30 bg-black/40 backdrop-blur-md hover:bg-black/60 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => goToPanel("feedback")}
            >
              <CardHeader className="bg-black/60 text-white">
                <CardTitle className="text-center text-white">
                  Share Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-gray-400">Let us know about your experience.</p>
                <AnimatedButton 
                  variant="outline"
                  className="w-full hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPanel("feedback");
                  }}
                >
                  Share Feedback
                </AnimatedButton>
              </CardContent>
            </Card>
            
            <Card 
              className="overflow-hidden border-gray-700/30 bg-black/40 backdrop-blur-md hover:bg-black/60 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => goToPanel("seats")}
            >
              <CardHeader className="bg-black/60 text-white">
                <CardTitle className="text-center text-white">
                  Seat Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-gray-400">Check available seats at the venue.</p>
                <AnimatedButton 
                  variant="outline"
                  className="w-full hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPanel("seats");
                  }}
                >
                  Check Seats
                </AnimatedButton>
              </CardContent>
            </Card>
            
            <Card 
              className="overflow-hidden border-gray-700/30 bg-black/40 backdrop-blur-md hover:bg-black/60 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => goToPanel("reports")}
            >
              <CardHeader className="bg-black/60 text-white">
                <CardTitle className="text-center text-white">
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-gray-400">See who's leading in event participation.</p>
                <AnimatedButton 
                  variant="outline"
                  className="w-full hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPanel("reports");
                  }}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  View Leaderboard
                </AnimatedButton>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {loadedPanels["mics"] && activePanel === "mics" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Mic Requests</h1>
          <MicRequest />
        </div>
      )}
      
      {loadedPanels["polls"] && activePanel === "polls" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Live Polls</h1>
          <LivePolling />
        </div>
      )}
      
      {loadedPanels["seats"] && activePanel === "seats" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Seat Availability</h1>
          <SeatAvailability />
        </div>
      )}
      
      {loadedPanels["checkin"] && activePanel === "checkin" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">QR Check-in</h1>
          <QRCheckIn />
        </div>
      )}
      
      {loadedPanels["events"] && activePanel === "events" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Live Sessions</h1>
          <AttendeeEvents />
        </div>
      )}
      
      {loadedPanels["feedback"] && activePanel === "feedback" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Submit Feedback</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeedbackForm />
            <ComplaintForm />
          </div>
        </div>
      )}
      
      {loadedPanels["reports"] && activePanel === "reports" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
          <Leaderboard />
        </div>
      )}
      
      {loadedPanels["profile"] && activePanel === "profile" && (
        <div>
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          <AttendeeProfile />
        </div>
      )}
    </div>
  );
};

export default AttendeePanel;
