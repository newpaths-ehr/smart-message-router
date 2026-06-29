// Create or edit a forwarding rule
// Fields: name, keywords, AND/OR toggle, sender filter, destination, schedule, enabled toggle

export default function RuleScreen(container, navigate, ruleId = null) {
  container.innerHTML = `
    <div class="screen">
      <h2>${ruleId ? 'Edit Rule' : 'New Rule'}</h2>

      <label>Rule Name</label>
      <input id="rule-name" type="text" placeholder="e.g. Bank Alerts" />

      <label>Match Type</label>
      <select id="match-type">
        <option value="ANY">ANY keyword (OR logic)</option>
        <option value="ALL">ALL keywords (AND logic)</option>
      </select>

      <label>Keywords (comma separated)</label>
      <input id="keywords" type="text" placeholder="e.g. deposit, transfer, alert" />

      <label>Sender Filter (optional)</label>
      <input id="sender-filter" type="text" placeholder="e.g. bank@chase.com" />

      <label>Forward To (email address)</label>
      <input id="destination" type="email" placeholder="e.g. you@example.com" />

      <label>Schedule (optional)</label>
      <input id="schedule-start" type="time" placeholder="Start time" />
      <input id="schedule-end" type="time" placeholder="End time" />

      <label>
        <input id="enabled" type="checkbox" checked />
        Rule is active
      </label>

      <div class="toolbar">
        <button id="btn-save">Save Rule</button>
        <button id="btn-cancel">Cancel</button>
        ${ruleId ? '<button id="btn-delete">Delete Rule</button>' : ''}
      </div>
    </div>
  `;

  document.getElementById('btn-cancel').onclick = () => navigate('home');

  document.getElementById('btn-save').onclick = async () => {
    const rule = {
      name: document.getElementById('rule-name').value,
      match_type: document.getElementById('match-type').value,
      keywords: document.getElementById('keywords').value.split(',').map(k => k.trim()),
      sender_filter: document.getElementById('sender-filter').value,
      destination: [{ type: 'email', address: document.getElementById('destination').value }],
      enabled: document.getElementById('enabled').checked,
      schedule: {
        start: document.getElementById('schedule-start').value,
        end: document.getElementById('schedule-end').value
      }
    };

    const url = ruleId ? `/rules/${ruleId}` : '/rules';
    const method = ruleId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });

    navigate('home');
  };

  if (ruleId) {
    document.getElementById('btn-delete').onclick = async () => {
      if (confirm('Delete this rule?')) {
        await fetch(`/rules/${ruleId}`, { method: 'DELETE' });
        navigate('home');
      }
    };
  }
}
