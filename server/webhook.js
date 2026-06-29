const axios = require('axios');

async function sendWebhook(url, payload) {
  await axios.post(url, {
    from: payload.from,
    subject: payload.subject,
    body: payload.body,
    timestamp: new Date().toISOString()
  });
}

module.exports = { sendWebhook };
