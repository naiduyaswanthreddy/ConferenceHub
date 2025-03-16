import React from 'react';
import { Card, CardContent } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ChevronDown, Users } from "lucide-react";

interface SeatAvailabilityProps {
  mode?: 'attendee' | 'organizer' | 'admin';
}

export default function SeatAvailability({ mode = 'attendee' }: SeatAvailabilityProps) {
  const [selectedSection, setSelectedSection] = React.useState('Main Hall');
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Mock section data
  const sections = [
    { name: 'Main Hall', total: 200, available: 45 },
    { name: 'Workshop Room A', total: 50, available: 12 },
    { name: 'Workshop Room B', total: 50, available: 8 },
    { name: 'VIP Lounge', total: 30, available: 4 }
  ];
  
  const currentSection = sections.find(s => s.name === selectedSection) || sections[0];
  const availabilityPercentage = Math.round((currentSection.available / currentSection.total) * 100);
  
  // For organizer/admin mode
  if (mode === 'organizer' || mode === 'admin') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2">
          <h3 className="text-lg font-medium">Seat Occupancy</h3>
          <AnimatedButton variant="outline" size="sm">Update</AnimatedButton>
        </div>
        
        <div className="space-y-3">
          {sections.map((section) => {
            const sectionPercentage = Math.round((section.available / section.total) * 100);
            const colorClass = 
              sectionPercentage > 50 ? "text-green-500" : 
              sectionPercentage > 20 ? "text-amber-500" : 
              "text-red-500";
            
            return (
              <div key={section.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{section.name}</span>
                  <span className={colorClass}>
                    {section.available}/{section.total} available
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${
                      sectionPercentage > 50 ? "bg-green-500" : 
                      sectionPercentage > 20 ? "bg-amber-500" : 
                      "bg-red-500"
                    }`}
                    style={{ width: `${100 - sectionPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground pt-2">
          <span>Total capacity: 330</span>
          <span>Total available: 69</span>
        </div>
      </div>
    );
  }

  // Attendee view
  return (
    <div className="space-y-4">
      <div 
        className="flex justify-between items-center p-3 border rounded-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-medium">{selectedSection}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
      
      {isExpanded && (
        <div className="p-3 border rounded-lg space-y-2">
          {sections.map((section) => (
            <div 
              key={section.name}
              className={`p-2 cursor-pointer rounded-md transition-colors ${
                selectedSection === section.name 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-secondary'
              }`}
              onClick={() => {
                setSelectedSection(section.name);
                setIsExpanded(false);
              }}
            >
              {section.name}
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-primary/5 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Current Availability</h3>
          <span 
            className={`text-sm font-medium ${
              availabilityPercentage > 50 ? "text-green-500" : 
              availabilityPercentage > 20 ? "text-amber-500" : 
              "text-red-500"
            }`}
          >
            {currentSection.available} seats left
          </span>
        </div>
        
        <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              availabilityPercentage > 50 ? "bg-green-500" : 
              availabilityPercentage > 20 ? "bg-amber-500" : 
              "bg-red-500"
            }`}
            style={{ width: `${100 - availabilityPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Total capacity: {currentSection.total}</span>
          <span>{Math.round((currentSection.total - currentSection.available) / currentSection.total * 100)}% full</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <AnimatedButton variant="default" className="flex-1">
          Reserve Seat
        </AnimatedButton>
        <AnimatedButton variant="outline" className="flex-1">
          Notify Me
        </AnimatedButton>
      </div>
    </div>
  );
}
