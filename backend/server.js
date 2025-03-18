const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Enable CORS and JSON body parsing
app.use(cors({
  origin: 'https://ari.qapital-impressions.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: false
});
console.log('Connecting to DB:', process.env.DB_NAME);

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// (Optional) Test endpoint to verify database connection
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------------------
   CLIENT ENDPOINTS
-------------------------------------- */

// POST /api/register - Registers a new client
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    const existing = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A client with that email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO clients (name, email, phone, password) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone`,
      [name, email, phone || null, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Registration successful', user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/login - Authenticates a client and returns user info and a JWT token
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const user = userResult.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    delete user.password;
    res.json({ message: 'Login successful', user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------
   STAFF ENDPOINTS
-------------------------------------- */

// POST /api/staffregister - Registers a new staff member
app.post('/api/staffregister', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    const existing = await pool.query('SELECT * FROM staff WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A staff user with that email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO staff (name, email, phone, password) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone`,
      [name, email, phone || null, hashedPassword]
    );
    const staffUser = result.rows[0];
    const token = jwt.sign({ id: staffUser.id, role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Staff registration successful', user: staffUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stafflogin - Authenticates a staff user
app.post('/api/stafflogin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM staff WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const staffUser = userResult.rows[0];
    const isValid = await bcrypt.compare(password, staffUser.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: staffUser.id, role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    delete staffUser.password;
    res.json({ message: 'Staff login successful', user: staffUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------
   PETS ENDPOINTS (For Client Pet Management)
-------------------------------------- */

// GET /api/pets - Get all pets for the authenticated client
app.get('/api/pets', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id;
    const result = await pool.query('SELECT * FROM pets WHERE client_id = $1', [clientId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pets - Add a new pet for the authenticated client
app.post('/api/pets', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id;
    const { pet_name, breed, size, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO pets (client_id, pet_name, breed, size, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [clientId, pet_name, breed, size, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pets/:petId - Update a pet's details (only if it belongs to the authenticated client)
app.put('/api/pets/:petId', authenticateToken, async (req, res) => {
  const { petId } = req.params;
  const { pet_name, breed, size, notes } = req.body;
  try {
    const clientId = req.user.id;
    const check = await pool.query('SELECT id FROM pets WHERE id = $1 AND client_id = $2', [petId, clientId]);
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this pet.' });
    }
    const result = await pool.query(
      `UPDATE pets 
       SET pet_name = $1, breed = $2, size = $3, notes = $4 
       WHERE id = $5 RETURNING *`,
      [pet_name, breed, size, notes, petId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/pets/:petId - Delete a pet (only if it belongs to the authenticated client)
app.delete('/api/pets/:petId', authenticateToken, async (req, res) => {
  const { petId } = req.params;
  try {
    const clientId = req.user.id;
    const check = await pool.query('SELECT id FROM pets WHERE id = $1 AND client_id = $2', [petId, clientId]);
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this pet.' });
    }
    await pool.query('DELETE FROM pets WHERE id = $1', [petId]);
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------
   BOOKING ENDPOINTS
-------------------------------------- */

// POST /api/bookings - Create a new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { date, time, service_type, pet_id } = req.body;
  const clientId = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO bookings (client_id, pet_id, date, time, service_type, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending') RETURNING *`,
      [clientId, pet_id, date, time, service_type]
    );

    const newBooking = result.rows[0];

    // Send booking submission email
    const clientInfo = await pool.query('SELECT name, email FROM clients WHERE id = $1', [clientId]);
    if (clientInfo.rows.length > 0) {
      await sendBookingSubmission(clientInfo.rows[0].email, clientInfo.rows[0].name, newBooking);
    }

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings - Get bookings for authenticated client
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id;
    const result = await pool.query('SELECT * FROM bookings WHERE client_id = $1', [clientId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:bookingId/accept - Accept a booking (Staff only)
app.put('/api/bookings/:bookingId/accept', authenticateToken, async (req, res) => {
  const { bookingId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE bookings SET status = 'Confirmed' WHERE id = $1 RETURNING *`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const confirmedBooking = result.rows[0];

    // Send booking confirmation email
    const clientInfo = await pool.query('SELECT name, email FROM clients WHERE id = $1', [confirmedBooking.client_id]);
    if (clientInfo.rows.length > 0) {
      await sendBookingConfirmation(clientInfo.rows[0].email, clientInfo.rows[0].name, confirmedBooking);
    }

    res.json(confirmedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------
   PAYMENT ENDPOINT
-------------------------------------- */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/create-payment-intent - Create a Stripe PaymentIntent for a booking
app.post('/api/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    // Extract booking details from request body
    const { date, time, service_type, pet_id } = req.body;
    // For example purposes, we use a fixed amount (e.g., $20.00 → 2000 cents)
    const amount = 2000;

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      // Optionally add metadata to track booking details
      metadata: { service_type, date, time, pet_id }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
});

/* -------------------------------------
   START THE SERVER
-------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));
