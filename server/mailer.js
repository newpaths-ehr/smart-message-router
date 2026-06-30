const { Resend } = require('resend');

async function sendEmail({ to, subject, body }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: `Smart Message Router <${process.env.ZOHO_FROM_EMAIL}>`,
    to,
    subject,
    text: body
  });
  if (error) throw new Error(error.message);
  console.log('Mailer: message ID:', data.id);
}

module.exports = { sendEmail };
