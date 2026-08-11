import { USE_MOCK } from './client';
import * as liveNotifications from './live/notifications';
import * as mockNotifications from './mock/notifications';

const notifications = USE_MOCK ? mockNotifications : liveNotifications;

export const getUserNotifications = notifications.getUserNotifications;
export const markAsRead = notifications.markAsRead;
export const markAllAsRead = notifications.markAllAsRead;
