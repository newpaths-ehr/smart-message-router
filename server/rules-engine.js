const { createClient } = require('@supabase/supabase-js');
const { sendEmail } = require('./mailer');
const { sendWebhook } = require('./webhook');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function process({ to, from, subject, body }) {
  // 1. Find which client owns this email address
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('email_address', to)
    .single();

  if (!client) return;

  // 2. Get all active rules for this client in priority order
  const { data: rules } = await supabase
    .from('rules')
    .select('*')
    .eq('client_id', client.id)
    .eq('enabled', true)
    .order('priority', { ascending: true });

  if (!rules || rules.length === 0) return;

  const messageText = `${subject} ${body}`.toLowerCase();
  const now = new Date();

  for (const rule of rules) {
    // 3. Check time-based schedule if set
    if (rule.schedule && !isWithinSchedule(rule.schedule, now)) continue;

    // 4. Check sender filter if set
    if (rule.sender_filter && !from.toLowerCase().includes(rule.sender_filter.toLowerCase())) continue;

    // 5. Check keyword matching (AND / OR logic)
    const matched = matchesKeywords(messageText, rule.keywords, rule.match_type);
    if (!matched) continue;

    // 6. Forward to each destination
    for (const dest of rule.destination) {
      if (dest.type === 'email') {
        await sendEmail({
          to: dest.address,
          subject: `Forwarded: ${subject}`,
          body: `Originally from: ${from}\n\n${body}`
        });
      } else if (dest.type === 'webhook') {
        await sendWebhook(dest.address, { from, subject, body });
      }
    }

    // 7. Log the forwarded message
    await supabase.from('message_log').insert([{
      client_id: client.id,
      rule_id: rule.id,
      from_address: from,
      subject,
      forwarded_to: rule.destination,
      forwarded_at: new Date().toISOString()
    }]);

    // First match wins — stop checking remaining rules
    break;
  }
}

function matchesKeywords(text, keywords, matchType) {
  if (!keywords || keywords.length === 0) return true;

  if (matchType === 'ALL') {
    // AND logic — every keyword must be present
    return keywords.every(kw => text.includes(kw.toLowerCase()));
  } else {
    // OR logic — any one keyword is enough
    return keywords.some(kw => text.includes(kw.toLowerCase()));
  }
}

function isWithinSchedule(schedule, now) {
  // schedule = { days: [1,2,3,4,5], start: "09:00", end: "17:00" }
  const day = now.getDay();
  const time = now.toTimeString().slice(0, 5);

  if (schedule.days && !schedule.days.includes(day)) return false;
  if (schedule.start && time < schedule.start) return false;
  if (schedule.end && time > schedule.end) return false;

  return true;
}

module.exports = { process };
