import { api } from '../api.js';

export default function RuleScreen(container, navigate, ruleId = null) {
  container.innerHTML = `
    <div class="screen">
      <h2>${ruleId ? 'Edit Rule' : 'New Rule'}</h2>
      <div id="rule-error" class="error-msg"></div>

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

      <label>Business Hours Only (optional)</label>
      <div class="schedule-row">
        <input id="schedule-start" type="time" />
        <span>to</span>
        <input id="schedule-end" type="time" />
      </div>

      <label class="checkbox-label">
        <input id="enabled" type="checkbox" checked />
        Rule is active
      </label>

      <div class="toolbar">
        <button id="btn-save">Save Rule</button>
        <button id="btn-cancel" class="btn-secondary">Cancel</button>
        ${ruleId ? '<button id="btn-delete" class="btn-danger">Delete Rule</button>' : ''}
      </div>
    </div>
  `;

  // If editing, load existing rule data
  if (ruleId) loadRule(ruleId);

  document.getElementById('btn-cancel').onclick = () => navigate('home');

  document.getElementById('btn-save').onclick = async () => {
    const errorEl = document.getElementById('rule-error');
    const name = document.getElementById('rule-name').value.trim();
    if (!name) { errorEl.textContent = 'Rule name is required.'; return; }

    const rule = {
      name,
      match_type: document.getElementById('match-type').value,
      keywords: document.getElementById('keywords').value.split(',').map(k => k.trim()).filter(Boolean),
      sender_filter: document.getElementById('sender-filter').value.trim() || null,
      destination: [{ type: 'email', address: document.getElementById('destination').value.trim() }],
      enabled: document.getElementById('enabled').checked,
      schedule: {
        start: document.getElementById('schedule-start').value || null,
        end: document.getElementById('schedule-end').value || null
      }
    };

    const url = ruleId ? `/rules/${ruleId}` : '/rules';
    const method = ruleId ? 'PUT' : 'POST';

    const res = await api(url, { method, body: JSON.stringify(rule) });
    if (!res.ok) {
      const data = await res.json();
      errorEl.textContent = data.error;
      return;
    }

    navigate('home');
  };

  if (ruleId) {
    document.getElementById('btn-delete').onclick = async () => {
      if (confirm('Delete this rule?')) {
        await api(`/rules/${ruleId}`, { method: 'DELETE' });
        navigate('home');
      }
    };
  }

  async function loadRule(id) {
    const res = await api(`/rules/${id}`);
    const rule = await res.json();
    document.getElementById('rule-name').value = rule.name || '';
    document.getElementById('match-type').value = rule.match_type || 'ANY';
    document.getElementById('keywords').value = (rule.keywords || []).join(', ');
    document.getElementById('sender-filter').value = rule.sender_filter || '';
    document.getElementById('destination').value = rule.destination?.[0]?.address || '';
    document.getElementById('schedule-start').value = rule.schedule?.start || '';
    document.getElementById('schedule-end').value = rule.schedule?.end || '';
    document.getElementById('enabled').checked = rule.enabled !== false;
  }
}
