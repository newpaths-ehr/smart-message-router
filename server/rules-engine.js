const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { sendEmail } = require('./mailer');
const { sendWebhook } = require('./webhook');

async function runRules({ to, from, subject, body }) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  const toEmail = to.replace(/.*<(.+)>/, '$1').trim().toLowerCase();
  console.log(`Rules engine: processing email to=${toEmail} from=${from}`);

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('email_address', toEmail)
    .single();

  if (!client) {
    console.log(`Rules engine: no client found for address ${toEmail}`);
    return;
  }
  console.log(`Rules engine: found client ${client.name}`);

  const { data: rules } = await supabase
    .from('rules')
    .select('*')
    .eq('client_id', client.id)
    .eq('enabled', true)
    .order('priority', { ascending: true });

  if (!rules || rules.length === 0) {
    console.log('Rules engine: no active rules found');
    return;
  }
  console.log(`Rules engine: found ${rules.length} rule(s)`);
  console.log('Rules engine: first rule:', JSON.stringify(rules[0]));

  const messageText = `${subject} ${body}`.toLowerCase();
  const now = new Date();

  for (const rule of rules) {
    if (rule.schedule && !isWithinSchedule(rule.schedule, now)) continue;
    if (rule.sender_filter && !from.toLowerCase().includes(rule.sender_filter.toLowerCase())) continue;

    const matched = matchesKeywords(messageText, rule.keywords, rule.match_type);
    if (!matched) continue;

    console.log(`Rules engine: rule "${rule.name}" matched — forwarding`);

    for (const dest of rule.destination) {
      if (dest.type === 'email') {
        try {
          await sendEmail({
            to: dest.address,
            subject: `Forwarded: ${subject}`,
            body: `Originally from: ${from}\n\n${body}`
          });
          console.log(`Rules engine: email sent to ${dest.address}`);
        } catch (err) {
          console.error(`Rules engine: failed to send email to ${dest.address}:`, err.message);
        }
      } else if (dest.type === 'webhook') {
        await sendWebhook(dest.address, { from, subject, body });
      }
    }

    await supabase.from('message_log').insert([{
      client_id: client.id,
      rule_id: rule.id,
      from_address: from,
      subject,
      forwarded_to: rule.destination,
      forwarded_at: new Date().toISOString()
    }]);

    break;
  }
}

function matchesKeywords(text, keywords, matchType) {
  if (!keywords || keywords.length === 0) return true;
  if (matchType === 'ALL') {
    return keywords.every(kw => text.includes(kw.toLowerCase()));
  } else {
    return keywords.some(kw => text.includes(kw.toLowerCase()));
  }
}

function isWithinSchedule(schedule, now) {
  const day = now.getDay();
  const time = now.toTimeString().slice(0, 5);
  if (schedule.days && !schedule.days.includes(day)) return false;
  if (schedule.start && time < schedule.start) return false;
  if (schedule.end && time > schedule.end) return false;
  return true;
}

module.exports = { runRules };
