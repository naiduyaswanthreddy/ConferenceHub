
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { X, Plus, Minus, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EventFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    venue?: string;
    capacity?: number;
    status?: "upcoming" | "ongoing" | "completed";
    event_speakers?: { name: string }[];
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function EventForm({ initialData, onSubmit, onCancel }: EventFormProps) {
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    time: "12:00",
    venue: "",
    capacity: 100,
    speakers: [] as string[],
    description: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed"
  });

  useEffect(() => {
    if (initialData) {
      setNewEvent({
        title: initialData.title || "",
        date: initialData.date || new Date().toISOString().split('T')[0],
        time: initialData.time || "12:00",
        venue: initialData.venue || "",
        capacity: initialData.capacity || 100,
        speakers: initialData.event_speakers ? initialData.event_speakers.map(s => s.name) : [],
        description: initialData.description || "",
        status: initialData.status || "upcoming"
      });
    }
  }, [initialData]);

  const handleAddSpeaker = () => {
    setNewEvent(prev => ({
      ...prev,
      speakers: [...prev.speakers, ""]
    }));
  };

  const handleRemoveSpeaker = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };

  const handleSpeakerChange = (index: number, value: string) => {
    setNewEvent(prev => {
      const newSpeakers = [...prev.speakers];
      newSpeakers[index] = value;
      return {
        ...prev,
        speakers: newSpeakers
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...newEvent,
      speakers: newEvent.speakers.filter(s => s.trim() !== "")
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black/80 border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white">{initialData ? "Edit Event" : "Create New Event"}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-white">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1 text-white">
                Event Title
              </label>
              <Input
                id="title"
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1 text-white">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full bg-gray-800/50 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-1 text-white">
                  Time
                </label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full bg-gray-800/50 border-gray-700 text-white"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="venue" className="block text-sm font-medium mb-1 text-white">
                Venue
              </label>
              <Input
                id="venue"
                type="text"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                required
              />
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium mb-1 text-white">
                Capacity
              </label>
              <Input
                id="capacity"
                type="number"
                value={newEvent.capacity}
                onChange={(e) => setNewEvent({ ...newEvent, capacity: Number(e.target.value) })}
                className="w-full bg-gray-800/50 border-gray-700 text-white"
                min="1"
                required
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1 text-white">
                Status
              </label>
              <select
                id="status"
                value={newEvent.status}
                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as "upcoming" | "ongoing" | "completed" })}
                className="w-full p-2 border bg-gray-800/50 border-gray-700 text-white rounded-md"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Speakers
              </label>
              <div className="space-y-2">
                {newEvent.speakers.map((speaker, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      value={speaker}
                      onChange={(e) => handleSpeakerChange(index, e.target.value)}
                      className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                      placeholder="Speaker name"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpeaker(index)}
                      className="p-2 bg-red-500/80 text-white rounded-md hover:bg-red-600"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSpeaker}
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Speaker
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1 text-white">
                Description
              </label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <AnimatedButton variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </AnimatedButton>
              <AnimatedButton type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                {initialData ? "Update Event" : "Create Event"}
              </AnimatedButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
