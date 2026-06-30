const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { runRules } = require('./rules-engine');

function startPoller() {
  console.log('IMAP poller: starting, will check every 60 seconds');
  checkMail();
  setInterval(checkMail, 60 * 1000);
}

async function checkMail() {
  const client = new ImapFlow({
    host: 'imap.zoho.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.ZOHO_FROM_EMAIL,
      pass: process.env.ZOHO_APP_PASSWORD
    },
    logger: false,
    tls: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      for await (const message of client.fetch({ seen: false }, { source: true })) {
        try {
          const parsed = await simpleParser(message.source);
          const to = parsed.to?.text || '';
          const from = parsed.from?.text || '';
          const subject = parsed.subject || '';
          const body = parsed.text || '';
          console.log(`IMAP poller: processing email from=${from} subject="${subject}"`);
          await client.messageFlagsAdd(message.uid, ['\\Seen'], { uid: true });
          await runRules({ to, from, subject, body });
        } catch (e) {
          console.error('IMAP poller: error processing message:', e.message);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    console.error('IMAP poller: connection error:', err.message);
    if (err.message && err.message.toLowerCase().includes('credentials')) {
      console.error('IMAP poller: invalid credentials — check ZOHO_APP_PASSWORD in Railway variables');
    }
  }
}

module.exports = { startPoller };
