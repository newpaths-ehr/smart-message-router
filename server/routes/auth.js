const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// POST /auth/signup — create new account
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Create auth user in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return res.status(400).json({ error: authError.message });

  const userId = authData.user.id;

  // 2. Generate a unique forwarding address for this client
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const emailAddress = `${slug}-${userId.slice(0, 6)}@${process.env.APP_DOMAIN}`;

  // 3. Create row in clients table
  const { error: clientError } = await supabase
    .from('clients')
    .insert([{ id: userId, name, email, email_address: emailAddress }]);

  if (clientError) return res.status(500).json({ error: clientError.message });

  res.json({ user: authData.user, emailAddress });
});

// POST /auth/login — log in
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  res.json({ user: data.user, session: data.session });
});

// POST /auth/logout — log out
router.post('/logout', async (req, res) => {
  await supabase.auth.signOut();
  res.json({ status: 'logged out' });
});

module.exports = router;
