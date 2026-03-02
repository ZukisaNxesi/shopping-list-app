const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking Supabase config...');
console.log('SUPABASE_URL found:', supabaseUrl ? '✅' : '❌');
console.log('SUPABASE_KEY found:', supabaseKey ? '✅' : '❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client ready');
module.exports = supabase;