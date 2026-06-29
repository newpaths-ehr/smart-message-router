const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.com',
  port: 587,
  auth: {
    user: 'emailapikey',
    pass: process.env.ZEPTO_API_KEY
  }
});

async function sendEmail({ to, subject, body }) {
  await transporter.sendMail({
    from: `"${process.env.ZEPTO_FROM_NAME}" <${process.env.ZEPTO_FROM_EMAIL}>`,
    to,
    subject,
    text: body
  });
}

module.exports = { sendEmail };
