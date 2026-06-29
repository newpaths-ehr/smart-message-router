const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET all rules for a client
router.get('/:clientId', async (req, res) => {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .eq('client_id', req.params.clientId)
    .order('priority', { ascending: true });

  if (error) return res.status(500).json({ error });
  res.json(data);
});

// POST create a new rule
router.post('/', async (req, res) => {
  const { client_id, name, match_type, keywords, sender_filter,
          destination_type, destination, priority, enabled, schedule } = req.body;

  const { data, error } = await supabase
    .from('rules')
    .insert([{ client_id, name, match_type, keywords, sender_filter,
               destination_type, destination, priority, enabled, schedule }])
    .select();

  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

// PUT update a rule
router.put('/:ruleId', async (req, res) => {
  const { data, error } = await supabase
    .from('rules')
    .update(req.body)
    .eq('id', req.params.ruleId)
    .select();

  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

// DELETE a rule
router.delete('/:ruleId', async (req, res) => {
  const { error } = await supabase
    .from('rules')
    .delete()
    .eq('id', req.params.ruleId);

  if (error) return res.status(500).json({ error });
  res.json({ status: 'deleted' });
});

module.exports = router;
