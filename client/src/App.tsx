
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import Customers from "./pages/Customers";
import CustomerCreate from "./pages/CustomerCreate";
import CustomerEdit from "./pages/CustomerEdit";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import DeliveryBoy from "./pages/DeliveryBoy";
import NotFound from "./pages/NotFound";
import CreateStaff from "./pages/CreateStaff";
import EditStaff from "./pages/EditStaff";
import ViewAttendance from "./pages/ViewAttendance ";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
           <Route
    path="/dashboard"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/staff"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <Staff />
      </ProtectedRoute>
    }
  />
  <Route
    path="/staff/create"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <CreateStaff />
      </ProtectedRoute>
    }
  />
  <Route
    path="/staff/edit/:id"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <EditStaff />
      </ProtectedRoute>
    }
  />
   <Route
    path="/customers"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <Customers />
      </ProtectedRoute>
    }
  />
  <Route
    path="/customers/create"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <CustomerCreate />
      </ProtectedRoute>
    }
  />
  <Route
    path="/customers/edit/:id"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <CustomerEdit />
      </ProtectedRoute>
    }
  />
  <Route
    path="/inventory"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <Inventory />
      </ProtectedRoute>
    }
  />
   <Route
    path="/orders"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <Orders />
      </ProtectedRoute>
    }
  />
   <Route
    path="/staff/MarkAttendance"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <ViewAttendance />
      </ProtectedRoute>
    }
  />
  <Route
    path="/delivery"
    element={
      <ProtectedRoute allowedRoles={["staff"]}>
        <DeliveryBoy />
      </ProtectedRoute>
    }
  />
          
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
