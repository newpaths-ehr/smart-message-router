// Dashboard — shows list of all forwarding rules for this client
// Each rule shows: name, status (enabled/disabled), match type, destination

export default function HomeScreen(container, navigate) {
  container.innerHTML = `
    <div class="screen">
      <h1>Smart Message Router</h1>
      <div class="toolbar">
        <button id="btn-new-rule">+ New Rule</button>
        <button id="btn-view-log">View Log</button>
      </div>
      <div id="rules-list">Loading rules...</div>
    </div>
  `;

  document.getElementById('btn-new-rule').onclick = () => navigate('rule', null);
  document.getElementById('btn-view-log').onclick = () => navigate('log');

  loadRules();

  async function loadRules() {
    // TODO: replace CLIENT_ID with logged-in client's id
    const res = await fetch(`/rules/CLIENT_ID`);
    const rules = await res.json();
    const list = document.getElementById('rules-list');

    if (!rules.length) {
      list.innerHTML = '<p>No rules yet. Create your first rule.</p>';
      return;
    }

    list.innerHTML = rules.map(rule => `
      <div class="rule-card ${rule.enabled ? '' : 'disabled'}">
        <div class="rule-name">${rule.name}</div>
        <div class="rule-meta">
          ${rule.match_type} match &bull;
          ${rule.keywords?.join(', ') || 'no keywords'} &bull;
          ${rule.enabled ? 'Active' : 'Paused'}
        </div>
        <button onclick="editRule('${rule.id}')">Edit</button>
      </div>
    `).join('');
  }

  window.editRule = (id) => navigate('rule', id);
}
