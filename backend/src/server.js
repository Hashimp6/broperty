// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

// THEN import everything else
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import showingRoutes from './routes/showingRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';

// NOW initialize Cloudinary after env is loaded
import './config/cloudinary.js';

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/showings', showingRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5050;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Access from your network: http://192.168.29.67:${PORT}`);
});

