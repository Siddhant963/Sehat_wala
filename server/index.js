const express = require('express');
const dotenv = require('dotenv');
const db = require('./Config/DbConnection');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();


//server static react build in profduction
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Middleware setup
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware (express.json() is enough in newer Express versions)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const adminroutes = require('./Routes/Admin');
app.use('/api/admin', adminroutes);
const deliveryroutes = require('./Routes/Delivery');
app.use('/api/deliveries', deliveryroutes);

// Test route
app.get('/api/hello', (req, res) => {
  res.send('Hello World');
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});