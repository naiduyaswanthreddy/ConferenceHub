
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import EventManagement from "./EventManagement";
import MicRequest from "../attendee/MicRequest";
import RequestsManagement from "../admin/RequestsManagement";
import OrganizerDashboard from "../organizer/OrganizerDashboard";

interface OrganizerPanelProps {
  activePanel?: string;
}

export default function OrganizerPanel({ activePanel = "dashboard" }: OrganizerPanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internalActiveTab, setInternalActiveTab] = useState<string>(activePanel);
  
  useEffect(() => {
    if (activePanel) {
      setInternalActiveTab(activePanel);
    }
  }, [activePanel]);

  const handleRequestClick = (type: string) => {
    setInternalActiveTab('requests');
  };

  return (
    <div className="container p-4 mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
      
      <Tabs value={internalActiveTab} onValueChange={setInternalActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <OrganizerDashboard onRequestClick={handleRequestClick} />
        </TabsContent>
        
        <TabsContent value="events">
          <EventManagement />
        </TabsContent>
        
        <TabsContent value="requests">
          <RequestsManagement />
        </TabsContent>
        
        {internalActiveTab === "mics" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Microphone Requests</h2>
            <MicRequest />
          </div>
        )}
      </Tabs>
    </div>
  );
}
