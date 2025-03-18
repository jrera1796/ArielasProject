import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../css/BookingForm.css';

// Define service costs in cents (e.g., Grooming: $50, Walking: $20, Training: $30)
const SERVICE_COSTS = {
  Grooming: 5000,  // $50
  Walking: 2000,   // $20
  Training: 3000,  // $30
};

const ClientBooking = () => {
  // Tab state: "list" shows bookings, "new" shows the new booking form.
  const [activeTab, setActiveTab] = useState("list");

  // Step: 1 = Booking Form, 2 = Review, 3 = Payment, 4 = Success.
  const [step, setStep] = useState(1);

  // Booking form data
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    serviceType: '',
    petOption: 'select', // "select" from existing pets (manual not supported here).
    selectedPet: '',
    petDetails: {
      name: '',
      breed: '',
      size: '',
      notes: ''
    }
  });

  // IDs and keys
  const [bookingId, setBookingId] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  // Error messaging
  const [error, setError] = useState('');

  // Bookings and pets are empty arrays initially (no dummy data).
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [userPets, setUserPets] = useState([]);

  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();

  // Fetch user's pets from API on mount
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await fetch('/api/pets', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch pets');
        const petsData = await res.json();
        console.log('Fetched pets:', petsData);
        setUserPets(petsData);
      } catch (err) {
        console.error('Error fetching pets:', err);
      }
    };
    fetchPets();
  }, []);

  // Fetch bookings from API on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const bookingsData = await res.json();
        console.log('Fetched bookings:', bookingsData);
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    fetchBookings();
  }, []);

  // Generate time options from 8:00 AM to 8:00 PM in 15-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 15) {
        const suffix = hour < 12 ? 'AM' : 'PM';
        let displayHour = hour % 12;
        if (displayHour === 0) displayHour = 12;
        const minuteStr = minutes.toString().padStart(2, '0');
        options.push(`${displayHour}:${minuteStr} ${suffix} PST`);
      }
    }
    return options;
  };
  const timeOptions = generateTimeOptions();

  // Step 1: Booking form submission -> Move to Step 2 (Review)
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (bookingData.petOption === 'select' && !bookingData.selectedPet) {
      setError('Please select one of your pets.');
      return;
    }
    if (bookingData.petOption === 'manual' && !bookingData.petDetails.name) {
      setError('Please enter your pet details.');
      return;
    }

    // If valid, move to review step
    setStep(2);
  };

  // Step 2: Review submission -> create PaymentIntent and booking on backend
  const handleReviewSubmit = async () => {
    setError('');
    try {
      const costInCents = SERVICE_COSTS[bookingData.serviceType] || 0;

      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          date: bookingData.date,
          time: bookingData.time,
          service_type: bookingData.serviceType,
          pet_id: bookingData.selectedPet,
          amount: costInCents
        })
      });
      if (!res.ok) throw new Error('Failed to create booking/payment intent');

      const data = await res.json();
      setBookingId(data.booking.id);
      setClientSecret(data.clientSecret);

      // Move to Payment step
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 3: Payment
const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  setError('');
  if (!stripe || !elements) return;

  const cardElement = elements.getElement(CardElement);
  const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: cardElement }
  });

  if (stripeError) {
    setError(stripeError.message);
  } else if (paymentIntent && paymentIntent.status === 'succeeded') {
    // 1) Payment succeeded with Stripe. Now record the final payment in your DB:
    try {
      // For the example, we pass the same amount you used when creating the PaymentIntent.
      // e.g. SERVICE_COSTS[bookingData.serviceType] or 2000, etc.
      const costInCents = SERVICE_COSTS[bookingData.serviceType] || 0;

      const confirmRes = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ bookingId, amount: costInCents })
      });
      if (!confirmRes.ok) throw new Error('Failed to record payment in DB');
      const confirmData = await confirmRes.json();
      console.log('Payment recorded:', confirmData);

      // 2) Refresh bookings list
      const res = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (res.ok) {
        const updatedBookings = await res.json();
        setBookings(updatedBookings);
      }

      // 3) Move to success step
      setStep(4);

    } catch (err) {
      console.error('Error updating payment record:', err);
      setError(err.message);
    }
  }
};

  // Reset booking form
  const handleResetBookingForm = () => {
    setStep(1);
    setBookingData({
      date: '',
      time: '',
      serviceType: '',
      petOption: 'select',
      selectedPet: '',
      petDetails: { name: '', breed: '', size: '', notes: '' }
    });
    setBookingId(null);
    setClientSecret('');
    setError('');
  };

  return (
    <div className="client-booking-page">
      <div className="tabs">
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          My Bookings
        </button>
        <button
          className={activeTab === "new" ? "active" : ""}
          onClick={() => {
            setActiveTab("new");
            handleResetBookingForm();
          }}
        >
          New Booking Request
        </button>
      </div>

      {/* Tab: Bookings List */}
      {activeTab === "list" && (
        <div className="bookings-list">
          <h2>My Bookings</h2>
          <div className="filter">
            <label htmlFor="filterStatus">Filter by Status:</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Service Type</th>
                <th>Status</th>
                <th>Pet</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter(
                  (booking) =>
                    filterStatus === "all" || booking.status === filterStatus
                )
                .map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>{booking.service_type}</td>
                    <td>{booking.status}</td>
                    <td>{booking.pet_name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: New Booking Request */}
      {activeTab === "new" && (
        <div className="new-booking">
          {step === 1 && (
            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <h2>Book Your Service</h2>

              {/* Date */}
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, date: e.target.value })
                  }
                  required
                />
              </div>

              {/* Time */}
              <div className="form-group">
                <label htmlFor="time">Time</label>
                <select
                  id="time"
                  value={bookingData.time}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, time: e.target.value })
                  }
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

              {/* Service Type */}
              <div className="form-group">
                <label htmlFor="serviceType">Service Type</label>
                <select
                  id="serviceType"
                  value={bookingData.serviceType}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, serviceType: e.target.value })
                  }
                  required
                >
                  <option value="">Select a service</option>
                  <option value="Grooming">Grooming</option>
                  <option value="Walking">Walking</option>
                  <option value="Training">Training</option>
                </select>
              </div>

              {/* Pet Info */}
              <div className="form-group">
                <label>Pet Information</label>
                <div>
                  <input
                    type="radio"
                    id="selectPet"
                    name="petOption"
                    value="select"
                    checked={bookingData.petOption === 'select'}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, petOption: e.target.value })
                    }
                  />
                  <label htmlFor="selectPet">Select from my pets</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="manualPet"
                    name="petOption"
                    value="manual"
                    checked={bookingData.petOption === 'manual'}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, petOption: e.target.value })
                    }
                  />
                  <label htmlFor="manualPet">Enter pet details manually</label>
                </div>
              </div>

              {bookingData.petOption === 'select' && (
                <div className="form-group">
                  <label htmlFor="selectedPet">Choose Your Pet</label>
                  <select
                    id="selectedPet"
                    value={bookingData.selectedPet}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, selectedPet: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a pet</option>
                    {userPets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.pet_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button className="booking-submit-btn" type="submit">
                Review Booking
              </button>
              {error && <p className="error-msg">{error}</p>}
            </form>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="review-booking">
              <h2>Review Your Booking</h2>
              <p><strong>Date:</strong> {bookingData.date}</p>
              <p><strong>Time:</strong> {bookingData.time}</p>
              <p><strong>Service Type:</strong> {bookingData.serviceType}</p>
              <p>
                <strong>Cost:</strong> $
                {SERVICE_COSTS[bookingData.serviceType]
                  ? (SERVICE_COSTS[bookingData.serviceType] / 100).toFixed(2)
                  : '0.00'}
              </p>
              <p>
                <strong>Pet:</strong>{' '}
                {bookingData.petOption === 'select'
                  ? userPets.find((p) => p.id === bookingData.selectedPet)?.pet_name
                  : bookingData.petDetails.name}
              </p>
              <button onClick={handleReviewSubmit}>Proceed to Payment</button>
              {error && <p className="error-msg">{error}</p>}
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <form className="payment-form" onSubmit={handlePaymentSubmit}>
              <h2>Payment</h2>
              <CardElement />
              <button className="payment-submit-btn" type="submit" disabled={!stripe}>
                Pay Now
              </button>
              {error && <p className="error-msg">{error}</p>}
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="success-page">
              <h2>Booking Successful!</h2>
              <p>
                Your booking reference is: <strong>{bookingId}</strong>
              </p>
              <p>Your booking is pending and will appear in your account.</p>
              <button
                onClick={() => {
                  setActiveTab("list");
                  handleResetBookingForm();
                }}
              >
                View My Bookings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientBooking;
