
import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useInView, usePageTransition } from "@/lib/animations";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import FeatureCard from "@/components/landing/FeatureCard";
import { 
  Mic, 
  Radio, 
  BarChart3, 
  Trophy, 
  Clock, 
  QrCode, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  ChevronRight,
  Book
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const features = [
  {
    icon: Mic,
    title: "Mic Sharing",
    description: "Enable virtual mic sharing for audience participation without passing physical microphones."
  },
  {
    icon: Radio,
    title: "Live Audio Streaming",
    description: "Stream audio directly to attendees' devices for perfect clarity regardless of venue acoustics."
  },
  {
    icon: BarChart3,
    title: "Live Polling",
    description: "Capture real-time feedback and engage your audience with interactive polls and surveys."
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Increase engagement with points, badges, and leaderboards for participation."
  },
  {
    icon: Clock,
    title: "Queue Management",
    description: "Streamline Q&A sessions with a digital queue system for audience questions."
  },
  {
    icon: QrCode,
    title: "Digital Check-In",
    description: "Simplify event entry with QR code-based check-ins and registrations."
  },
  {
    icon: Users,
    title: "Seat Tracking",
    description: "Monitor venue capacity with real-time seat availability tracking."
  },
  {
    icon: MessageSquare,
    title: "Feedback Collection",
    description: "Gather valuable insights with our intuitive feedback collection system."
  },
  {
    icon: AlertTriangle,
    title: "Complaint Reporting",
    description: "Address issues promptly with our real-time complaint and issue reporting system."
  }
];

export default function Index() {
  const { isAuthenticated } = useAuth();
  const pageTransition = usePageTransition('fadeIn');
  const [heroRef, heroInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [aboutRef, aboutInView] = useInView();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Handle smooth scrolling when URL contains hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);
  
  const handleFeatureClick = (feature: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: `Please sign in to use the ${feature} feature.`,
        variant: "default",
      });
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  };
  
  return (
    <div className={cn("min-h-screen", pageTransition)}>
      <section 
        ref={heroRef} 
        className={cn(
          "min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden transition-opacity duration-1000",
          heroInView ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
        
        <div className="max-w-3xl mx-auto text-center space-y-8 pt-20">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Revolutionizing Conferences
          </span>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="block">Smart Conference</span>
            <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elevate your events with real-time engagement, seamless check-ins, and powerful management tools.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <AnimatedButton 
                  size="lg" 
                  className="font-medium"
                >
                  Go to Dashboard
                </AnimatedButton>
              </Link>
            ) : (
              <>
                <a href="#features">
                  <AnimatedButton 
                    size="lg" 
                    className="font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Get Started
                  </AnimatedButton>
                </a>
                <AnimatedButton 
                  variant="outline" 
                  size="lg"
                  className="font-medium"
                >
                  Watch Demo
                </AnimatedButton>
              </>
            )}
          </div>
          
          <div className="pt-8 opacity-80">
            <p className="text-sm text-muted-foreground mb-3">Trusted by conference organizers worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 grayscale opacity-70">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-8 w-24 rounded-md bg-secondary animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
          <a 
            href="#features" 
            className="p-2 rounded-full bg-secondary/80 backdrop-blur-sm hover:bg-secondary focus-ring"
            aria-label="Scroll to features"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ChevronRight className="h-5 w-5 rotate-90" />
          </a>
        </div>
      </section>
      
      <section 
        id="features" 
        ref={featuresRef}
        className={cn(
          "py-20 px-4 sm:px-6 transition-all duration-1000 transform",
          featuresInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Successful Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines powerful tools to enhance every aspect of your conference experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} onClick={() => handleFeatureClick(feature.title)}>
                <FeatureCard 
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section 
        id="about" 
        ref={aboutRef}
        className={cn(
          "py-20 px-4 sm:px-6 bg-secondary/50 transition-all duration-1000 transform",
          aboutInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              About Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transforming Conference Experiences
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn about our mission to revolutionize how conferences are managed and experienced.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-white/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mr-4">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Our Story</h3>
              </div>
              
              <div className="space-y-4 text-foreground/80">
                <p>
                  ConferenceHub was founded in 2023 by a team of event organizers and tech enthusiasts who saw a gap in the conference management industry.
                </p>
                <p>
                  Having experienced the frustrations of managing large events with outdated tools, we set out to create a platform that would streamline every aspect of conference management.
                </p>
                <p>
                  Our mission is to provide innovative solutions that enhance engagement, simplify logistics, and create memorable experiences for attendees and organizers alike.
                </p>
                <p>
                  Today, we serve thousands of conferences globally, from small meetups to large international events, helping them run more efficiently and create more engaging experiences.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/50 rounded-xl p-6 shadow-md">
                <h4 className="text-xl font-semibold mb-2">Our Vision</h4>
                <p className="text-foreground/80">
                  To make conferences more accessible, engaging, and efficient through innovative technology solutions that connect people and ideas seamlessly.
                </p>
              </div>
              
              <div className="bg-white/50 rounded-xl p-6 shadow-md">
                <h4 className="text-xl font-semibold mb-2">Our Values</h4>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Innovation in everything we do</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>User-centered design and development</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Reliability and security as foundation</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Continuous improvement through feedback</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)]" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Conference Experience?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who have revolutionized their conferences with our platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <AnimatedButton size="lg" className="font-medium">
                  Go to Dashboard
                </AnimatedButton>
              </Link>
            ) : (
              <Link to="/login">
                <AnimatedButton size="lg" className="font-medium">
                  Get Started Today
                </AnimatedButton>
              </Link>
            )}
            <a href="#features">
              <AnimatedButton 
                variant="outline" 
                size="lg" 
                className="font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Features
              </AnimatedButton>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
