import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { KioskModeProvider } from "./contexts/KioskModeContext";

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

const queryClient = new QueryClient();

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
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </KioskModeProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;