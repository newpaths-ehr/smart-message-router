import { api } from '../api.js';

export default function LogScreen(container, navigate) {
  container.innerHTML = `
    <div class="screen">
      <div class="header-bar">
        <h2>Message Log</h2>
        <button id="btn-back" class="btn-secondary">Back</button>
      </div>
      <div id="log-list">Loading...</div>
    </div>
  `;

  document.getElementById('btn-back').onclick = () => navigate('home');

  loadLog();

  async function loadLog() {
    const res = await api('/log');
    const entries = await res.json();
    const list = document.getElementById('log-list');

    if (!entries.length) {
      list.innerHTML = '<p>No messages forwarded yet.</p>';
      return;
    }

    list.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>From</th>
            <th>Subject</th>
            <th>Forwarded To</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(e => `
            <tr>
              <td>${new Date(e.forwarded_at).toLocaleString()}</td>
              <td>${e.from_address}</td>
              <td>${e.subject || '(no subject)'}</td>
              <td>${e.forwarded_to?.map(d => d.address).join(', ') || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}
