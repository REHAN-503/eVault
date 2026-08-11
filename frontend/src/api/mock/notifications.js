import { getNotifications, setNotifications, mockDelay } from './data';
import { getCurrentUser } from './auth';

export async function getUserNotifications() {
  await mockDelay(300);
  const user = await getCurrentUser();
  if (!user) return [];
  
  const notifs = getNotifications();
  // Filter for the current user or global notifications (userId: null)
  return notifs.filter(n => n.userId === user.id || !n.userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function markAsRead(notificationId) {
  await mockDelay(150);
  const notifs = getNotifications();
  const updated = notifs.map(n => n.id === notificationId ? { ...n, read: true } : n);
  setNotifications(updated);
  return { ok: true };
}

export async function markAllAsRead() {
  await mockDelay(200);
  const user = await getCurrentUser();
  if (!user) return { ok: true };

  const notifs = getNotifications();
  const updated = notifs.map(n => 
    (n.userId === user.id || !n.userId) ? { ...n, read: true } : n
  );
  setNotifications(updated);
  return { ok: true };
}

// Internal function to push notifications (used by other mock API functions)
export function pushNotification({ userId, type, title, desc }) {
  const notifs = getNotifications();
  const newNotif = {
    id: `notif_${Date.now()}`,
    userId, // Can be null for broadcast
    type,
    title,
    desc,
    timestamp: new Date().toISOString(),
    read: false
  };
  setNotifications([newNotif, ...notifs]);
  return newNotif;
}
