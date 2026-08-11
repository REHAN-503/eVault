import client from '../client';

export async function login({ email, password }) {
  const { data: response } = await client.post('/auth/login', { email, password });
  const data = response.data;

  localStorage.setItem('evault_token', data.accessToken);

  if (data.refreshToken) {
    localStorage.setItem('evault_refresh_token', data.refreshToken);
  }

  if (data.user) {
    localStorage.setItem('evault_user', JSON.stringify(data.user));
  }

  return data;
}

export async function register({ email, password, fullName, role }) {
  const { data } = await client.post('/auth/register', { email, password, fullName, role });
  return data.data;
}

export async function getCurrentUser() {
  try {
    const { data: response } = await client.get('/auth/me');
    const data = response.data;

    localStorage.setItem('evault_user', JSON.stringify(data));
    return data;
  } catch (err) {
    localStorage.removeItem('evault_token');
    localStorage.removeItem('evault_refresh_token');
    localStorage.removeItem('evault_user');
    return null;
  }
}

export async function logout() {
  try {
    const refreshToken = localStorage.getItem('evault_refresh_token');
    if (refreshToken) {
      await client.post('/auth/logout', { refreshToken });
    }
  } catch (e) {
    // Ignore errors on logout
  }
  localStorage.removeItem('evault_token');
  localStorage.removeItem('evault_refresh_token');
  localStorage.removeItem('evault_user');
}

export async function listUsers() {
  const { data } = await client.get('/admin/users');
  return data.data;
}

export async function updateUserStatus(userId, status) {
  const { data } = await client.patch(`/admin/users/${userId}/status`, { status });
  return data.data;
}
