// mailer.js
const nodemailer = require('nodemailer');

// Create a transporter using your email provider's SMTP settings.
// For example, using Gmail:

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,             // For SSL. Alternatively, use 587 for TLS.
  secure: true,          // True for port 465
  auth: {
    user: process.env.EMAIL_USER, // Your Zoho email address
    pass: process.env.EMAIL_PASS  // Your Zoho email password or app-specific password
  }
});

const sendBookingConfirmation = async (clientEmail, clientName, bookingDetails) => {
  const mailOptions = {
    from: `"SF Tails" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: 'Your Booking is Confirmed!',
    text: `Hi ${clientName},\n\nYour booking for ${bookingDetails.service_type} on ${bookingDetails.date} at ${bookingDetails.time} has been confirmed.\n\nThank you for choosing SF Tails!`,
    html: `<p>Hi ${clientName},</p>
           <p>Your booking for <strong>${bookingDetails.service_type}</strong> on <strong>${bookingDetails.date}</strong> at <strong>${bookingDetails.time}</strong> has been confirmed.</p>
           <p>Thank you for choosing SF Tails!</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendBookingConfirmation };
