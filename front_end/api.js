const API_BASE = 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('mc_token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('mc_user') || 'null');
  } catch {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem('mc_token', token);
  localStorage.setItem('mc_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('mc_token');
  localStorage.removeItem('mc_user');
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

function requireAuth(role) {
  const user = getUser();

  if (!user || !getToken()) {
    window.location.href = 'login.html';
    return null;
  }

  if (role && user.role !== role) {
    window.location.href = user.role === 'doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html';
    return null;
  }

  return user;
}

function logout() {
  clearSession();
  window.location.href = 'index.html';
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('mc_dark', document.body.classList.contains('dark') ? '1' : '0');
}

function applySavedTheme() {
  if (localStorage.getItem('mc_dark') === '1') {
    document.body.classList.add('dark');
  }
}

applySavedTheme();