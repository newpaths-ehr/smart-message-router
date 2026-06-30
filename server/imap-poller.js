const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { runRules } = require('./rules-engine');

function startPoller() {
  console.log('IMAP poller: starting, will check every 60 seconds');
  checkMail();
  setInterval(checkMail, 60 * 1000);
}

function checkMail() {
  const imap = new Imap({
    user: process.env.ZOHO_FROM_EMAIL,
    password: process.env.ZOHO_APP_PASSWORD,
    host: 'imap.zoho.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('IMAP poller: openBox error:', err.message);
        imap.end();
        return;
      }

      imap.search(['UNSEEN'], (err, results) => {
        if (err) {
          console.error('IMAP poller: search error:', err.message);
          imap.end();
          return;
        }

        if (!results || results.length === 0) {
          imap.end();
          return;
        }

        console.log(`IMAP poller: found ${results.length} unseen message(s)`);

        const fetch = imap.fetch(results, { bodies: '', markSeen: true });

        fetch.on('message', (msg) => {
          let buffer = '';
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => { buffer += chunk.toString('utf8'); });
            stream.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                const to = parsed.to?.text || '';
                const from = parsed.from?.text || '';
                const subject = parsed.subject || '';
                const body = parsed.text || '';
                console.log(`IMAP poller: processing email from=${from} subject="${subject}"`);
                await runRules({ to, from, subject, body });
              } catch (e) {
                console.error('IMAP poller: error processing message:', e.message);
              }
            });
          });
        });

        fetch.once('error', (err) => {
          console.error('IMAP poller: fetch error:', err.message);
        });

        fetch.once('end', () => {
          imap.end();
        });
      });
    });
  });

  imap.once('error', (err) => {
    console.error('IMAP poller: connection error:', err.message);
  });

  imap.connect();
}

module.exports = { startPoller };
