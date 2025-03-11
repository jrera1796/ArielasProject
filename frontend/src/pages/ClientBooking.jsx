// src/pages/ClientBooking.jsx
import React, { useState } from 'react';
import '../css/BookingForm.css';

const ClientBooking = () => {
  // Tab state: "list" shows bookings, "new" shows the new booking form.
  const [activeTab, setActiveTab] = useState("list");
  // Booking process step (only used in "new" tab)
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    serviceType: '',
    petOption: 'select', // "select" from existing pets or "manual" to enter details
    selectedPet: '',
    petDetails: {
      name: '',
      breed: '',
      size: '',
      notes: ''
    }
  });
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState('');

  // Dummy bookings list. In production, fetch these from an API.
  const [bookings, setBookings] = useState([
    { id: 'BK-1234', date: '2025-03-15', time: '10:00 AM PST', serviceType: 'Grooming', status: 'Pending', pet: 'Buddy' },
    { id: 'BK-5678', date: '2025-03-16', time: '11:15 AM PST', serviceType: 'Walking', status: 'Confirmed', pet: 'Max' }
  ]);
  const [filterStatus, setFilterStatus] = useState("all");

  // Generate time options from 8:00 AM to 8:00 PM in 15-minute intervals, formatted with "PST".
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

  // Dummy data for user pets (should come from user state or API)
  const userPets = [
    { id: 'pet1', name: 'Buddy' },
    { id: 'pet2', name: 'Max' }
  ];

  // Handle booking form submission (Step 1: create a booking)
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate pet information based on selection
    if (bookingData.petOption === 'select' && !bookingData.selectedPet) {
      setError('Please select one of your pets.');
      return;
    }
    if (bookingData.petOption === 'manual' && !bookingData.petDetails.name) {
      setError('Please enter your pet details.');
      return;
    }

    // Simulate booking creation (pending status) and generate a booking reference.
    setTimeout(() => {
      const newId = `BK-${Math.floor(Math.random() * 10000)}`;
      setBookingId(newId);
      setStep(2);
    }, 500);
  };

  // Handle payment step (Step 2). Here we simulate processing then add the booking to the list.
  const handlePaymentProceed = () => {
    const petName =
      bookingData.petOption === 'select'
        ? userPets.find((p) => p.id === bookingData.selectedPet)?.name
        : bookingData.petDetails.name;

    const newBooking = {
      id: bookingId,
      date: bookingData.date,
      time: bookingData.time,
      serviceType: bookingData.serviceType,
      status: "Pending",
      pet: petName
    };

    // Update bookings list
    setBookings((prev) => [...prev, newBooking]);
    setStep(3);
  };

  // Reset the booking form for a new submission.
  const handleResetBookingForm = () => {
    setStep(1);
    setBookingData({
      date: '',
      time: '',
      serviceType: '',
      petOption: 'select',
      selectedPet: '',
      petDetails: {
        name: '',
        breed: '',
        size: '',
        notes: ''
      }
    });
    setBookingId(null);
    setError('');
  };

  return (
    <div className="client-booking-page">
      {/* Navigation Tabs */}
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
                    <td>{booking.serviceType}</td>
                    <td>{booking.status}</td>
                    <td>{booking.pet}</td>
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

              <div className="form-group">
                <label htmlFor="serviceType">Service Type</label>
                <select
                  id="serviceType"
                  value={bookingData.serviceType}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      serviceType: e.target.value
                    })
                  }
                  required
                >
                  <option value="">Select a service</option>
                  <option value="grooming">Grooming</option>
                  <option value="walking">Walking</option>
                  <option value="training">Training</option>
                  {/* Add other service options as needed */}
                </select>
              </div>

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
                      setBookingData({
                        ...bookingData,
                        petOption: e.target.value
                      })
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
                      setBookingData({
                        ...bookingData,
                        petOption: e.target.value
                      })
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
                      setBookingData({
                        ...bookingData,
                        selectedPet: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">Select a pet</option>
                    {userPets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {bookingData.petOption === 'manual' && (
                <div className="pet-details">
                  <div className="form-group">
                    <label htmlFor="petName">Pet Name</label>
                    <input
                      id="petName"
                      type="text"
                      placeholder="Your pet's name"
                      value={bookingData.petDetails.name}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          petDetails: {
                            ...bookingData.petDetails,
                            name: e.target.value
                          }
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="breed">Breed</label>
                    <input
                      id="breed"
                      type="text"
                      placeholder="Breed"
                      value={bookingData.petDetails.breed}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          petDetails: {
                            ...bookingData.petDetails,
                            breed: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="size">Size</label>
                    <input
                      id="size"
                      type="text"
                      placeholder="Size (e.g., Small, Medium, Large)"
                      value={bookingData.petDetails.size}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          petDetails: {
                            ...bookingData.petDetails,
                            size: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="notes">Special Notes</label>
                    <textarea
                      id="notes"
                      placeholder="Any special notes"
                      value={bookingData.petDetails.notes}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          petDetails: {
                            ...bookingData.petDetails,
                            notes: e.target.value
                          }
                        })
                      }
                    ></textarea>
                  </div>
                </div>
              )}

              <button className="booking-submit-btn" type="submit">
                Book Now
              </button>
              {error && <p className="error-msg">{error}</p>}
            </form>
          )}

          {step === 2 && (
            <div className="payment-form">
              <h2>Payment</h2>
              <p>Payment processing isn’t implemented yet.</p>
              <button className="payment-submit-btn" onClick={handlePaymentProceed}>
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
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
