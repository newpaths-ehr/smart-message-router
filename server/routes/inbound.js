const express = require('express');
const router = express.Router();
const rulesEngine = require('../rules-engine');

// Zoho Mail webhook posts here when email arrives at @easychart.health
router.post('/email', async (req, res) => {
  try {
    const payload = req.body;

    // Zoho sends email data in this format
    const to = payload.to || payload.toAddress || '';
    const from = payload.from || payload.fromAddress || '';
    const subject = payload.subject || '';
    const body = payload.bodyText || payload.body || payload.text || '';

    if (!to || !from) {
      return res.status(400).json({ error: 'Missing to or from address' });
    }

    // Run rules engine asynchronously — respond to Zoho immediately
    res.json({ status: 'received' });
    await rulesEngine.process({ to, from, subject, body });

  } catch (err) {
    console.error('Inbound email error:', err);
    res.status(500).json({ error: 'Failed to process inbound email' });
  }
});

// Test endpoint — simulate an incoming email without needing Zoho configured
// POST /inbound/test with { to, from, subject, body }
router.post('/test', async (req, res) => {
  try {
    const { to, from, subject, body } = req.body;

    if (!to || !from) {
      return res.status(400).json({ error: 'to and from are required' });
    }

    console.log(`Test email: from=${from} to=${to} subject="${subject}"`);
    await rulesEngine.process({ to, from, subject, body });
    res.json({ status: 'processed' });

  } catch (err) {
    console.error('Test inbound error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
