const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, body }) {
  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port: 465,
    secure: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.ZOHO_FROM_EMAIL,
      pass: process.env.ZOHO_APP_PASSWORD
    }
  });

  const info = await transporter.sendMail({
    from: process.env.ZOHO_FROM_EMAIL,
    to,
    subject,
    text: body
  });
  console.log('Mailer: message ID:', info.messageId, 'response:', info.response);
}

module.exports = { sendEmail };
