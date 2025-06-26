
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Invitations from "./pages/Invitations";
import ScannerIn from "./pages/ScannerIn";
import ScannerOut from "./pages/ScannerOut";
import Guests from "./pages/Guests";
import Formular from "./pages/Formular";
import BusinessEmails from "./pages/BusinessEmails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/invitations" element={<Invitations />} />
          <Route path="/admin/guests" element={<Guests />} />
          <Route path="/admin/business-emails" element={<BusinessEmails />} />
          <Route path="/scanner-in" element={<ScannerIn />} />
          <Route path="/scanner-out" element={<ScannerOut />} />
          <Route path="/formular" element={<Formular />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
