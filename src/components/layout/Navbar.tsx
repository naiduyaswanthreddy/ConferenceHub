import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useScrollDirection } from "@/lib/animations";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const scrollDirection = useScrollDirection();
  const isAboutSection = location.hash === "#about";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    e.preventDefault();
    
    // If it's a hash link and we're on the home page
    if (href.startsWith("/#") && (location.pathname === "/" || !location.pathname)) {
      const targetId = href.substring(2);
      const element = document.getElementById(targetId);
      
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If it's a different page, navigate there
      navigate(href);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Determine navbar background class
  const getNavbarClass = () => {
    if (isAboutSection) {
      return "bg-black/70 backdrop-blur-lg"; // Changed to black for About section
    }
    
    if (scrollDirection === 'up') {
      return "bg-transparent"; // Keep it transparent when scrolling up regardless of scroll position
    }
    
    return isScrolled ? "bg-black/70 backdrop-blur-lg" : "bg-transparent"; // Black with transparency when scrolled down
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-10",
        getNavbarClass()
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ConferenceHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={location.pathname === item.href || 
                (item.href !== "/" && location.pathname.startsWith(item.href))}
              onClick={(e) => item.href.includes('#') && handleSmoothScroll(e, item.href)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <AnimatedButton variant="outline" size="sm">
                Dashboard
              </AnimatedButton>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <AnimatedButton variant="outline" size="sm">
                  Sign Up
                </AnimatedButton>
              </Link>
              <Link to="/#features">
                <AnimatedButton 
                  size="sm" 
                  onClick={(e) => handleSmoothScroll(e as unknown as React.MouseEvent<HTMLAnchorElement>, "/#features")}
                >
                  Get Started
                </AnimatedButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden focus-ring rounded-full p-2"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out pt-20",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col p-6 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center justify-between py-2 text-lg font-medium",
                location.pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-foreground hover:text-primary"
              )}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                if (item.href.includes('#')) handleSmoothScroll(e, item.href);
              }}
            >
              {item.label}
              <ChevronRight className="h-5 w-5 opacity-50" />
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-border space-y-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <AnimatedButton className="w-full justify-center">
                  Dashboard
                </AnimatedButton>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <AnimatedButton variant="outline" className="w-full justify-center">
                    Sign Up
                  </AnimatedButton>
                </Link>
                <Link to="/#features">
                  <AnimatedButton 
                    className="w-full justify-center"
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      handleSmoothScroll(e as unknown as React.MouseEvent<HTMLAnchorElement>, "/#features");
                    }}
                  >
                    Get Started
                  </AnimatedButton>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function NavLink({ href, isActive, children, onClick }: NavLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "text-primary" 
          : "text-foreground/80 hover:text-foreground hover:bg-secondary"
      )}
      onClick={onClick}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );
}
