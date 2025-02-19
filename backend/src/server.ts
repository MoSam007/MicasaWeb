import app from './app';
import dotenv from 'dotenv';

dotenv.config();

// Define the server's port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
