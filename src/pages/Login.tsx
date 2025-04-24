
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
import { Shield, Users, UserCheck, AlertCircle } from "lucide-react";
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
          // Pre-fill admin credentials for convenience during development
          setRole("admin");
          setIdentifier("admin");
          setPassword("NGO123");
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
          
          navigate("/admin/disbursers");
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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 overflow-hidden">
      <AnimatedIcons />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "1s"}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>
      
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-2 border-white shadow-xl fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Shield size={40} className="text-secure-DEFAULT float" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-secure-DEFAULT to-secure-accent bg-clip-text text-transparent">Secure Aid Distribution System</CardTitle>
          <CardDescription className="text-gray-600">Please sign in to continue</CardDescription>
          
          {isSettingUp && (
            <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-secure-DEFAULT border-t-transparent rounded-full"></div>
              <span>Setting up default accounts...</span>
            </div>
          )}
          
          {setupError && (
            <div className="flex items-center justify-center mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="text-sm">{setupError}</p>
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2 slide-in animation-delay-100">
              <Label htmlFor="role" className="text-gray-700">Select Role</Label>
              <RadioGroup
                id="role"
                defaultValue="admin"
                className="flex justify-around p-2 bg-gray-100 rounded-lg"
                value={role}
                onValueChange={(value) => setRole(value as "admin" | "disburser")}
              >
                <div className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${role === "admin" ? "bg-white shadow-md" : ""}`}>
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer">
                    <Users size={18} className={role === "admin" ? "text-secure-DEFAULT" : "text-gray-500"} />
                    Administrator
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${role === "disburser" ? "bg-white shadow-md" : ""}`}>
                  <RadioGroupItem value="disburser" id="disburser" />
                  <Label htmlFor="disburser" className="flex items-center gap-2 cursor-pointer">
                    <UserCheck size={18} className={role === "disburser" ? "text-secure-DEFAULT" : "text-gray-500"} />
                    Disburser
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2 slide-in animation-delay-200">
              <Label htmlFor="identifier" className="text-gray-700">
                {role === "admin" ? "Username" : "Phone Number"}
              </Label>
              <Input
                id="identifier"
                placeholder={role === "admin" ? "Enter username" : "Enter phone number"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="border-gray-300 focus:border-secure-DEFAULT focus:ring focus:ring-secure-light focus:ring-opacity-50"
              />
            </div>

            <div className="space-y-2 slide-in animation-delay-300">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-secure-DEFAULT focus:ring focus:ring-secure-light focus:ring-opacity-50"
              />
              {role === "admin" && (
                <p className="text-xs text-gray-500 mt-2">
                  Default admin: username "admin", password "NGO123"
                </p>
              )}
              {role === "disburser" && (
                <p className="text-xs text-gray-500 mt-2">
                  Sample disburser: phone "1234567890", password "pass123"
                </p>
              )}
            </div>
            <div className="text-right">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDebug(!showDebug)} 
                className="text-xs text-gray-500"
              >
                {showDebug ? "Hide Debug" : "Show Debug"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col">
            <Button type="submit" className="w-full btn-vibrant bg-gradient-to-r from-secure-DEFAULT to-secure-accent text-white hover:shadow-lg" disabled={isLoading || isSettingUp}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={showDebug} onOpenChange={setShowDebug}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Debug Information</DialogTitle>
            <DialogDescription>
              This dialog shows detailed information about login attempts and setup processes.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-100 p-4 rounded text-sm font-mono">
            <pre className="whitespace-pre-wrap">
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
