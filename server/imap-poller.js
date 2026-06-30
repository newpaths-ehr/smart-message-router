const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { runRules } = require('./rules-engine');

let authFailed = false;

function startPoller() {
  console.log('IMAP poller: starting, will check every 60 seconds');
  checkMail();
  setInterval(() => { if (!authFailed) checkMail(); }, 60 * 1000);
}

async function checkMail() {
  const client = new ImapFlow({
    host: 'imappro.zoho.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.ZOHO_FROM_EMAIL,
      pass: process.env.ZOHO_APP_PASSWORD
    },
    logger: false,
    tls: { rejectUnauthorized: false },
    disableAutoIdle: true
  });

  try {
    console.log(`IMAP poller: connecting as ${process.env.ZOHO_FROM_EMAIL} to imappro.zoho.com`);
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      const messages = await client.search({ seen: false });
      console.log(`IMAP poller: found ${messages.length} unseen message(s)`);

      for (const uid of messages) {
        try {
          const fetch = client.fetch(uid, { source: true }, { uid: true });
          for await (const message of fetch) {
            const parsed = await simpleParser(message.source);
            const to = parsed.to?.text || '';
            const from = parsed.from?.text || '';
            const subject = parsed.subject || '';
            const body = parsed.text || '';
            console.log(`IMAP poller: processing email from=${from} subject="${subject}"`);
            await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
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
    console.error('IMAP poller: connection error:', err.message);
    console.error('IMAP poller: error details:', JSON.stringify({ code: err.code, command: err.command, response: err.response, responseStatus: err.responseStatus }));
    if (err.response && err.response.includes('AUTHENTICATIONFAILED')) {
      authFailed = true;
      console.error('IMAP poller: stopping retries — check credentials');
    }
  }
}

module.exports = { startPoller };
