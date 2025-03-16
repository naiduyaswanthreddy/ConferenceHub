
import React, { useEffect } from "react";
import { usePageTransition } from "@/lib/animations";
import EventManagement from "@/components/dashboard/EventManagement";
import SystemSettings from "@/components/dashboard/SystemSettings";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import RequestsManagement from "@/components/admin/RequestsManagement";
import FeedbackManagement from "@/components/admin/FeedbackManagement";
import DashboardStats from "@/components/admin/DashboardStats";
import UserManagement from "@/components/admin/UserManagement";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import { useNavigate } from "react-router-dom";

interface AdminPanelProps {
  activePanel: string;
}

export default function AdminPanel({ activePanel }: AdminPanelProps) {
  const pageTransition = usePageTransition();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePanel]);

  const handleRequestClick = (type: string = 'mics') => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate("/dashboard", { state: { targetPanel: type } });
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "dashboard":
        return <DashboardStats onRequestClick={handleRequestClick} />;
      case "events":
        return <EventManagement />;
      case "users":
        return <UserManagement />;
      case "reports":
        return <AnalyticsPanel />;
      case "settings":
        return <SystemSettings />;
      case "notifications":
        return <NotificationsPanel />;
      case "mics":
        return <RequestsManagement />;
      case "feedback":
        return <FeedbackManagement />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Feature Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This feature is under development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className={pageTransition}>
      {renderPanel()}
    </div>
  );
}
