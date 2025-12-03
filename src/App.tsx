import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Horoscopes from "./pages/Horoscopes";
import Services from "./pages/Services";
import Compatibility from "./pages/Compatibility";
import EditProfile from "./pages/EditProfile";
import Admin from "./pages/Admin";
import About from "./pages/About";
import NatalChart from "./pages/NatalChart";
import ZodiacOverview from "./pages/ZodiacOverview";
import ZodiacDetails from "./pages/ZodiacDetails";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/horoscopes" element={<Horoscopes />} />
          <Route path="/services" element={<Services />} />
          <Route path="/natal-chart" element={<NatalChart />} />
          <Route path="/compatibility" element={<Compatibility />} />
          <Route path="/zodiac" element={<ZodiacOverview />} />
          <Route path="/zodiac/:sign" element={<ZodiacDetails />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
