// Handles sending notifications to members
// Different notification types for various situations

class AdminNotificationManager {
  constructor() {
    this.logger = typeof window !== 'undefined' ? window.logger : console;
    this.dataService = typeof window !== 'undefined' ? window.dataService : null;
    this.eventBus = typeof window !== 'undefined' ? window.eventBus : null;
  }

  async createNotification(notificationData) {
    try {
      this.logger.info?.('AdminNotificationManager', 'Creating notification', { 
        type: notificationData.type 
      });

      this._validateNotificationData(notificationData);

      const notification = {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false,
        deliveredAt: null
      };

      const created = await this.dataService?.create?.('notifications', notification);

      this.logger.info?.('AdminNotificationManager', 'Notification created', { 
        notificationId: created?.id 
      });

      this.eventBus?.publish?.('notification:created', created);

      return created;
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to create notification', error);
      throw error;
    }
  }

  async sendBulkNotification(memberIds, notificationData) {
    try {
      this.logger.info?.('AdminNotificationManager', 'Sending bulk notification', { 
        count: memberIds.length 
      });

      const notifications = [];

      for (const memberId of memberIds) {
        const notification = await this.createNotification({
          ...notificationData,
          memberId
        });
        notifications.push(notification);
      }

      this.logger.info?.('AdminNotificationManager', 'Bulk notification sent', { 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to send bulk notification', error);
      throw error;
    }
  }

  async sendFeeDueNotification(memberId, amount, dueDate) {
    try {
      return await this.createNotification({
        memberId,
        type: 'fee_due',
        title: 'Fee Payment Due',
        message: `Your gym fee of $${amount} is due on ${dueDate}. Please make the payment to avoid membership suspension.`
      });
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to send fee due notification', error);
      throw error;
    }
  }

  async sendGymStatusNotification(memberIds, message) {
    try {
      return await this.sendBulkNotification(memberIds, {
        type: 'gym_update',
        title: 'Gym Status Update',
        message
      });
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to send gym status notification', error);
      throw error;
    }
  }

  async sendGymReminder(memberIds, message = null) {
    try {
      const msg = message || "You haven't visited the gym today! Let's maintain your fitness journey. Come by the gym today! 💪";
      return await this.sendBulkNotification(memberIds, {
        type: 'gym_reminder',
        title: '🏋️ Gym Reminder',
        message: msg
      });
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to send gym reminder', error);
      throw error;
    }
  }

  async sendMissedTrainingNotification(memberIds, days = 1, message = null) {
    try {
      const msg = message || `You've missed training for ${days} days. Don't worry! Every moment is a fresh start. Come back stronger and continue your fitness journey! 🚀`;
      return await this.sendBulkNotification(memberIds, {
        type: 'missed_training',
        title: '💪 Get Back on Track',
        message: msg
      });
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to send missed training notification', error);
      throw error;
    }
  }

  async sendMotivationalNotification(memberIds, message = null) {
    try {
      const msg = message || "Amazing work today! You're crushing your fitness goals! Keep up the great momentum! 🔥";
      return await this.sendBulkNotification(memberIds, {
        type: 'motivation',
        title: '🌟 You Did Great Today!',
        message: msg
      });
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to send motivational notification', error);
      throw error;
    }
  }

  async sendStreakReminder(memberIds, streakDays = 0, message = null) {
    try {
      const msg = message || `🔥 Amazing streak! You've been training for ${streakDays} days in a row! Don't break the chain - come back tomorrow!`;
      return await this.sendBulkNotification(memberIds, {
        type: 'streak_reminder',
        title: '🔥 Keep Your Streak Alive!',
        message: msg
      });
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to send streak reminder', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId) {
    try {
      return await this.dataService?.update?.('notifications', notificationId, {
        read: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to mark notification as read', error);
      throw error;
    }
  }

  /**
   * Get notifications for member
   * @param {string} memberId - Member ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async getMemberNotifications(memberId, options = {}) {
    try {
      const notifications = await this.dataService?.readAll?.('notifications', { memberId });
      
      // Filter by read status if specified
      if (options.unreadOnly) {
        return notifications.filter(n => !n.read);
      }

      return notifications;
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to get member notifications', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for member
   * @param {string} memberId - Member ID
   * @returns {Promise<number>} Count of unread notifications
   */
  async getUnreadCount(memberId) {
    try {
      const notifications = await this.getMemberNotifications(memberId, { unreadOnly: true });
      return notifications.length;
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to get unread count', error);
      throw error;
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId) {
    try {
      await this.dataService?.delete?.('notifications', notificationId);
      this.logger.info?.('AdminNotificationManager', 'Notification deleted', { notificationId });
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to delete notification', error);
      throw error;
    }
  }

  /**
   * Schedule monthly fee notification
   * @param {string} memberId - Member ID
   * @param {number} amount - Amount
   * @param {string} dayOfMonth - Day of month to send (1-28)
   * @returns {Promise<Object>} Scheduled notification
   */
  async scheduleMonthlyFeeNotification(memberId, amount, dayOfMonth) {
    try {
      this.logger.info?.('AdminNotificationManager', 'Scheduling monthly notification', { 
        memberId,
        dayOfMonth
      });

      // In a real application, this would schedule with a cron job or similar
      const notification = {
        memberId,
        type: 'fee_due',
        title: 'Monthly Fee Due',
        message: `Your monthly gym fee of $${amount} is due on the ${dayOfMonth}th of each month.`,
        scheduled: true,
        scheduleDay: dayOfMonth,
        nextRun: this._calculateNextNotificationDate(dayOfMonth)
      };

      return notification;
    } catch (error) {
      this.logger.error?.('AdminNotificationManager', 'Failed to schedule notification', error);
      throw error;
    }
  }

  /**
   * Validate notification data
   * @private
   * @param {Object} data - Notification data
   */
  _validateNotificationData(data) {
    if (!data.memberId) {
      throw new Error('Member ID is required');
    }
    if (!['fee_due', 'gym_update', 'general', 'gym_reminder', 'missed_training', 'motivation', 'streak_reminder'].includes(data.type)) {
      throw new Error('Invalid notification type');
    }
    if (!data.title || data.title.trim() === '') {
      throw new Error('Notification title is required');
    }
    if (!data.message || data.message.trim() === '') {
      throw new Error('Notification message is required');
    }
  }

  /**
   * Calculate next notification date
   * @private
   * @param {number} dayOfMonth - Day of month
   * @returns {string} ISO date string
   */
  _calculateNextNotificationDate(dayOfMonth) {
    const today = new Date();
    let nextDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);

    if (nextDate <= today) {
      nextDate = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
    }

    return nextDate.toISOString();
  }
}

// Create singleton instance
const adminNotificationManager = new AdminNotificationManager();

// Export globally
if (typeof window !== 'undefined') {
  window.adminNotificationManager = adminNotificationManager;
  window.AdminNotificationManager = AdminNotificationManager;
}
