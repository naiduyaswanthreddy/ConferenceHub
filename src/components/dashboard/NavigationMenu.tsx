
import React from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings,
  BarChart4,
  BellRing,
  Mic,
  MessageSquare,
  LogOut,
  QrCode,
  MapPin,
  Radio,
  Trophy,
  User,
  Headphones
} from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

interface NavItemProps {
  icon: React.ElementType;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, title, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full p-3 rounded-lg text-left transition-all",
      isActive ? 
        "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-md shadow-purple-900/20" : 
        "text-gray-300 hover:bg-gray-800 hover:text-white"
    )}
  >
    <Icon size={20} />
    <span>{title}</span>
  </button>
);

export type PanelType = "dashboard" | "events" | "users" | "reports" | "settings" | "notifications" | "mics" | "feedback" | "polls" | "seats" | "checkin" | "profile";

interface NavigationMenuProps {
  role: string | undefined;
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
  onSignOut: () => void;
}

export default function NavigationMenu({ 
  role, 
  activePanel, 
  onPanelChange, 
  onSignOut 
}: NavigationMenuProps) {
  const isAdmin = role === "admin";
  const isOrganizer = role === "organizer";
  const isAttendee = role === "attendee";
  
  const getNavItems = () => {
    const adminItems = [
      { title: "Dashboard", icon: LayoutDashboard, panel: "dashboard" as PanelType },
      { title: "Events", icon: Calendar, panel: "events" as PanelType },
      { title: "Users", icon: Users, panel: "users" as PanelType },
      { title: "Analytics", icon: BarChart4, panel: "reports" as PanelType },
      { title: "Notifications", icon: BellRing, panel: "notifications" as PanelType },
      { title: "Mic Requests", icon: Mic, panel: "mics" as PanelType },
      { title: "Feedback", icon: MessageSquare, panel: "feedback" as PanelType },
      { title: "Settings", icon: Settings, panel: "settings" as PanelType },
    ];
    
    const organizerItems = [
      { title: "Dashboard", icon: LayoutDashboard, panel: "dashboard" as PanelType },
      { title: "Events", icon: Calendar, panel: "events" as PanelType },
      { title: "Attendees", icon: Users, panel: "users" as PanelType },
      { title: "Notifications", icon: BellRing, panel: "notifications" as PanelType },
      { title: "Mic Requests", icon: Mic, panel: "mics" as PanelType },
      { title: "Feedback", icon: MessageSquare, panel: "feedback" as PanelType },
      { title: "Settings", icon: Settings, panel: "settings" as PanelType },
    ];
    
    const attendeeItems = [
      { title: "Dashboard", icon: LayoutDashboard, panel: "dashboard" as PanelType },
      { title: "Live Sessions", icon: Radio, panel: "events" as PanelType },
      { title: "Mic Request", icon: Mic, panel: "mics" as PanelType },
      { title: "Live Polls", icon: BarChart4, panel: "polls" as PanelType },
      { title: "Seat Availability", icon: MapPin, panel: "seats" as PanelType },
      { title: "QR Check-in", icon: QrCode, panel: "checkin" as PanelType },
      { title: "Leaderboard", icon: Trophy, panel: "reports" as PanelType },
      { title: "Feedback", icon: MessageSquare, panel: "feedback" as PanelType },
      { title: "Profile", icon: User, panel: "profile" as PanelType },
    ];
    
    if (isAdmin) return adminItems;
    if (isOrganizer) return organizerItems;
    if (isAttendee) return attendeeItems;
    
    return [];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-full md:w-64 lg:w-72 border-r border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
          isAdmin ? "bg-gradient-to-br from-purple-600 to-indigo-600" :
          isOrganizer ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
          "bg-gradient-to-br from-orange-500 to-amber-500"
        )}>
          {role?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-white">User</p>
          <p className="text-xs text-gray-400 truncate">
            {role?.charAt(0).toUpperCase() + role?.slice(1)}
          </p>
        </div>
      </div>

      <nav className="space-y-1 mb-8">
        {navItems.map((item) => (
          <NavItem
            key={item.title}
            icon={item.icon}
            title={item.title}
            isActive={activePanel === item.panel}
            onClick={() => onPanelChange(item.panel)}
          />
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-800">
        <AnimatedButton
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={onSignOut}
        >
          <LogOut size={18} className="mr-2" />
          Sign Out
        </AnimatedButton>
      </div>
    </aside>
  );
}
