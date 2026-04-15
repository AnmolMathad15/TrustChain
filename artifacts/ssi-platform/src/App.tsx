import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { KioskModeProvider } from "./contexts/KioskModeContext";
import { HighContrastProvider } from "./contexts/HighContrastContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import FormsList from "./pages/FormsList";
import FormDetail from "./pages/FormDetail";
import Healthcare from "./pages/Healthcare";
import Payments from "./pages/Payments";
import Schemes from "./pages/Schemes";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AtmAssistant from "./pages/AtmAssistant";
import AiAssistant from "./pages/AiAssistant";
import Admin from "./pages/Admin";
import Security from "./pages/Security";
import Credentials from "./pages/Credentials";
import Verify from "./pages/Verify";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/documents" component={Documents} />
        <Route path="/forms" component={FormsList} />
        <Route path="/forms/:id" component={FormDetail} />
        <Route path="/healthcare" component={Healthcare} />
        <Route path="/payments" component={Payments} />
        <Route path="/schemes" component={Schemes} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/profile" component={Profile} />
        <Route path="/atm" component={AtmAssistant} />
        <Route path="/ai-assistant" component={AiAssistant} />
        <Route path="/admin" component={Admin} />
        <Route path="/security" component={Security} />
        <Route path="/credentials" component={Credentials} />
        <Route path="/verify" component={Verify} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <KioskModeProvider>
              <HighContrastProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
                <Toaster />
              </HighContrastProvider>
            </KioskModeProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
