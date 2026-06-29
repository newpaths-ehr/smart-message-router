const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET /log — get message history for logged-in client
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('message_log')
    .select('*')
    .eq('client_id', req.user.id)
    .order('forwarded_at', { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
