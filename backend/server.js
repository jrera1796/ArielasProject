// server.js
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
   ------------------------------------- */

// POST /register - Registers a new client
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    // Check if a client with this email already exists
    const existing = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A client with that email already exists.' });
    }
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO clients (name, email, phone, password) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone`,
      [name, email, phone || null, hashedPassword]
    );
    const user = result.rows[0];
    // Sign a JWT token for client authentication
    const token = jwt.sign({ id: user.id, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Registration successful', user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /login - Authenticates a client and returns user info and a JWT token
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
    // Sign a JWT token for client authentication
    const token = jwt.sign({ id: user.id, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Remove password before sending user object
    delete user.password;
    res.json({ message: 'Login successful', user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------
   STAFF ENDPOINTS
   ------------------------------------- */

// POST /staffregister - Registers a new staff member (including phone)
app.post('/api/staffregister', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    // Check if a staff user with this email already exists
    const existing = await pool.query('SELECT * FROM staff WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A staff user with that email already exists.' });
    }
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO staff (name, email, phone, password) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone`,
      [name, email, phone || null, hashedPassword]
    );
    const staffUser = result.rows[0];
    // Sign a JWT token for staff authentication
    const token = jwt.sign({ id: staffUser.id, role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Staff registration successful', user: staffUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /stafflogin - Authenticates a staff user and returns user info and a JWT token
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
    // Sign a JWT token for staff authentication
    const token = jwt.sign({ id: staffUser.id, role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Remove password before sending user object
    delete staffUser.password;
    res.json({ message: 'Staff login successful', user: staffUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------
   START THE SERVER
   ------------------------------------- */
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));

