// src/pages/ClientLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/ClientLogin.css';

const ClientLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Get the function to update auth context
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // optional for signup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleToggle = () => {
    setError('');
    setIsSignUp(!isSignUp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Registration failed');
        }

        const data = await response.json();
        // Update AuthContext immediately
        setUser({ ...data.user, role: 'client' });
        localStorage.setItem('authToken', data.token || '');
        localStorage.setItem('authUser', JSON.stringify({ ...data.user, role: 'client' }));
        navigate('/client');
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Login failed');
        }

        const data = await response.json();
        // Update AuthContext immediately
        setUser({ ...data.user, role: 'client' });
        localStorage.setItem('authToken', data.token || '');
        localStorage.setItem('authUser', JSON.stringify({ ...data.user, role: 'client' }));
        navigate('/client');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="client-login-container">
      <Link to="/">
        <img className="logo" src="/icons/SFTailsLogo.png" alt="SF Tails Logo" />
      </Link>
      <h2>{isSignUp ? 'Client Sign Up' : 'Client Login'}</h2>
      <form className="client-login-form" onSubmit={handleSubmit}>
        {isSignUp && (
          <div className="form-group">
            <label htmlFor="client-name">Name:</label>
            <input
              id="client-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="client-email">Email:</label>
          <input
            id="client-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {isSignUp && (
          <div className="form-group">
            <label htmlFor="client-phone">Phone (optional):</label>
            <input
              id="client-phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="client-password">Password:</label>
          <input
            id="client-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {isSignUp && (
          <div className="form-group">
            <label htmlFor="client-confirm-password">Confirm Password:</label>
            <input
              id="client-confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">{isSignUp ? 'Sign Up' : 'Log In'}</button>
      </form>
      <p onClick={handleToggle} className="toggle-link">
        {isSignUp
          ? 'Already have an account? Log In'
          : "Don't have an account? Sign Up"}
      </p>
    </div>
  );
};

export default ClientLogin;
