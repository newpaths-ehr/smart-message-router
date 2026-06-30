const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { runRules } = require('./rules-engine');

let authFailed = false;
let consecutiveErrors = 0;

function startPoller() {
  console.log('IMAP poller: starting, will check every 60 seconds');
  checkMail();
  setInterval(() => { if (!authFailed) checkMail(); }, 60 * 1000);
}

async function checkMail() {
  const client = new ImapFlow({
    emitLogs: false,
    host: 'imappro.zoho.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.ZOHO_FROM_EMAIL,
      pass: process.env.ZOHO_APP_PASSWORD
    },
    logger: false,
    tls: { rejectUnauthorized: false },
    disableAutoIdle: true,
    socketTimeout: 30000
  });

  client.on('error', (err) => {
    console.error('IMAP poller: socket error (handled):', err.message);
  });

  try {
    console.log(`IMAP poller: connecting as ${process.env.ZOHO_FROM_EMAIL} to imappro.zoho.com`);
    await client.connect();
    consecutiveErrors = 0;
    const lock = await client.getMailboxLock('INBOX');

    try {
      const messages = await client.search({ seen: false });
      console.log(`IMAP poller: found ${messages.length} unseen message(s)`);

      // Mark all as seen first to avoid reprocessing on timeout
      if (messages.length > 0) {
        await client.messageFlagsAdd(messages, ['\\Seen'], { uid: true });
      }

      // Only process the 10 most recent to avoid timeout
      const toProcess = messages.slice(-10);

      for (const uid of toProcess) {
        try {
          const fetch = client.fetch(uid, { source: true }, { uid: true });
          for await (const message of fetch) {
            const parsed = await simpleParser(message.source);
            const to = parsed.to?.text || '';
            const from = parsed.from?.text || '';
            const subject = parsed.subject || '';
            const body = parsed.text || '';
            console.log(`IMAP poller: processing email to=${to} from=${from} subject="${subject}"`);
            await runRules({ to, from, subject, body });
          }
        } catch (e) {
          console.error('IMAP poller: error processing message:', e.message);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    consecutiveErrors++;
    console.error(`IMAP poller: connection error (attempt ${consecutiveErrors}):`, err.message);
    if (err.response && err.response.includes('AUTHENTICATIONFAILED')) {
      authFailed = true;
      console.error('IMAP poller: stopping retries — check credentials');
    }
    if (consecutiveErrors >= 3) {
      console.error('IMAP poller: too many errors, pausing for 10 minutes');
      authFailed = true;
      setTimeout(() => { authFailed = false; consecutiveErrors = 0; }, 10 * 60 * 1000);
    }
  }
}

module.exports = { startPoller };
