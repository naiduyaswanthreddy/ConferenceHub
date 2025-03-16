
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/CustomCard";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePageTransition } from "@/lib/animations";
import { Lock, Mail, Eye, EyeOff, UserCog, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"admin" | "attendee">("attendee");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const pageTransition = usePageTransition();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (!email || !password) {
      setFormError("Email and password are required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError("Please enter a valid email address");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Pass the selected role to signIn function
      await signIn(email, password, loginRole);
      console.log("Login successful, navigating to dashboard");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message.includes("Email not confirmed")) {
        setFormError("Please verify your email address before logging in.");
        return;
      }
      
      setFormError(error.message || "Failed to sign in. Please check your credentials.");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setFormError("Please enter your email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) throw error;
      
      setIsEmailVerificationSent(true);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast.error(error.message || "Failed to send verification email");
    }
  };

  return (
    <div className={cn("min-h-screen pt-16 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-4", pageTransition)}>
      <div className="w-full max-w-md">
        <Card className="border-none shadow-2xl bg-gray-900/80 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign in to your account</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setLoginRole("attendee")}
                  className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                    loginRole === "attendee" 
                      ? "bg-orange-500 text-white" 
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <Users size={18} />
                  <span>Attendee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole("admin")}
                  className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                    loginRole === "admin" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <UserCog size={18} />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {formError && (
                <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded-md">
                  {formError}
                  {formError.includes("verify your email") && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="text-primary underline ml-2"
                    >
                      Resend verification email
                    </button>
                  )}
                </div>
              )}
              
              {isEmailVerificationSent && (
                <div className="text-green-500 text-sm p-2 bg-green-500/10 rounded-md">
                  Verification email sent! Please check your inbox.
                </div>
              )}
              
              <AnimatedButton
                type="submit"
                className={`w-full ${loginRole === "attendee" ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"}`}
                disabled={isLoading}
                loading={isLoading}
              >
                Sign In
              </AnimatedButton>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
