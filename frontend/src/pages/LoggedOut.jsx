// src/pages/LoggedOut.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/LoggedOut.css';

const LoggedOut = () => {
  return (
    <div className="logged-out-container">
      <h2>You’ve been logged out.</h2>
      <p>We hope to see you back soon!</p>
      <div className="button-group">
        <Link to="/" className="btn">Return to Home</Link>
      </div>
    </div>
  );
};

export default LoggedOut;
