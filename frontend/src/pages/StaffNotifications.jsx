// src/pages/StaffNotifications.jsx
import React from 'react';
import '../css/StaffDashboard.css'; // or a dedicated CSS file if needed

const StaffNotifications = () => {
  // Placeholder notifications data
  const notifications = [
    { id: 1, message: "Booking for Bella at 3:00 PM tomorrow", date: "2025-03-11" },
    { id: 2, message: "New review received from Jane Doe", date: "2025-03-09" },
    { id: 3, message: "Reminder: Update availability - last updated 7 days ago", date: "2025-03-05" },
  ];

  return (
    <div className="staff-notifications">
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map(notif => (
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

export default StaffNotifications;
