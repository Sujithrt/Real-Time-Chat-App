export const getUnreadNotifications = (notifications) => {
  return notifications.filter((notification) => !notification?.isRead);
}