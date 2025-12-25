import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Home from "./pages/Home";
import Horoscopes from "./pages/Horoscopes";
import Services from "./pages/Services";
import Compatibility from "./pages/Compatibility";
import EditProfile from "./pages/EditProfile";
import Admin from "./pages/Admin";
import About from "./pages/About";
import NatalChart from "./pages/NatalChart";
import LunarCalendar from "./pages/LunarCalendar";
import TransitsProgressions from "./pages/TransitsProgressions";
import PersonalForecast from "./pages/PersonalForecast";
import ZodiacOverview from "./pages/ZodiacOverview";
import ZodiacDetails from "./pages/ZodiacDetails";
import Plans from "./pages/Plans";
import Reports from "./pages/Reports";
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/update-password" element={<UpdatePassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/horoscopes" element={<Horoscopes />} />
          <Route path="/services" element={<Services />} />
          <Route path="/natal-chart" element={<NatalChart />} />
          <Route path="/compatibility" element={<Compatibility />} />
          <Route path="/lunar-calendar" element={<LunarCalendar />} />
          <Route path="/transits-progressions" element={<TransitsProgressions />} />
          <Route path="/personal-forecast" element={<PersonalForecast />} />
          <Route path="/zodiac" element={<ZodiacOverview />} />
          <Route path="/zodiac/:sign" element={<ZodiacDetails />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/reports" element={<Reports />} />
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
