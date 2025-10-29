// backend/server.js
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS (Good for development, Render will handle production CORS implicitly)
app.use(cors());

// Development logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes); // Use a consistent prefix for the upload route

// --------------------------------------------------------------------------
// --- PRODUCTION DEPLOYMENT SETUP (Crucial for MERN on Render) ---
// --------------------------------------------------------------------------
const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
  // 1. Set static folder (Assuming your frontend builds to a 'dist' folder inside 'frontend')
  // Adjust 'frontend/dist' if your build output folder is named 'frontend/build'
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  // 2. Catch all routes and serve the frontend's index.html
  // Any non-API route (not starting with /api) will be handled by the client-side router (React Router)
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  // Simple check for development mode
  app.get('/', (req, res) => {
    res.send('API is running in Development mode....');
  });
}
// --------------------------------------------------------------------------

// Error handling middleware (must be placed last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  () => console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
