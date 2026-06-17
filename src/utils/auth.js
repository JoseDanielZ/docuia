export async function fetchMe() {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function logout() {
  await fetch('/api/auth', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'logout' }),
  }).catch(() => {});
  globalThis.location.href = '/login.html';
}

let _refreshing = null;

async function doRefresh() {
  if (_refreshing) return _refreshing;
  _refreshing = fetch('/api/auth', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'refresh' }),
  })
    .then(r => r.ok)
    .catch(() => false)
    .finally(() => { _refreshing = null; });
  return _refreshing;
}

export async function authFetch(url, options = {}) {
  const res = await fetch(url, { ...options, credentials: 'include' });
  if (res.status !== 401) return res;

  const refreshed = await doRefresh();
  if (!refreshed) {
    logout();
    return res;
  }
  return fetch(url, { ...options, credentials: 'include' });
}
