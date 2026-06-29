// Message log — shows history of every email that was forwarded
// Columns: date/time, from, subject, rule matched, forwarded to

export default function LogScreen(container, navigate) {
  container.innerHTML = `
    <div class="screen">
      <h2>Message Log</h2>
      <button id="btn-back">Back to Rules</button>
      <div id="log-list">Loading...</div>
    </div>
  `;

  document.getElementById('btn-back').onclick = () => navigate('home');

  loadLog();

  async function loadLog() {
    // TODO: replace CLIENT_ID with logged-in client's id
    const res = await fetch(`/log/CLIENT_ID`);
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
              <td>${JSON.stringify(e.forwarded_to)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}
