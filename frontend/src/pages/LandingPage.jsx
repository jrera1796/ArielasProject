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
          <Link to="/">
            <img className="logo" src="/icons/SFTailsLogo.png" alt="SF Tails Logo" />
          </Link>
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
            <h3>Pack Walks</h3>
            <p>Enjoy group walks that foster socialization and exercise for your dog.</p>
          </div>
          <div className="service-card">
            <h3>Private Lessons/Training</h3>
            <p>One-on-one training sessions to enhance your pet’s skills and behavior.</p>
          </div>
          <div className="service-card">
            <h3>Sitting</h3>
            <p>Personalized pet sitting services to keep your dog safe and comfortable at home.</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <h2>About Us</h2>
        <p>
          At SF Tails, we get it—your pet isn’t just a pet; they’re family. That’s why we go above and beyond to provide the kind of care that keeps them happy, healthy, and totally pampered. Our expert team knows what it takes to cater to the most discerning pets (and their humans), delivering top-tier service with a personal touch and plenty of tail wags.
        </p>
      </section>

      <footer className="footer" id="contact">
        <p>&copy; {new Date().getFullYear()} SF Tails. All rights reserved.</p>
        <p>
          <a href="mailto:info@arisdogs.com">info@sftails.com</a>
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
