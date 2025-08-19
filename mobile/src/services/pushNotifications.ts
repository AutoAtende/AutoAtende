import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    try {
      // Check if device supports push notifications
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return;
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });

      this.expoPushToken = token.data;
      await this.savePushToken(token.data);

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupNotificationChannels();
      }

      console.log('Push notifications initialized:', token.data);
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async setupNotificationChannels() {
    // High priority channel for urgent notifications
    await Notifications.setNotificationChannelAsync('urgent', {
      name: 'Urgent Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#FF231F7C',
    });

    // Normal priority channel for regular notifications
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      sound: 'default',
    });

    // Low priority channel for system notifications
    await Notifications.setNotificationChannelAsync('system', {
      name: 'System Updates',
      importance: Notifications.AndroidImportance.LOW,
      sound: null,
    });
  }

  private async savePushToken(token: string) {
    try {
      await AsyncStorage.setItem('push_token', token);
      
      // Send token to backend
      await apiService.request('/users/push-token', {
        method: 'POST',
        body: JSON.stringify({ pushToken: token }),
      });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  async clearPushToken() {
    try {
      await AsyncStorage.removeItem('push_token');
      
      if (this.expoPushToken) {
        await apiService.request('/users/push-token', {
          method: 'DELETE',
          body: JSON.stringify({ pushToken: this.expoPushToken }),
        });
      }
      
      this.expoPushToken = null;
    } catch (error) {
      console.error('Error clearing push token:', error);
    }
  }

  // Handle foreground notifications
  setupForegroundNotificationListener() {
    return Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      
      // You can handle specific notification types here
      const data = notification.request.content.data;
      if (data?.type === 'new_message') {
        // Handle new message in foreground
        this.handleNewMessageNotification(data);
      }
    });
  }

  // Handle notification responses (when user taps notification)
  setupNotificationResponseListener() {
    return Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const data = response.notification.request.content.data;
      this.navigateToNotificationContent(data);
    });
  }

  private handleNewMessageNotification(data: any) {
    // Handle new message notification in foreground
    // You might want to show an in-app notification or update UI
    console.log('New message notification:', data);
  }

  private navigateToNotificationContent(data: any) {
    // Navigate to the appropriate screen based on notification type
    if (data?.type === 'new_message' && data?.ticketId) {
      // Navigate to ticket/chat screen
      // This would integrate with your navigation system
      console.log('Navigate to ticket:', data.ticketId);
    } else if (data?.type === 'new_ticket' && data?.ticketId) {
      // Navigate to ticket list or specific ticket
      console.log('Navigate to new ticket:', data.ticketId);
    }
  }

  // Schedule local notification (for offline scenarios)
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    delay: number = 0
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Set notification badge count
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  // Clear badge count
  async clearBadgeCount() {
    await Notifications.setBadgeCountAsync(0);
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;