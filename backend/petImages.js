const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3-v3');
const { S3Client } = require('@aws-sdk/client-s3');
const { authenticateToken } = require('./authMiddleware'); // your auth middleware
const pool = require('./db'); // your pool configuration

// Create S3 client using AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Configure multer storage using multerS3-v3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, `pets/${Date.now()}_${file.originalname}`);
    }
  })
});

// POST /api/pet-images - Upload a new image for a pet
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { pet_id, is_main } = req.body;
    // req.file.location contains the URL of the uploaded file
    const result = await pool.query(
      `INSERT INTO pet_images (pet_id, image_url, is_main)
       VALUES ($1, $2, $3) RETURNING *`,
      [pet_id, req.file.location, is_main === 'true']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error uploading pet image:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pet-images?pet_id=... - Retrieve images for a pet
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { pet_id } = req.query;
    const result = await pool.query(
      `SELECT * FROM pet_images WHERE pet_id = $1`,
      [pet_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
