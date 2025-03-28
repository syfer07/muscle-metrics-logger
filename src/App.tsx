
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Exercises from "./pages/Exercises";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import WorkoutDetails from "./pages/WorkoutDetails";
import WorkoutHistory from "./pages/WorkoutHistory";
import CreateWorkout from "./pages/CreateWorkout";
import AppLayout from "./components/layouts/AppLayout";
import AuthLayout from "./components/layouts/AuthLayout";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
            
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="workouts">
                <Route index element={<WorkoutHistory />} />
                <Route path="new" element={<CreateWorkout />} />
                <Route path=":id" element={<WorkoutDetails />} />
              </Route>
              <Route path="profile" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
