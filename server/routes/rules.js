const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

function db() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

router.get('/', async (req, res) => {
  const { data, error } = await db().from('rules').select('*')
    .eq('client_id', req.user.id).order('priority', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:ruleId', async (req, res) => {
  const { data, error } = await db().from('rules').select('*')
    .eq('id', req.params.ruleId).eq('client_id', req.user.id).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { name, match_type, keywords, sender_filter,
          destination, priority, enabled, schedule } = req.body;
  const { data, error } = await db().from('rules')
    .insert([{ client_id: req.user.id, name, match_type, keywords,
               sender_filter, destination, priority, enabled, schedule }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.put('/:ruleId', async (req, res) => {
  const { data, error } = await db().from('rules').update(req.body)
    .eq('id', req.params.ruleId).eq('client_id', req.user.id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

router.delete('/:ruleId', async (req, res) => {
  const { error } = await db().from('rules').delete()
    .eq('id', req.params.ruleId).eq('client_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'deleted' });
});

module.exports = router;
