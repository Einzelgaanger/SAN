import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Admin pages
import ManageDisbursers from "./pages/admin/ManageDisbursers";
import ManageBeneficiaries from "./pages/admin/ManageBeneficiaries";
import ManageGoods from "./pages/admin/ManageGoods";
import ManageAlerts from "./pages/admin/ManageAlerts";
import ManageAllocations from "./pages/admin/ManageAllocations";

// Disburser pages
import RegisterBeneficiary from "./pages/disburser/RegisterBeneficiary";
import AllocateResources from "./pages/disburser/AllocateResources";

// Layout
import { AppLayout } from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10000
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public route for login */}
              <Route path="/" element={<Login />} />
              
              {/* Index route for routing based on auth status */}
              <Route path="/index" element={<Index />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Common Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/disbursers" element={<ManageDisbursers />} />
                  <Route path="/admin/beneficiaries" element={<ManageBeneficiaries />} />
                  <Route path="/admin/goods" element={<ManageGoods />} />
                  <Route path="/admin/alerts" element={<ManageAlerts />} />
                  <Route path="/admin/allocations" element={<ManageAllocations />} />
                  
                  {/* Disburser Routes */}
                  <Route path="/disburser" element={<Navigate to="/disburser/register" replace />} />
                  <Route path="/disburser/dashboard" element={<Dashboard />} />
                  <Route path="/disburser/register" element={<RegisterBeneficiary />} />
                  <Route path="/disburser/allocate" element={<AllocateResources />} />
                </Route>
              </Route>
              
              {/* Catch-all for 404s */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
