const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const corsMiddleware = cors({
  origin: [
    'https://bloomly-frontend.vercel.app',
    'https://bloomly-delta.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
app.use(corsMiddleware);
app.use(express.json());

app.use('/api/auth', require('../routes/auth'));
app.use('/api/logs', require('../routes/logs'));

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  isConnected = true;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return app(req, res);
  }
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed:', error);
    return corsMiddleware(req, res, () => (
      res.status(503).json({ error: 'The service is temporarily unavailable. Please try again shortly.' })
    ));
  }
  app(req, res);
};