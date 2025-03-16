
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase, staticDemoData } from "@/integrations/supabase/client";
import { EventType } from "@/utils/eventUtils";

interface EventFormProps {
  onEventCreated: (newEvent: EventType) => void;
}

// Use static data for presentations
const USE_STATIC_DATA = true;

const EventForm: React.FC<EventFormProps> = ({ onEventCreated }) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<EventType, 'id'>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    venue: '',
    capacity: 100,
    status: 'upcoming',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setNewEvent({ ...newEvent, date: date.toISOString().split('T')[0] });
    }
  };

  const handleStatusChange = (status: EventType['status']) => {
    setNewEvent({ ...newEvent, status: status });
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.venue || !newEvent.capacity) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setIsCreating(true);

      if (USE_STATIC_DATA) {
        const newEventWithId: EventType = {
          id: Date.now().toString(),
          ...newEvent,
        };
        
        onEventCreated(newEventWithId);
        toast.success("Event created successfully!");
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([{ ...newEvent, created_by: user?.id }])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const createdEvents = data.map(event => ({
            ...event,
            time: newEvent.time // Ensure time is included
          })) as EventType[];
          
          onEventCreated(createdEvents[0]);
        }
        
        toast.success("Event created successfully!");
      }
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        venue: '',
        capacity: 100,
        status: 'upcoming',
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              type="text"
              id="venue"
              name="venue"
              value={newEvent.venue}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Input
                  type="text"
                  id="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className={cn("peer-focus:ring-0", !newEvent.date && "text-muted-foreground")}
                  placeholder={format(new Date(), "PPP")}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newEvent.date ? new Date(newEvent.date) : undefined}
                  onSelect={handleDateChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              type="number"
              id="capacity"
              name="capacity"
              value={newEvent.capacity}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={newEvent.description}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={(value) => handleStatusChange(value as EventType['status'])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AnimatedButton onClick={createEvent} disabled={isCreating} className="w-full">
          {isCreating ? "Creating..." : "Create Event"}
        </AnimatedButton>
      </CardContent>
    </Card>
  );
};

export default EventForm;
