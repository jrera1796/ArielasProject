// src/pages/StaffLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/StaffLogin.css';

const StaffLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Update auth context on login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/stafflogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      // Remove password before storing user data
      if (data.user) delete data.user.password;
      localStorage.setItem('authToken', data.token || '');
      localStorage.setItem('authUser', JSON.stringify({ ...data.user, role: 'staff' }));
      setUser({ ...data.user, role: 'staff' }); // Update AuthContext immediately

      navigate('/staff');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="staff-login-container">
      <Link to="/">
        <img className="logo" src="/icons/SFTailsLogo.png" alt="SF Tails Logo" />
      </Link>
      <h2>Staff Login</h2>
      <form className="staff-login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="staff-email">Email:</label>
          <input
            id="staff-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="staff-password">Password:</label>
          <input
            id="staff-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default StaffLogin;
