const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { requireAuth } = require('../middleware/auth');

// GET /clients/me — get logged-in client's profile and forwarding address
router.get('/me', requireAuth, async (req, res) => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  console.log('Looking up client for user ID:', req.user.id);
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: 'Client not found' });
  res.json(data[0]);
});

module.exports = router;
