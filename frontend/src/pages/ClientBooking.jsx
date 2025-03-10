// src/pages/ClientBooking.jsx
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../css/BookingForm.css';

const ClientBooking = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    email: '',
    date: '',
    time: ''
  });
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState('');

  // Generate time options from 8:00 AM to 8:00 PM in 15-minute intervals, formatted in 12-hour format with "PST".
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 15) {
        const suffix = hour < 12 ? 'AM' : 'PM';
        let displayHour = hour % 12;
        if (displayHour === 0) displayHour = 12;
        const minuteStr = minutes.toString().padStart(2, '0');
        const timeStr = `${displayHour}:${minuteStr} ${suffix} PST`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // For demo purposes, simulate a backend booking call.
    try {
      setTimeout(() => {
        // Simulate generating a booking reference
        setBookingId(`BK-${Math.floor(Math.random() * 10000)}`);
        setStep(2);
      }, 500);
    } catch (err) {
      console.error(err);
      setError('Booking creation failed. Please try again.');
    }
  };

  const handlePaymentProceed = () => {
    // Simulate payment step (no real payment)
    setStep(3);
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        {step === 1 && (
          <form className="booking-form" onSubmit={handleBookingSubmit}>
            <h2>Book Your Service</h2>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Your Email"
                value={bookingData.email}
                onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <select
                id="time"
                value={bookingData.time}
                onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                required
              >
                <option value="">Select a time</option>
                {timeOptions.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <button className="booking-submit-btn" type="submit">
              Book Now
            </button>
            {error && <p className="error-msg">{error}</p>}
          </form>
        )}

        {step === 2 && (
          <div className="payment-form">
            <h2>Payment</h2>
            <p>Taking payments isn't ready yet.</p>
            <button className="payment-submit-btn" onClick={handlePaymentProceed}>
              OK
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="success-page">
            <h2>Booking Successful!</h2>
            <p>
              Your booking reference is: <strong>{bookingId}</strong>
            </p>
            <p>Thank you for booking with us.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBooking;
