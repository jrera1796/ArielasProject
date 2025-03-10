// src/pages/StaffDashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/StaffDashboard.css';

const StaffDashboardLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  
  // Extract only the first name (assumes names are space-separated)
  const firstName = user && user.name ? user.name.split(' ')[0] : '';

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <header className="top-section">
        <div className="header-left">
          <h2>Hey {firstName ? firstName : 'Staff'}!</h2>
          <p>Take a look around and explore.</p>
        </div>
        <div className="header-right">
          <button className="burger-button" onClick={toggleMenu}>
            ☰
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <Link to="/staff/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/staff/notifications" onClick={() => setMenuOpen(false)}>Notifications</Link>
              <Link to="/staff/stats" onClick={() => setMenuOpen(false)}>My Stats</Link>
              <Link to="/staff/reviews" onClick={() => setMenuOpen(false)}>My Reviews</Link>
              <Link to="/staff/income" onClick={() => setMenuOpen(false)}>My Income</Link>
              <Link to="/staff/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
              <Link to="/loggedout" onClick={() => setMenuOpen(false)}>Log Out</Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <ul>
          <li>
            <Link to="/staff">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Home</span>
            </Link>
          </li>
          <li>
            <Link to="/staff/bookings">
              <span className="nav-icon">📅</span>
              <span className="nav-label">Bookings</span>
            </Link>
          </li>
          <li>
            <Link to="/staff/messages">
              <span className="nav-icon">💬</span>
              <span className="nav-label">Messages</span>
            </Link>
          </li>
          <li>
            <Link to="/staff/availability">
              <span className="nav-icon">🕒</span>
              <span className="nav-label">Availability</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default StaffDashboardLayout;
