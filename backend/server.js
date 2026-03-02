// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');

console.log('🚀 Starting server...');
console.log('Environment check:');
console.log('- PORT:', process.env.PORT || 'default 5000');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('- SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('- CLOUDINARY:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Test the API at http://localhost:${PORT}/api/test`);
});