// src/pages/StaffSettings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StaffSettings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/loggedout');
  };

  return (
    <div>
      <h3>Settings</h3>
      {/* Other settings options go here */}
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default StaffSettings;
