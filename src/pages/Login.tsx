import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Users, UserCheck, AlertCircle, Lock, User, Phone } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ensureInitialSetup } from "@/services/setupService";

const Login = () => {
  const [role, setRole] = useState<"admin" | "disburser">("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  // Debug logging function
  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, message]);
  };

  // Initial setup to create default users if needed
  useEffect(() => {
    const setupInitialAccounts = async () => {
      setIsSettingUp(true);
      setSetupError(null);
      logDebug("Starting initial setup process...");
      
      try {
        const success = await ensureInitialSetup();
        
        if (success) {
          logDebug("Initial setup completed successfully or found existing accounts");
        } else {
          logDebug("Initial setup failed");
          setSetupError("Failed to create initial accounts. This may be due to Row Level Security (RLS) policies in Supabase. Please check the console logs for details.");
          toast({
            title: "Setup Error",
            description: "Failed to create initial accounts. Please check logs for details.",
            variant: "destructive",
          });
        }
      } catch (error) {
        logDebug(`Setup error: ${error instanceof Error ? error.message : "Unknown error"}`);
        setSetupError(`Error during setup: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setIsSettingUp(false);
      }
    };
    
    setupInitialAccounts();
  }, [toast]);

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      logDebug("User is already authenticated, redirecting...");
      navigate("/index");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugInfo([]);

    try {
      if (role === "admin") {
        // Admin login
        logDebug(`Trying admin login with: ${identifier}`);
        
        // Don't use filters for authentication, fetch all admins and check manually for better security
        const { data: admins, error } = await supabase
          .from("admins")
          .select("*");

        if (error) {
          logDebug(`Database error: ${error.message}`);
          throw new Error("Database error: " + error.message);
        }

        logDebug(`Found admins: ${admins?.length || 0}`);
        
        if (admins) {
          logDebug(`Admin usernames available: ${admins.map(a => a.username).join(', ')}`);
        }
        
        // Find admin with matching username (case insensitive) and password
        const admin = admins?.find(a => 
          a.username.toLowerCase() === identifier.toLowerCase() && 
          a.password === password
        );

        if (admin) {
          logDebug(`Admin found, logging in: ${admin.name}`);
          // Login successful
          login("admin", { 
            name: admin.name, 
            id: admin.id 
          });
          
          navigate("/dashboard");
          toast({
            title: "Login Successful",
            description: `Welcome, ${admin.name}`,
          });
        } else {
          logDebug("No matching admin found");
          throw new Error("Invalid username or password");
        }
      } else {
        // Disburser login
        logDebug(`Trying disburser login with: ${identifier}`);
        
        // Similar approach for disbursers - fetch all and manually check
        const { data: disbursers, error } = await supabase
          .from("disbursers")
          .select(`
            *,
            regions:region_id (
              name
            )
          `);

        if (error) {
          logDebug(`Database error: ${error.message}`);
          throw new Error("Database error: " + error.message);
        }

        logDebug(`Found disbursers: ${disbursers?.length || 0}`);
        
        if (disbursers) {
          logDebug(`Disburser phone numbers available: ${disbursers.map(d => d.phone_number).join(', ')}`);
        }
        
        // Find disburser with matching phone number and password
        const disburser = disbursers?.find(d => 
          d.phone_number === identifier && 
          d.password === password
        );

        if (disburser) {
          logDebug(`Disburser found, logging in: ${disburser.name}`);
          // Login successful
          login("disburser", { 
            name: disburser.name, 
            id: disburser.id,
            phone: disburser.phone_number,
            region: disburser.regions?.name || "",
            region_id: disburser.region_id
          });
          
          navigate("/disburser/register");
          toast({
            title: "Login Successful",
            description: `Welcome, ${disburser.name}`,
          });
        } else {
          logDebug("No matching disburser found");
          throw new Error("Invalid phone number or password");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      logDebug(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8 md:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black"></div>
      
      <div className="relative w-full max-w-md space-y-6 md:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-3 md:mb-4">
            <Shield size={40} className="text-white md:h-12 md:w-12" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Secure Aid Network</h1>
          <p className="mt-2 text-xs md:text-sm text-gray-400">Sign in to access the secure aid distribution system</p>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
          <CardContent className="pt-5 md:pt-6 px-4 md:px-6">
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center p-1 md:p-2 bg-black/20 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex items-center space-x-1 md:space-x-2 px-3 py-2 rounded-md transition-all text-sm md:text-base ${
                      role === "admin" 
                        ? "bg-white text-black" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Users size={16} className="md:h-[18px] md:w-[18px]" />
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("disburser")}
                    className={`flex items-center space-x-1 md:space-x-2 px-3 py-2 rounded-md transition-all text-sm md:text-base ${
                      role === "disburser" 
                        ? "bg-white text-black" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <UserCheck size={16} className="md:h-[18px] md:w-[18px]" />
                    <span>Disburser</span>
                  </button>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label className="text-xs md:text-sm text-gray-400">
                    {role === "admin" ? "Username" : "Phone Number"}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {role === "admin" ? (
                        <User className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      ) : (
                        <Phone className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      )}
                    </div>
                    <Input
                      type={role === "admin" ? "text" : "tel"}
                      placeholder={role === "admin" ? "Enter username" : "Enter phone number"}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10 py-2 md:py-2.5 h-auto bg-black/20 border-white/10 text-white text-sm md:text-base placeholder:text-gray-500 focus:border-white/20 focus:ring-white/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label className="text-xs md:text-sm text-gray-400">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                    </div>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 py-2 md:py-2.5 h-auto bg-black/20 border-white/10 text-white text-sm md:text-base placeholder:text-gray-500 focus:border-white/20 focus:ring-white/20"
                      required
                    />
                  </div>
                </div>

                {role === "admin" && (
                  <p className="text-[10px] md:text-xs text-gray-500">
                    Admin login credentials required
                  </p>
                )}
                {role === "disburser" && (
                  <p className="text-[10px] md:text-xs text-gray-500">
                    Disburser login credentials required
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-2 md:py-2.5 h-auto text-sm md:text-base bg-white text-black hover:bg-gray-100 transition-colors"
                disabled={isLoading || isSettingUp}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-3 w-3 md:h-4 md:w-4 border-2 border-black border-t-transparent rounded-full"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isSettingUp && (
          <div className="text-center text-xs md:text-sm text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Setting up default accounts...</span>
            </div>
          </div>
        )}

        {setupError && (
          <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <p className="text-xs md:text-sm">{setupError}</p>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="text-[10px] md:text-xs text-gray-500 hover:text-gray-400"
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>
      </div>

      <Dialog open={showDebug} onOpenChange={setShowDebug}>
        <DialogContent className="max-w-[90vw] md:max-w-md bg-black/95 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Debug Information</DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-gray-400">
              This dialog shows detailed information about login attempts and setup processes.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-black/50 p-3 md:p-4 rounded text-[10px] md:text-sm font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap text-gray-300 max-h-[40vh] overflow-y-auto">
              {debugInfo.length > 0 ? 
                debugInfo.map((log, i) => <div key={i}>{log}</div>) : 
                "No debug information available yet."}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;

