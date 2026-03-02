const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

// Register
// Register route (simplified version)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // Create profile in public.profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username,
          email
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ message: 'Failed to create user profile' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: authData.user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: authData.user.id,
        username,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ message: 'Failed to fetch user profile' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: authData.user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: authData.user.id,
        username: profile.username,
        email: profile.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;