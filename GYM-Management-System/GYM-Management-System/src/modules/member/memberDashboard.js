// Member dashboard features
// view profile, bills, attendance

class MemberDashboard {
  constructor() {
    this.logger = typeof window !== 'undefined' ? window.logger : console;
    this.dataService = typeof window !== 'undefined' ? window.dataService : null;
    this.authService = typeof window !== 'undefined' ? window.authService : null;
    this.eventBus = typeof window !== 'undefined' ? window.eventBus : null;
  }

  async getMemberProfile(memberId) {
    try {
      // fetch member info
  async getMemberProfile(memberId) {
    try {
      this.logger.info?.('MemberDashboard', 'Fetching member profile', { memberId });

      const member = await this.dataService?.read?.('members', memberId);

      if (!member) {
        throw new Error('Member not found');
      }

      return member;
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to get member profile', error);
      throw error;
    }
  }

  /**
   * Get member bills
   * @param {string} memberId - Member ID
   * @returns {Promise<Array>} Array of bills
   */
  async getMemberBills(memberId) {
    try {
      this.logger.info?.('MemberDashboard', 'Fetching member bills', { memberId });

      const bills = await this.dataService?.readAll?.('bills', { memberId });

      return bills.sort((a, b) => 
        new Date(b.billDate) - new Date(a.billDate)
      );
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to get member bills', error);
      throw error;
    }
  }

  /**
   * Get bill details
   * @param {string} billId - Bill ID
   * @returns {Promise<Object>} Bill details
   */
  async getBillDetails(billId) {
    try {
      const bill = await this.dataService?.read?.('bills', billId);

      if (!bill) {
        throw new Error('Bill not found');
      }

      return bill;
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to get bill details', error);
      throw error;
    }
  }

  /**
   * Download bill receipt
   * @param {string} billId - Bill ID
   * @returns {Promise<Object>} Receipt data
   */
  async downloadReceipt(billId) {
    try {
      this.logger.info?.('MemberDashboard', 'Downloading receipt', { billId });

      const bill = await this.dataService?.read?.('bills', billId);

      if (!bill) {
        throw new Error('Bill not found');
      }

      if (bill.status !== 'paid') {
        throw new Error('Receipt only available for paid bills');
      }

      const receipt = {
        receiptNumber: bill.receiptNumber,
        billDate: bill.billDate,
        paidDate: bill.paidDate,
        amount: bill.amount,
        status: bill.status,
        downloadedAt: new Date().toISOString()
      };

      this.logger.info?.('MemberDashboard', 'Receipt downloaded', { billId });

      return receipt;
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to download receipt', error);
      throw error;
    }
  }

  /**
   * Get outstanding bills for member
   * @param {string} memberId - Member ID
   * @returns {Promise<Array>} Array of pending bills
   */
  async getOutstandingBills(memberId) {
    try {
      const bills = await this.dataService?.readAll?.('bills', { 
        memberId,
        status: 'pending'
      });

      return bills;
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to get outstanding bills', error);
      throw error;
    }
  }

  /**
   * Get total outstanding amount
   * @param {string} memberId - Member ID
   * @returns {Promise<number>} Total amount owed
   */
  async getTotalOutstanding(memberId) {
    try {
      const outstanding = await this.getOutstandingBills(memberId);

      return outstanding.reduce((total, bill) => total + bill.amount, 0);
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to get total outstanding', error);
      throw error;
    }
  }

  /**
   * Get member notifications
   * @param {string} memberId - Member ID
   * @returns {Promise<Array>} Array of notifications
   */
  async getNotifications(memberId) {
    try {
      this.logger.info?.('MemberDashboard', 'Fetching notifications', { memberId });

      const notifications = await this.dataService?.readAll?.('notifications', { 
        memberId 
      });

      return notifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to get notifications', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   * @param {string} memberId - Member ID
   * @returns {Promise<number>} Count of unread notifications
   */
  async getUnreadNotificationsCount(memberId) {
    try {
      const notifications = await this.dataService?.readAll?.('notifications', { 
        memberId,
        read: false
      });

      return notifications.length;
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to get unread count', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markNotificationAsRead(notificationId) {
    try {
      return await this.dataService?.update?.('notifications', notificationId, {
        read: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to mark notification as read', error);
      throw error;
    }
  }

  /**
   * Update member profile
   * @param {string} memberId - Member ID
   * @param {Object} updateData - Updated data
   * @returns {Promise<Object>} Updated member
   */
  async updateProfile(memberId, updateData) {
    try {
      this.logger.info?.('MemberDashboard', 'Updating member profile', { memberId });

      // Only allow updating certain fields
      const allowedFields = ['phone', 'address', 'emergencyContact'];
      const filtered = {};

      allowedFields.forEach(field => {
        if (field in updateData) {
          filtered[field] = updateData[field];
        }
      });

      const updated = await this.dataService?.update?.('members', memberId, filtered);

      this.logger.info?.('MemberDashboard', 'Profile updated successfully', { memberId });
      this.eventBus?.publish?.('member:profileUpdated', updated);

      return updated;
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to update profile', error);
      throw error;
    }
  }

  /**
   * Get membership summary
   * @param {string} memberId - Member ID
   * @returns {Promise<Object>} Summary data
   */
  async getMembershipSummary(memberId) {
    try {
      const member = await this.getMemberProfile(memberId);
      const outstandingBills = await this.getOutstandingBills(memberId);
      const totalOutstanding = await this.getTotalOutstanding(memberId);
      const unreadCount = await this.getUnreadNotificationsCount(memberId);

      return {
        memberId,
        name: member.name,
        email: member.email,
        status: member.status,
        joinDate: member.joinDate,
        outstandingBills: outstandingBills.length,
        totalOutstanding,
        unreadNotifications: unreadCount,
        lastPayment: member.lastPayment,
        totalPaid: member.totalPaid
      };
    } catch (error) {
      this.logger.error?.('MemberDashboard', 'Failed to get membership summary', error);
      throw error;
    }
  }
}

// Create singleton instance
const memberDashboard = new MemberDashboard();

// Export globally
if (typeof window !== 'undefined') {
  window.memberDashboard = memberDashboard;
  window.MemberDashboard = MemberDashboard;
}
