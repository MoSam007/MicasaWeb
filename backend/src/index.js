const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const listingsRoutes = require('./routes/listingRoutes');

// Error Handling Middleware
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../src/images')));

// Use routes
app.use('/api/listings', listingsRoutes);

// Handle 404
app.use(notFound);

// Error Handler
app.use(errorHandler);

// Enable Mongoose debug mode for detailed query logs
mongoose.set('debug', true);

// Connect to MongoDB with increased timeout
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    socketTimeoutMS: 45000, // 45 seconds socket timeout
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set the port from environment variables or default to 5000
const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
