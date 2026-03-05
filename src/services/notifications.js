import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// 1. Handler Configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 2. Permission Helper
export async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }
  return token;
}

export async function scheduleLocalNotification({ title, body, data = {}, trigger }) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data,
      },
      trigger, // We will pass the strictly typed object here
    });

    console.log(`✅ Scheduled: "${title}" (ID: ${id})`);
    return id;
  } catch (error) {
    console.error("❌ Failed to schedule:", error);
    return null;
  }
}

/**
 * 🌙 MORNING RATING WRAPPER
 * Calculates seconds until tomorrow 9AM and uses TIME_INTERVAL
 */
export async function scheduleMorningRating(clubName, bookingId) {
  const now = new Date();
  
  // 1. Calculate Target Time: Tomorrow at 9:00 AM
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + 1);
  targetDate.setHours(9, 0, 0, 0);

  // 2. Calculate seconds difference
  const diffInMs = targetDate.getTime() - now.getTime();
  let seconds = Math.floor(diffInMs / 1000);

  // Ensure positive integer (fallback to 60s if calculation fails)
  if (seconds <= 0) seconds = 60;

  console.log(`⏳ Scheduling for ${seconds} seconds from now`);

  return await scheduleLocalNotification({
    title: 'How was last night? 🌙',
    body: `Rate your experience at ${clubName}`,
    data: { screen: 'Rating', clubName, bookingId },
    // STRICT TRIGGER OBJECT
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: seconds, 
      repeats: false,
    },
  });
}