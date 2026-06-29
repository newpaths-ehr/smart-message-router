// Wrapper around fetch that automatically adds the auth token to every request
export async function api(url, options = {}) {
  const token = localStorage.getItem('session_token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  return res;
}
