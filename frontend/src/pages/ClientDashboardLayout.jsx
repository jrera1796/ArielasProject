// src/pages/ClientDashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/ClientDashboard.css';

const ClientDashboardLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth(); // Get the logged-in user's data

  // Extract only the first name from the full name (assumes names are space-separated)
  const firstName = user && user.name ? user.name.split(" ")[0] : '';

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="client-dashboard">
      {/* Header */}
      <header className="client-header">
        <div className="header-left">
          <h2>
            {firstName ? `Welcome back, ${firstName}!` : 'Welcome Back!'}
          </h2>
          <p>Explore your bookings and account.</p>
        </div>
        <div className="header-right">
          <button className="burger-button" onClick={toggleMenu}>
            ☰
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <Link to="/client/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/client/notifications" onClick={() => setMenuOpen(false)}>
                Notifications
              </Link>
              <Link to="/client/settings" onClick={() => setMenuOpen(false)}>
                Settings
              </Link>
              <Link to="/loggedout" onClick={() => setMenuOpen(false)}>
                Log Out
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="client-main">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <ul>
          <li>
            <Link to="/client">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Home</span>
            </Link>
          </li>
          <li>
            <Link to="/client/bookings">
              <span className="nav-icon">📅</span>
              <span className="nav-label">Bookings</span>
            </Link>
          </li>
          <li>
            <Link to="/client/messages">
              <span className="nav-icon">💬</span>
              <span className="nav-label">Messages</span>
            </Link>
          </li>
          <li>
            <Link to="/client/settings">
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ClientDashboardLayout;
