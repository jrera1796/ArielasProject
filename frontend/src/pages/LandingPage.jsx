// src/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();
  const clientDashboard = '/client';
  const staffDashboard = '/staff';
  const bookingRoute = user && user.role === 'client' ? '/client/booking' : '/login';

  return (
    <div className="landing-page">
      <header className="hero">
        <nav className="navbar">
          <div className="logo">Bay Area Paws</div>
          <div className="nav-right">
            <ul className="nav-links">
              <li><a href="#services">Services</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            {user ? (
              <Link to={user.role === 'staff' ? staffDashboard : clientDashboard} className="user-dashboard">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="user-login">
                Login / Sign Up
              </Link>
            )}
          </div>
        </nav>
        <div className="hero-content">
          <h1>Your Pet, Our Priority</h1>
          <p>Expert dog walking, boarding, and pet care services in the Bay Area</p>
          <Link to={bookingRoute}>
            <button className="cta-button">Book Now</button>
          </Link>
        </div>
      </header>

      <section id="services" className="services">
        <h2>Our Services</h2>
        <div className="service-cards">
          <div className="service-card">
            <h3>Dog Walking</h3>
            <p>Daily walks to keep your dog happy and healthy.</p>
          </div>
          <div className="service-card">
            <h3>Boarding</h3>
            <p>Comfortable stays for your pet when you're away.</p>
          </div>
          <div className="service-card">
            <h3>Pet Care</h3>
            <p>Personalized care plans to suit your pet's needs.</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <h2>About Us</h2>
        <p>
          At Bay Area Paws, we get it—your pet isn’t just a pet; they’re family. That’s why we go above and beyond to provide the kind of care that keeps them happy, healthy, and totally pampered. Our expert team knows what it takes to cater to the most discerning pets (and their humans), delivering top-tier service with a touch of Bay Area charm.
        </p>
      </section>

      <footer className="footer" id="contact">
        <p>&copy; {new Date().getFullYear()} Bay Area Paws. All rights reserved.</p>
        <p>
          <a href="mailto:info@bayareapaws.com">info@bayareapaws.com</a>
        </p>
        <div className="staff-login-container">
          <Link to="/staff" className="staff-login">
            Staff Login
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
