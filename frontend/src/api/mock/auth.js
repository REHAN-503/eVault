import { getUsers, setUsers, mockDelay } from './data';
import { pushNotification } from './notifications';

export async function login({ email, password }) {
  await mockDelay(600);
  const users = getUsers();

  const safeEmail = (email || '').toLowerCase().trim();

  // Find user by email only
  const user = users.find((u) => (u.email || '').toLowerCase() === safeEmail);

  if (!user) {
    throw new Error('Invalid credentials. No account found with this email.');
  }

  // Check account status
  if (user.status === 'pending') {
    throw new Error('Your account is pending administrative approval.');
  }
  
  if (user.status === 'rejected') {
    throw new Error('Your access request was rejected by the registry administrator.');
  }

  // For mock purposes, we accept any password since it's just a demo.
  // In a real app we'd verify the password hash here.

  const token = `mock.${btoa(user.id)}.token`;

  localStorage.setItem('evault_token', token);
  localStorage.setItem('evault_refresh_token', token + '.refresh');
  localStorage.setItem('evault_user', JSON.stringify(user));
  
  return { token, user };
}

export async function register({ fullName, email, phone, password, role, status }) {
  await mockDelay(600);
  const users = getUsers();
  
  const safeEmail = (email || '').toLowerCase().trim();
  
  if (users.some(u => (u.email || '').toLowerCase().trim() === safeEmail)) {
    throw new Error('An account with this email is already registered.');
  }

  const newUser = {
    id: `usr_${Math.floor(200 + Math.random() * 800)}`,
    name: fullName,
    email: safeEmail,
    role: role || 'client',
    org: role === 'client' ? 'Individual' : 'Registry Member',
    status: status || 'pending', // Default to pending for public registration
    phone: phone || '',
    createdAt: new Date().toISOString()
  };

  setUsers([...users, newUser]);

  return { message: 'Registered successfully', user: newUser };
}

export async function getCurrentUser() {
  const raw = localStorage.getItem('evault_user');
  return raw ? JSON.parse(raw) : null;
}

export async function logout() {
  await mockDelay(200);
  localStorage.removeItem('evault_token');
  localStorage.removeItem('evault_refresh_token');
  localStorage.removeItem('evault_user');
}

export async function listUsers() {
  await mockDelay(300);
  return getUsers();
}

export async function updateUserStatus(userId, status) {
  await mockDelay(400);
  const users = getUsers();
  const updated = users.map(u => u.id === userId ? { ...u, status } : u);
  setUsers(updated);

  // Send a notification if approved or rejected
  if (status === 'active') {
    pushNotification({
      userId,
      type: 'Account',
      title: 'Account Approved',
      desc: 'Your registry account has been approved by the administrator.'
    });
  }

  return { ok: true };
}
