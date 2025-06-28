import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import ProjectDetail from "@/pages/project-detail";
import NotFound from "@/pages/not-found";
import Error404 from "@/pages/error-404";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/proyecto/:slug" component={ProjectDetail} />
      <Route component={Error404} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads and handle consent changes
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
      return;
    }

    // Initialize GA on first load
    initGA();

    // Listen for consent changes and reinitialize GA if needed
    const handleConsentChange = () => {
      initGA();
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    return () => window.removeEventListener('cookieConsentChanged', handleConsentChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieConsentBanner />
        <CookieSettingsButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
