import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import StaffDashboardLayout from "./pages/StaffDashboardLayout";
import StaffLogin from "./pages/StaffLogin";
import ClientLogin from "./pages/ClientLogin";
import LoggedOut from "./pages/LoggedOut";
import StaffHome from "./pages/StaffHome";
import StaffBookings from "./pages/StaffBookings";
import StaffMessages from "./pages/StaffMessages";
import StaffAvailability from "./pages/StaffAvailability";
import StaffProfile from "./pages/StaffProfile";
import StaffStats from "./pages/StaffStats";
import StaffReviews from "./pages/StaffReviews";
import StaffIncome from "./pages/StaffIncome";
import StaffSettings from "./pages/StaffSettings";
import StaffNotifications from "./pages/StaffNotifications";
import ClientDashboardLayout from "./pages/ClientDashboardLayout";
import ClientHome from "./pages/ClientHome";
import ClientBooking from "./pages/ClientBooking";
import ClientMessages from "./pages/ClientMessages";
import ClientProfile from "./pages/ClientProfile";
import ClientSettings from "./pages/ClientSettings";
import ClientNotifications from "./pages/ClientNotifications";
import "./css/App.css";

function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/staff")) {
      document.title = "Staff Dashboard - Ari's Dog Services";
    } else if (location.pathname.startsWith("/client")) {
      document.title = "Client Dashboard - Ari's Dog Services";
    } else {
      document.title = "Ari's Dog Services";
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<ClientLogin />} />
      <Route path="/loggedout" element={<LoggedOut />} />
      <Route path="/stafflogin" element={<StaffLogin />} />
      <Route path="/staff/*" element={<StaffDashboardLayout />}>
        <Route index element={<StaffHome />} />
        <Route path="bookings" element={<StaffBookings />} />
        <Route path="messages" element={<StaffMessages />} />
        <Route path="availability" element={<StaffAvailability />} />
        <Route path="profile" element={<StaffProfile />} />
        <Route path="stats" element={<StaffStats />} />
        <Route path="reviews" element={<StaffReviews />} />
        <Route path="income" element={<StaffIncome />} />
        <Route path="settings" element={<StaffSettings />} />
        <Route path="notifications" element={<StaffNotifications />} />
      </Route>
      <Route path="/client/*" element={<ClientDashboardLayout />}>
        <Route index element={<ClientHome />} />
        <Route path="bookings" element={<ClientBooking />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="settings" element={<ClientSettings />} />
        <Route path="notifications" element={<ClientNotifications />} />
      </Route>
    </Routes>
  );
}

export default App;
