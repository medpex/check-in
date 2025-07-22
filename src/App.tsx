
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import Invitations from "./pages/Invitations";
import Scanner from "./pages/Scanner";
import ScannerIn from "./pages/ScannerIn";
import ScannerOut from "./pages/ScannerOut";
import Guests from "./pages/Guests";
import Formular from "./pages/Formular";
import BusinessEmails from "./pages/BusinessEmails";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Ueber from "./pages/Ueber";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
              <Route path="/admin/ueber" element={<ProtectedRoute requireAdmin><Ueber /></ProtectedRoute>} />
              <Route path="/admin/invitations" element={<ProtectedRoute requireAdmin><Invitations /></ProtectedRoute>} />
              <Route path="/admin/guests" element={<ProtectedRoute requireAdmin><Guests /></ProtectedRoute>} />
              <Route path="/admin/business-emails" element={<ProtectedRoute requireAdmin><BusinessEmails /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
              <Route path="/scanner-in" element={<ProtectedRoute><ScannerIn /></ProtectedRoute>} />
              <Route path="/scanner-out" element={<ProtectedRoute><ScannerOut /></ProtectedRoute>} />
              <Route path="/formular" element={<Formular />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
