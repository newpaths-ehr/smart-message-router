const express = require('express');
const router = express.Router();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET /rules — get all rules for logged-in client
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .eq('client_id', req.user.id)
    .order('priority', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /rules/:ruleId — get a single rule
router.get('/:ruleId', async (req, res) => {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .eq('id', req.params.ruleId)
    .eq('client_id', req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /rules — create a new rule
router.post('/', async (req, res) => {
  const { name, match_type, keywords, sender_filter,
          destination, priority, enabled, schedule } = req.body;

  const { data, error } = await supabase
    .from('rules')
    .insert([{ client_id: req.user.id, name, match_type, keywords,
               sender_filter, destination, priority, enabled, schedule }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// PUT /rules/:ruleId — update a rule (must belong to logged-in client)
router.put('/:ruleId', async (req, res) => {
  const { data, error } = await supabase
    .from('rules')
    .update(req.body)
    .eq('id', req.params.ruleId)
    .eq('client_id', req.user.id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// DELETE /rules/:ruleId — delete a rule (must belong to logged-in client)
router.delete('/:ruleId', async (req, res) => {
  const { error } = await supabase
    .from('rules')
    .delete()
    .eq('id', req.params.ruleId)
    .eq('client_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'deleted' });
});

module.exports = router;
