const express = require('express');
const dotenv = require('dotenv');
const db = require('./Config/DbConnection');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

// ========== MIDDLEWARE SETUP ========== //
// CORS 
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

// Body Parsers (MUST come before routes!)
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// ========== ROUTES ========== //
const adminroutes = require('./Routes/Admin');
app.use('/api/admin', adminroutes);

const deliveryroutes = require('./Routes/Delivery');
app.use('/api/deliveries', deliveryroutes);

// Test route
app.get('/api/hello', (req, res) => {
  res.send('Hello World');
});

// ========== STATIC FILES (React SPA Fallback) ========== //
// This should come AFTER all API routes
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});