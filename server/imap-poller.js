const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { runRules } = require('./rules-engine');

let authFailed = false;
let consecutiveErrors = 0;
const processedUids = new Set();

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

  const emailsToProcess = [];

  try {
    await client.connect();
    consecutiveErrors = 0;
    const lock = await client.getMailboxLock('INBOX');

    try {
      const since = new Date(Date.now() - 2 * 60 * 1000);
      const messages = await client.search({ since });
      console.log(`IMAP poller: found ${messages.length} message(s) in last 2 minutes`);

      const toProcess = messages.filter(uid => !processedUids.has(uid)).slice(-10);
      console.log(`IMAP poller: ${toProcess.length} new message(s) to process`);

      for (const uid of toProcess) {
        try {
          const fetch = client.fetch(uid, { source: true }, { uid: true });
          for await (const message of fetch) {
            const parsed = await simpleParser(message.source);
            emailsToProcess.push({
              uid,
              to: parsed.to?.text || '',
              from: parsed.from?.text || '',
              subject: parsed.subject || '',
              body: parsed.text || ''
            });
          }
        } catch (e) {
          console.error('IMAP poller: error fetching message:', e.message);
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

  // Process emails AFTER IMAP connection is closed
  for (const email of emailsToProcess) {
    try {
      console.log(`IMAP poller: processing email to=${email.to} from=${email.from} subject="${email.subject}"`);
      processedUids.add(email.uid);
      await runRules({ to: email.to, from: email.from, subject: email.subject, body: email.body });
    } catch (e) {
      console.error('IMAP poller: error running rules:', e.message);
    }
  }
}

module.exports = { startPoller };
