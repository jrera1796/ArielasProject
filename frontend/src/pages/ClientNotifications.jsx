// src/pages/ClientNotifications.jsx
import React from 'react';
import '../css/ClientDashboard.css'; // Use client-specific CSS

const ClientNotifications = () => {
  // Updated placeholder notifications data for clients
  const notifications = [
    { id: 1, message: "Your dog walking appointment is confirmed for 3:00 PM tomorrow.", date: "2025-03-11" },
    { id: 2, message: "Your booking details have been updated. Please check your email for more information.", date: "2025-03-09" },
    { id: 3, message: "Reminder: Your appointment is coming up soon. We look forward to seeing you!", date: "2025-03-05" },
  ];

  return (
    <div className="client-notifications">
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((notif) => (
            <li key={notif.id} className="notification-item">
              <p>{notif.message}</p>
              <small>{notif.date}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientNotifications;
