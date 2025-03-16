
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase, safeCast } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export type UserRole = "admin" | "organizer" | "attendee" | null;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  signOut: () => void;
  role: UserRole;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        setIsLoading(true);
        console.log("Checking session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          return;
        }
        
        console.log("Session data:", data);
        setSession(data.session);
        
        if (data.session?.user) {
          console.log("User found in session, fetching profile...");
          await fetchUserProfile(data.session.user);
        } else {
          console.log("No user in session");
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state change:", event, newSession);
      setSession(newSession);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        await fetchUserProfile(newSession.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Fetch user profile data from the auth user data directly
  const fetchUserProfile = async (authUser: User) => {
    try {
      setIsLoading(true);
      console.log("Fetching profile for user:", authUser.id);
      
      // Instead of querying profiles directly, create a basic user from auth user data
      // This avoids the infinite recursion error from profiles table policies
      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || 'User',
        role: (authUser.user_metadata?.role as UserRole) || 'attendee',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_metadata?.name || 'User')}&background=8B5CF6&color=fff`,
      };
      
      setUser(userData);
      console.log("User profile set successfully", userData);
      
    } catch (error) {
      console.error("Profile fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole = "attendee") => {
    try {
      setIsLoading(true);
      
      // For presentation - create a static user without actual Supabase signup
      const mockUser: AuthUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name,
        role: role || 'attendee',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff`,
      };
      
      setUser(mockUser);
      
      // Create a mock session
      const mockSession = {
        access_token: 'mock_token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: {
            name: mockUser.name,
            role: mockUser.role
          }
        }
      } as unknown as Session;
      
      setSession(mockSession);
      
      toast.success(`Welcome, ${name}!`);
      
    } catch (error: any) {
      console.error("Sign up failed:", error);
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, role?: UserRole) => {
    try {
      setIsLoading(true);
      console.log("Signing in with:", email, "role:", role);
      
      // For presentation - create a static user without actual Supabase signin
      const mockUser: AuthUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name: email.split('@')[0],
        role: role || 'attendee',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=8B5CF6&color=fff`,
      };
      
      setUser(mockUser);
      
      // Create a mock session
      const mockSession = {
        access_token: 'mock_token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          user_metadata: {
            name: mockUser.name,
            role: mockUser.role
          }
        }
      } as unknown as Session;
      
      setSession(mockSession);
      
      toast.success(`Welcome back!`);
      
    } catch (error: any) {
      console.error("Sign in failed:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      toast.info("Logged out successfully");
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        role: user?.role || null,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
