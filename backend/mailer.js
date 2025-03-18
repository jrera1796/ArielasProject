const nodemailer = require('nodemailer');

// Create a transporter using Zoho SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465, // For SSL. Alternatively, use 587 for TLS.
  secure: true, // True for port 465
  auth: {
    user: process.env.EMAIL_USER, // Your Zoho email address
    pass: process.env.EMAIL_PASS  // Your Zoho email password or app-specific password
  }
});

/**
 * 📩 Send Booking Submission Email (Pending Status)
 */
const sendBookingSubmission = async (clientEmail, clientName, bookingDetails) => {
  const mailOptions = {
    from: `"SF Tails" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: 'Your Booking Request Has Been Received!',
    text: `Hi ${clientName},\n\nWe have received your booking request for ${bookingDetails.service_type} on ${bookingDetails.date} at ${bookingDetails.time}.\n\nOur staff will review your request and confirm it shortly.\n\nThank you for choosing SF Tails!`,
    html: `<p>Hi ${clientName},</p>
           <p>We have received your booking request for <strong>${bookingDetails.service_type}</strong> on <strong>${bookingDetails.date}</strong> at <strong>${bookingDetails.time}</strong>.</p>
           <p>Our staff will review your request and confirm it shortly.</p>
           <p>Thank you for choosing SF Tails!</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking submission email sent to', clientEmail);
  } catch (error) {
    console.error('Error sending booking submission email:', error);
  }
};

/**
 * ✅ Send Booking Confirmation Email (Approved by Staff)
 */
const sendBookingConfirmation = async (clientEmail, clientName, bookingDetails) => {
  const mailOptions = {
    from: `"SF Tails" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: 'Your Booking is Confirmed!',
    text: `Hi ${clientName},\n\nGreat news! Your booking for ${bookingDetails.service_type} on ${bookingDetails.date} at ${bookingDetails.time} has been confirmed.\n\nWe look forward to seeing you soon!\n\nThank you for choosing SF Tails!`,
    html: `<p>Hi ${clientName},</p>
           <p>Great news! Your booking for <strong>${bookingDetails.service_type}</strong> on <strong>${bookingDetails.date}</strong> at <strong>${bookingDetails.time}</strong> has been confirmed.</p>
           <p>We look forward to seeing you soon!</p>
           <p>Thank you for choosing SF Tails!</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent to', clientEmail);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

module.exports = { sendBookingSubmission, sendBookingConfirmation };
