/**
 * GastFin Notification & Push Alert Service
 * Handles browser Web Notifications API and local push reminders for scheduled payments.
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

/**
 * Check if the current browser environment supports the Notification API.
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Get the current permission status for notifications.
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

/**
 * Request notification permission from the user.
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Send an immediate browser push notification if permissions are granted.
 */
export const sendBrowserNotification = (payload: NotificationPayload): boolean => {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: payload.tag || `gastfin-notif-${Date.now()}`,
      data: payload.data,
      requireInteraction: true,
    };

    const notification = new Notification(payload.title, options);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('Failed to trigger browser notification:', error);
    return false;
  }
};

/**
 * Helper to check if a scheduled payment has already been notified today.
 */
export const hasPaymentBeenNotifiedToday = (paymentId: string): boolean => {
  const todayStr = new Date().toISOString().split('T')[0];
  const key = `gastfin_notified_${paymentId}_${todayStr}`;
  return localStorage.getItem(key) === 'true';
};

/**
 * Mark that a payment notification has been dispatched today to prevent repeated spam.
 */
export const markPaymentAsNotifiedToday = (paymentId: string): void => {
  const todayStr = new Date().toISOString().split('T')[0];
  const key = `gastfin_notified_${paymentId}_${todayStr}`;
  localStorage.setItem(key, 'true');
};
