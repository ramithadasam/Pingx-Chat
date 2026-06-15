import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "./context/AppContext";
import { AnimatePresence } from "framer-motion";
import { getToken } from "./lib/auth";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
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
import FriendRequestsPage from "./pages/FriendRequestsPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Redirect to="/login" />;
  return <>{children}</>;
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/">
          <Redirect to={getToken() ? "/home" : "/login"} />
        </Route>
        <Route path="/home">
          <RequireAuth><HomePage /></RequireAuth>
        </Route>
        <Route path="/notes">
          <RequireAuth><NotesPage /></RequireAuth>
        </Route>
        <Route path="/thoughts">
          <RequireAuth><ThoughtsPage /></RequireAuth>
        </Route>
        <Route path="/settings">
          <RequireAuth><SettingsPage /></RequireAuth>
        </Route>
        <Route path="/profile">
          <RequireAuth><ProfilePage /></RequireAuth>
        </Route>
        <Route path="/add-friend">
          <RequireAuth><AddFriendPage /></RequireAuth>
        </Route>
        <Route path="/remove-friend">
          <RequireAuth><RemoveFriendPage /></RequireAuth>
        </Route>
        <Route path="/privacy">
          <RequireAuth><PrivacyPage /></RequireAuth>
        </Route>
        <Route path="/notifications">
          <RequireAuth><NotificationsPage /></RequireAuth>
        </Route>
        <Route path="/help-support">
          <RequireAuth><HelpSupportPage /></RequireAuth>
        </Route>
        <Route path="/chat/:id">
          <RequireAuth><ChatPage /></RequireAuth>
        </Route>
        <Route path="/contact-info/:id">
          <RequireAuth><ContactInfoPage /></RequireAuth>
        </Route>
        <Route path="/status">
          <RequireAuth><StatusPage /></RequireAuth>
        </Route>
        <Route path="/friend-requests">
          <RequireAuth><FriendRequestsPage /></RequireAuth>
        </Route>
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
