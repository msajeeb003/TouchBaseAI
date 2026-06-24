import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardPage from "./pages/dashboardPages/DashboardPage";
import LeadsPage from "./pages/dashboardPages/LeadsPage";
import LeadTranscriptsPage from "./pages/dashboardPages/LeadTranscriptsPage";
import SequencesPage from "./pages/dashboardPages/SequencesPage";
import SequenceStepsPage from "./pages/dashboardPages/SequenceStepsPage";
import TranscriptsPage from "./pages/dashboardPages/TranscriptsPage";
import TemplatesPage from "./pages/dashboardPages/TemplatesPage";
import CreateTemplatePage from "./pages/dashboardPages/CreateTemplatePage";
import EditTemplatePage from "./pages/dashboardPages/EditTemplatePage";
import SettingsPage from "./pages/dashboardPages/SettingsPage";
import HowToConfigurePage from "./pages/dashboardPages/HowToConfigurePage";
import AiCredentialsDocsPage from "./pages/docsPages/AiCredentialsDocsPage";
import DocsIndexPage from "./pages/docsPages/DocsIndexPage";
import FathomTranscriptsDocsPage from "./pages/docsPages/FathomTranscriptsDocsPage";
import EmailSmtpDocsPage from "./pages/docsPages/EmailSmtpDocsPage";
import SmsSettingsDocsPage from "./pages/docsPages/SmsSettingsDocsPage";
import RetellAiCallingDocsPage from "./pages/docsPages/RetellAiCallingDocsPage";
import RequireAuth from "./routes/RequireAuth";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/auth/SignIn";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route element={<RequireAuth />}>
            <Route element={<Dashboard />}>
              <Route path="dashboard">
                <Route index element={<DashboardPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="leads/:id/transcripts" element={<LeadTranscriptsPage />} />
                <Route path="sequences" element={<SequencesPage />} />
                <Route path="sequences/:id/steps" element={<SequenceStepsPage />} />
                <Route path="transcripts" element={<TranscriptsPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="templates/new" element={<CreateTemplatePage />} />
                <Route path="templates/:id/edit" element={<EditTemplatePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="how-to-configure" element={<HowToConfigurePage />} />
              </Route>
              <Route path="docs" element={<DocsIndexPage />} />
              <Route path="docs/ai-credentials" element={<AiCredentialsDocsPage />} />
              <Route path="docs/fathom-transcripts" element={<FathomTranscriptsDocsPage />} />
              <Route path="docs/retell-ai-calling" element={<RetellAiCallingDocsPage />} />
              <Route path="docs/email-smtp" element={<EmailSmtpDocsPage />} />
              <Route path="docs/sms-settings" element={<SmsSettingsDocsPage />} />
            </Route>
          </Route>
          <Route path="/index" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
