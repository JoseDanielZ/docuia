const TOKEN_KEY   = 'docuia_token';
const REFRESH_KEY = 'docuia_refresh';
const USER_KEY    = 'docuia_user';

export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(access_token, refresh_token, user) {
  localStorage.setItem(TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  globalThis.location.href = '/login.html';
}

let _refreshing = null;

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  if (_refreshing) return _refreshing;

  _refreshing = fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'refresh', refresh_token: refreshToken }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.access_token) {
        setSession(data.access_token, data.refresh_token ?? refreshToken, data.user ?? getUser());
        return data.access_token;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => { _refreshing = null; });

  return _refreshing;
}

/**
 * Makes an authenticated fetch, automatically refreshing the token on 401.
 * Use this instead of raw fetch() for all authenticated API calls.
 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = { ...options.headers, Authorization: `Bearer ${newToken}` };
      res = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      logout();
    }
  }

  return res;
}
