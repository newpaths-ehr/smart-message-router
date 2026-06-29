const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: parseInt(process.env.ZOHO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.ZOHO_FROM_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD
  }
});

async function sendEmail({ to, subject, body }) {
  await transporter.sendMail({
    from: `"${process.env.ZOHO_FROM_NAME}" <${process.env.ZOHO_FROM_EMAIL}>`,
    to,
    subject,
    text: body
  });
}

module.exports = { sendEmail };
