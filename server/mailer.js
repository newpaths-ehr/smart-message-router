const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, body }) {
  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port: parseInt(process.env.ZOHO_SMTP_PORT),
    secure: false,
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
