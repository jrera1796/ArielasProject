const pool = require('./db'); // Ensure db.js exports your PostgreSQL Pool

const recreateTables = async () => {
  try {
    // Drop tables in reverse dependency order using CASCADE
    await pool.query(`DROP TABLE IF EXISTS notifications CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS reviews CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS payments CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS bookings CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS staff_availability CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS clients CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS staff CASCADE;`);

    // Create new tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,  -- hashed password for staff login
        role VARCHAR(20) CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255),  -- nullable: if null, client checked out as a guest
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
        service_type VARCHAR(50) CHECK (service_type IN ('dog walking', 'boarding', 'pet care')) NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        special_instructions TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
        payment_method VARCHAR(50) CHECK (payment_method IN ('stripe', 'paypal')),
        amount DECIMAL(10,2),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS staff_availability (
        id SERIAL PRIMARY KEY,
        staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL,  -- e.g., "Monday", "Tuesday"
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        exception_date DATE,               -- Optional: applies to a specific date only
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
        booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        type VARCHAR(50),         -- e.g., 'booking', 'review', 'availability'
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ All tables dropped and recreated successfully');
  } catch (err) {
    console.error('❌ Error recreating tables:', err.message);
  }
};

recreateTables();
