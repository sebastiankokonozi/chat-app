import { Id } from "./_generated/dataModel";

interface PushNotificationData {
  pushTokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendPushNotification({
  pushTokens,
  title,
  body,
  data,
}: PushNotificationData): Promise<void> {
  if (!pushTokens.length) return;

  const notifications = pushTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data: data || {},
  }));

  try {
    // Expo push notification API
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        notifications.length === 1 ? notifications[0] : notifications
      ),
    });

    // If you want to log success/error details
    const responseData = await response.json();

    if (!response.ok) {
      console.error("Error sending push notification:", responseData);
    }
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}
