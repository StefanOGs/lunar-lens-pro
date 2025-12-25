import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingScreen } from "@/components/LoadingScreen";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better performance
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Home = lazy(() => import("./pages/Home"));
const Horoscopes = lazy(() => import("./pages/Horoscopes"));
const Services = lazy(() => import("./pages/Services"));
const Compatibility = lazy(() => import("./pages/Compatibility"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Admin = lazy(() => import("./pages/Admin"));
const About = lazy(() => import("./pages/About"));
const NatalChart = lazy(() => import("./pages/NatalChart"));
const LunarCalendar = lazy(() => import("./pages/LunarCalendar"));
const TransitsProgressions = lazy(() => import("./pages/TransitsProgressions"));
const PersonalForecast = lazy(() => import("./pages/PersonalForecast"));
const ZodiacOverview = lazy(() => import("./pages/ZodiacOverview"));
const ZodiacDetails = lazy(() => import("./pages/ZodiacDetails"));
const Plans = lazy(() => import("./pages/Plans"));
const Reports = lazy(() => import("./pages/Reports"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
