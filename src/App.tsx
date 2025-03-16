
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import EventView from "@/pages/EventView";
import NotFound from "@/pages/NotFound";
import { Toaster as SonnerToaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative">
              <div className="absolute inset-0 bg-grid-white/[0.02] -z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent -z-10"></div>
              <Navbar />
              <main className="flex-1 pt-16">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard/*" element={<Dashboard />} />
                  <Route path="/event/:id" element={<EventView />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
          <SonnerToaster toastOptions={{ duration: 3000 }} closeButton position="top-right" />
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
