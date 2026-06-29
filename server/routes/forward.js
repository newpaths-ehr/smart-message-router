const express = require('express');
const router = express.Router();
const { sendEmail } = require('../mailer');
const { sendWebhook } = require('../webhook');

// Forward an email to a destination
router.post('/email', async (req, res) => {
  try {
    const { to, from, subject, body, destination } = req.body;

    await sendEmail({
      to: destination,
      subject: `Forwarded: ${subject}`,
      body: `Originally from: ${from}\n\n${body}`
    });

    res.json({ status: 'forwarded' });
  } catch (err) {
    console.error('Forward email error:', err);
    res.status(500).json({ error: 'Failed to forward email' });
  }
});

// Forward to a webhook destination (Slack, Zapier, etc.)
router.post('/webhook', async (req, res) => {
  try {
    const { from, subject, body, destination } = req.body;

    await sendWebhook(destination, { from, subject, body });

    res.json({ status: 'webhook sent' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Failed to send webhook' });
  }
});

module.exports = router;
