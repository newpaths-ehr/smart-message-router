export default function LoginScreen(container, navigate) {
  container.innerHTML = `
    <div class="screen auth-screen">
      <h1>Smart Message Router</h1>
      <h2>Log In</h2>
      <div id="auth-error" class="error-msg"></div>

      <label>Email</label>
      <input id="email" type="email" placeholder="you@example.com" />

      <label>Password</label>
      <input id="password" type="password" placeholder="Your password" />

      <div class="toolbar">
        <button id="btn-login">Log In</button>
      </div>

      <p class="auth-switch">Don't have an account?
        <a href="#" id="go-signup">Sign up</a>
      </p>
    </div>
  `;

  document.getElementById('go-signup').onclick = (e) => {
    e.preventDefault();
    navigate('signup');
  };

  document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('auth-error');

    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error;
      return;
    }

    // Save session token for future requests
    localStorage.setItem('session_token', data.session.access_token);
    localStorage.setItem('client_id', data.user.id);

    navigate('home');
  };
}
