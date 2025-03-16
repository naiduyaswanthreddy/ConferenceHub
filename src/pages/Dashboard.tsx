
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { usePageTransition } from "@/lib/animations";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminPanel from "@/components/dashboard/AdminPanel";
import OrganizerPanel from "@/components/dashboard/OrganizerPanel";
import AttendeePanel from "@/components/dashboard/AttendeePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import NavigationMenu, { PanelType } from "@/components/dashboard/NavigationMenu";

export default function Dashboard() {
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const [activePanel, setActivePanel] = useState<PanelType>("dashboard");
  const pageTransition = usePageTransition('fadeIn');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const panelParam = params.get('panel');
    
    if (panelParam && isPanelType(panelParam)) {
      setActivePanel(panelParam as PanelType);
    }
    else if (location.state?.targetPanel && isPanelType(location.state.targetPanel)) {
      setActivePanel(location.state.targetPanel as PanelType);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const isPanelType = (panel: string): panel is PanelType => {
    return ["dashboard", "events", "users", "reports", "settings", "notifications", 
            "mics", "feedback", "polls", "seats", "checkin", "profile"].includes(panel);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-pulse-subtle">Loading dashboard...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role === "admin";
  const isOrganizer = user?.role === "organizer";
  const isAttendee = user?.role === "attendee";

  const handlePanelChange = (panel: PanelType) => {
    setActivePanel(panel);
    navigate(`/dashboard?panel=${panel}`, { state: { targetPanel: panel } });
  };

  return (
    <div className={cn("min-h-screen pt-16 bg-gray-950 text-white", pageTransition)}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <NavigationMenu 
          role={user?.role}
          activePanel={activePanel}
          onPanelChange={handlePanelChange}
          onSignOut={signOut}
        />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {isAdmin && <AdminPanel activePanel={activePanel} />}
          {isOrganizer && <OrganizerPanel activePanel={activePanel} />}
          {isAttendee && <AttendeePanel activePanel={activePanel} />}
          {!isAdmin && !isOrganizer && !isAttendee && (
            <div className="h-full flex items-center justify-center">
              <Card className="max-w-md w-full bg-gray-900 border-0 shadow-lg shadow-purple-900/10">
                <CardHeader>
                  <CardTitle>Access Restricted</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    You don't have permission to access the dashboard. Please contact an administrator.
                  </p>
                  <AnimatedButton onClick={signOut}>
                    Go Back
                  </AnimatedButton>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
