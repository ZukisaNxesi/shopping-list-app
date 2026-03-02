require('dotenv').config();
console.log('Current directory:', __dirname);
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No');
console.log('JWT_SECRET exists:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
