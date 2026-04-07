import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ScanFood from "./pages/ScanFood.tsx";
import Reports from "./pages/Reports.tsx";
import DietPlan from "./pages/DietPlan.tsx";
import NearbyFood from "./pages/NearbyFood.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import FitnessBuddy from "./pages/FitnessBuddy.tsx";
import HabitCoach from "./pages/HabitCoach.tsx";
import BudgetFood from "./pages/BudgetFood";
import SmartGoals from "./pages/SmartGoals.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fitness-buddy" element={<FitnessBuddy />} />
          <Route path="/habit-coach" element={<HabitCoach />} />
          <Route path="/budget-food" element={<BudgetFood />} />
          <Route path="/smart-goals" element={<SmartGoals />} />
          <Route path="/scan" element={<ScanFood />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/diet-plan" element={<DietPlan />} />
          <Route path="/nearby" element={<NearbyFood />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
