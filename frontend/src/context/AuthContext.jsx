// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (credentials, role) => {
    // Replace this with your real API call
    if (role === 'client' && credentials.email === 'client@example.com' && credentials.password === 'clientpassword') {
      const newUser = { name: 'Client User', email: credentials.email, role: 'client' };
      setUser(newUser);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      return newUser;
    }
    if (role === 'staff') {
      if (credentials.email === 'maria@bayareapaws.com' && credentials.password === 'password123') {
        const newUser = { name: 'Maria Gonzalez', email: credentials.email, role: 'staff' };
        setUser(newUser);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        return newUser;
      } else if (credentials.email === 'jose@bayareapaws.com' && credentials.password === 'password123') {
        const newUser = { name: 'Jose Rivera', email: credentials.email, role: 'staff' };
        setUser(newUser);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        return newUser;
      }
      throw new Error('Invalid credentials');
    }
    throw new Error('Unsupported role');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored && !user) {
      setUser(JSON.parse(stored));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
