
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Calendar, MapPin, Users, Clock, MoreVertical, Trash, Edit, Eye, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface EventProps {
  event: {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    venue: string;
    capacity: number;
    status: "upcoming" | "ongoing" | "completed";
  };
  onRefresh: () => void;
  onShare: () => void;
}

export default function EventCard({ event, onRefresh, onShare }: EventProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast.success("Event deleted successfully");
      onRefresh();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl truncate">{event.title}</CardTitle>
          <div className="relative" ref={menuRef}>
            <button
              className="p-1 rounded-full hover:bg-gray-800 transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden">
                <div className="py-1">
                  <Link 
                    to={`/event/${event.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => setShowMenu(false)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <button 
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setShowMenu(false);
                      onShare();
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </button>
                  <button 
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </button>
                  <button 
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center mt-2">
          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-400">
            {format(new Date(event.date), 'MMM d, yyyy')}
          </span>
          {event.time && (
            <>
              <Clock className="w-4 h-4 text-gray-400 ml-2 mr-1" />
              <span className="text-sm text-gray-400">{event.time}</span>
            </>
          )}
          <span className="mx-2 text-gray-600">•</span>
          <Badge
            className={`
              ${event.status === 'upcoming' ? 'bg-blue-500' : 
                event.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-500'}
            `}
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {event.description && (
          <p className="text-sm text-gray-400 line-clamp-2">{event.description}</p>
        )}
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-300">{event.venue}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-300">Capacity: {event.capacity}</span>
          </div>
        </div>
        
        <div className="pt-2 flex">
          <Link to={`/event/${event.id}`} className="flex-1">
            <AnimatedButton className="w-full">
              View Details
            </AnimatedButton>
          </Link>
          <AnimatedButton 
            variant="outline" 
            className="ml-2"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
          </AnimatedButton>
        </div>
      </CardContent>
    </Card>
  );
}
