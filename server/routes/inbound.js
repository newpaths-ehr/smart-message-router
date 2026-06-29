const express = require('express');
const router = express.Router();
const rulesEngine = require('../rules-engine');

// ZeptoMail posts here when an email arrives at client's @yourdomain.com address
router.post('/email', async (req, res) => {
  try {
    const { to, from, subject, body } = req.body;

    // to = which client's address this was sent to (e.g. jane-smith@router.yourdomain.com)
    // from = who sent the email (e.g. bank@chase.com)
    // subject = email subject line
    // body = email body text

    await rulesEngine.process({ to, from, subject, body });

    res.json({ status: 'received' });
  } catch (err) {
    console.error('Inbound email error:', err);
    res.status(500).json({ error: 'Failed to process inbound email' });
  }
});

module.exports = router;
