// src/pages/StaffAvailability.jsx
import React, { useState } from 'react';
import '../css/StaffAvailability.css';

const StaffAvailability = () => {
  // Mock data for a single week, Sunday to Saturday
  const [weekData] = useState([
    {
      dayName: 'Sunday',
      date: 'Mar 9, 2025',
      bookings: [
        { time: '9:00 AM – 10:00 AM', details: 'Walk for Bella' },
        { time: '1:00 PM – 2:00 PM', details: 'Boarding check-in for Max' },
      ],
    },
    {
      dayName: 'Monday',
      date: 'Mar 10, 2025',
      bookings: [
        { time: '8:00 AM – 9:00 AM', details: 'Dog Walking (Charlie)' },
        { time: '2:00 PM – 3:00 PM', details: 'Pet Care (Daisy)' },
      ],
    },
    {
      dayName: 'Tuesday',
      date: 'Mar 11, 2025',
      bookings: [
        { time: '10:00 AM – 11:00 AM', details: 'Vet Drop-off (Rocky)' },
        { time: '4:00 PM – 5:00 PM', details: 'Dog Walking (Cooper)' },
      ],
    },
    {
      dayName: 'Wednesday',
      date: 'Mar 12, 2025',
      bookings: [
        { time: '9:00 AM – 9:30 AM', details: 'Boarding pick-up (Max)' },
        { time: '1:00 PM – 2:00 PM', details: 'Dog Walking (Molly)' },
      ],
    },
    {
      dayName: 'Thursday',
      date: 'Mar 13, 2025',
      bookings: [
        { time: '11:00 AM – 12:00 PM', details: 'Pet Care (Bailey)' },
        { time: '3:00 PM – 4:00 PM', details: 'Dog Walking (Lucy)' },
      ],
    },
    {
      dayName: 'Friday',
      date: 'Mar 14, 2025',
      bookings: [
        { time: '10:00 AM – 11:00 AM', details: 'Dog Walking (Buddy)' },
        { time: '2:00 PM – 3:00 PM', details: 'Pet Care (Maggie)' },
      ],
    },
    {
      dayName: 'Saturday',
      date: 'Mar 15, 2025',
      bookings: [
        { time: '9:30 AM – 10:30 AM', details: 'Dog Walking (Duke)' },
      ],
    },
  ]);

  return (
    <div className="availability-container">
      <h2 className="week-title">Week 11</h2>
      <p className="week-range">March 9 – March 15, 2025</p>

      {weekData.map((day, index) => (
        <div key={index} className="day-row">
          {/* Top row: Day on the left, date on the right */}
          <div className="day-header">
            <span className="day-name">{day.dayName}</span>
            <span className="day-date">{day.date}</span>
          </div>
          {/* List of bookings below */}
          {day.bookings.length > 0 ? (
            <ul className="booking-list">
              {day.bookings.map((booking, idx) => (
                <li key={idx} className="booking-item">
                  <span className="booking-time">{booking.time}</span>
                  <span className="booking-details">{booking.details}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-bookings">No bookings</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default StaffAvailability;
