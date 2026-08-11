import client from '../client';

/*
 * Notifications are not implemented by the live backend yet.
 * Return an empty list instead of crashing the application.
 */
export async function getUserNotifications() {
  return [];
}

export async function markAsRead(notificationId) {
  return null;
}

export async function markAllAsRead() {
  return null;
}
