export default function SignupScreen(container, navigate) {
  container.innerHTML = `
    <div class="screen auth-screen">
      <h1>Smart Message Router</h1>
      <h2>Create Account</h2>
      <div id="auth-error" class="error-msg"></div>

      <label>Full Name</label>
      <input id="name" type="text" placeholder="Jane Smith" />

      <label>Email</label>
      <input id="email" type="email" placeholder="you@example.com" />

      <label>Password</label>
      <input id="password" type="password" placeholder="Choose a password" />

      <div class="toolbar">
        <button id="btn-signup">Create Account</button>
      </div>

      <p class="auth-switch">Already have an account?
        <a href="#" id="go-login">Log in</a>
      </p>
    </div>
  `;

  document.getElementById('go-login').onclick = (e) => {
    e.preventDefault();
    navigate('login');
  };

  document.getElementById('btn-signup').onclick = async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('auth-error');

    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error;
      return;
    }

    // Show client their assigned forwarding address
    alert(`Account created! Your forwarding address is:\n\n${data.emailAddress}\n\nSet up a forward rule in your email to copy emails to this address.`);

    navigate('login');
  };
}
