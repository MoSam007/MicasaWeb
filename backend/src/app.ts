import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import listingRoutes from './routes/listingRoutes';
import reviewsRoutes from './routes/reviewsRoutes';
import userRoutes from './routes/userRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
// import filterRoutes from './routes/filterRoutes';
import profileRoutes from './routes/profileRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import path from 'path';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors({origin: 'http://localhost:3000'}));
app.use(express.json());

// Routes
app.use('/api/listings', listingRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', authenticateToken, wishlistRoutes);
// app.use('/api/filters', filterRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/static', express.static(path.join(__dirname, '../public')));

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;