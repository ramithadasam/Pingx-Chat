import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "./context/AppContext";
import { AnimatePresence } from "framer-motion";

import HomePage from "./pages/HomePage";
import NotesPage from "./pages/NotesPage";
import ThoughtsPage from "./pages/ThoughtsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import AddFriendPage from "./pages/AddFriendPage";
import RemoveFriendPage from "./pages/RemoveFriendPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotificationsPage from "./pages/NotificationsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import ChatPage from "./pages/ChatPage";
import ContactInfoPage from "./pages/ContactInfoPage";
import StatusPage from "./pages/StatusPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/notes" component={NotesPage} />
        <Route path="/thoughts" component={ThoughtsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/add-friend" component={AddFriendPage} />
        <Route path="/remove-friend" component={RemoveFriendPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/help-support" component={HelpSupportPage} />
        <Route path="/chat/:id" component={ChatPage} />
        <Route path="/contact-info/:id" component={ContactInfoPage} />
        <Route path="/status" component={StatusPage} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <div className="bg-[#050505] min-h-[100dvh] text-white max-w-[480px] mx-auto shadow-2xl overflow-hidden relative">
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </div>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;