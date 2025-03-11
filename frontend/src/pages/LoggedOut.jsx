import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/LoggedOut.css';

const LoggedOut = () => {
  const { logout } = useAuth();

  useEffect(() => {
    // Call the logout method from the auth context
    logout();
  }, [logout]);

  return (
    <div className="logged-out-container">
      <h2>You've been logged out.</h2>
      <p>We hope to see you back soon!</p>
      <div className="button-group">
        <Link to="/" className="btn">Return to Home</Link>
      </div>
    </div>
  );
};

export default LoggedOut;
