import { api } from '../api.js';

export default function HomeScreen(container, navigate) {
  container.innerHTML = `
    <div class="screen">
      <div class="header-bar">
        <h1>Smart Message Router</h1>
        <button id="btn-logout" class="btn-secondary">Log Out</button>
      </div>
      <div id="forwarding-address" class="info-box">Loading your forwarding address...</div>
      <div class="toolbar">
        <button id="btn-new-rule">+ New Rule</button>
        <button id="btn-view-log">View Log</button>
      </div>
      <div id="rules-list">Loading rules...</div>
    </div>
  `;

  document.getElementById('btn-new-rule').onclick = () => navigate('rule', null);
  document.getElementById('btn-view-log').onclick = () => navigate('log');
  document.getElementById('btn-logout').onclick = async () => {
    await api('/auth/logout', { method: 'POST' });
    localStorage.removeItem('session_token');
    localStorage.removeItem('client_id');
    navigate('login');
  };

  loadProfile();
  loadRules();

  async function loadProfile() {
    const res = await api('/clients/me');
    const client = await res.json();
    const box = document.getElementById('forwarding-address');
    box.innerHTML = `
      <strong>Your forwarding address:</strong><br/>
      <code>${client.email_address}</code><br/>
      <small>Set up a forward rule in your email to copy emails here.</small>
    `;
  }

  async function loadRules() {
    const res = await api('/rules');
    const rules = await res.json();
    const list = document.getElementById('rules-list');

    if (!rules.length) {
      list.innerHTML = '<p>No rules yet. Create your first rule.</p>';
      return;
    }

    list.innerHTML = rules.map(rule => `
      <div class="rule-card ${rule.enabled ? '' : 'disabled'}">
        <div class="rule-info">
          <div class="rule-name">${rule.name}</div>
          <div class="rule-meta">
            ${rule.match_type} match &bull;
            ${rule.keywords?.join(', ') || 'no keywords'} &bull;
            ${rule.enabled ? 'Active' : 'Paused'}
          </div>
        </div>
        <button onclick="window.editRule('${rule.id}')">Edit</button>
      </div>
    `).join('');
  }

  window.editRule = (id) => navigate('rule', id);
}
