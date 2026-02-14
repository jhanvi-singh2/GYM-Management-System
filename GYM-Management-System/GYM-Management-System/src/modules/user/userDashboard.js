// User dashboard - basic access to gym info
// can browse packages and supplements

class UserDashboard {
  constructor() {
    this.logger = typeof window !== 'undefined' ? window.logger : console;
    this.dataService = typeof window !== 'undefined' ? window.dataService : null;
    this.authService = typeof window !== 'undefined' ? window.authService : null;
  }

  async getUserProfile(userId) {
    // get user profile info
    try {
      this.logger.info?.('UserDashboard', 'Fetching user profile', { userId });

      const user = await this.dataService?.read?.('users', userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive data
      delete user.password;

      return user;
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to get user profile', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Updated data
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, updateData) {
    try {
      this.logger.info?.('UserDashboard', 'Updating user profile', { userId });

      // Only allow updating certain fields
      const allowedFields = ['phone', 'address', 'bio', 'profileImage'];
      const filtered = {};

      allowedFields.forEach(field => {
        if (field in updateData) {
          filtered[field] = updateData[field];
        }
      });

      const updated = await this.dataService?.update?.('users', userId, filtered);

      // Remove sensitive data
      delete updated.password;

      this.logger.info?.('UserDashboard', 'Profile updated', { userId });

      return updated;
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to update profile', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      this.logger.info?.('UserDashboard', 'Changing password', { userId });

      if (!currentPassword || !newPassword) {
        throw new Error('Current and new password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      // In real app, verify current password
      // For now, just update
      await this.dataService?.update?.('users', userId, {
        password: newPassword,
        passwordChangedAt: new Date().toISOString()
      });

      this.logger.info?.('UserDashboard', 'Password changed successfully', { userId });
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to change password', error);
      throw error;
    }
  }

  /**
   * Search gym records or information
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async search(query) {
    try {
      this.logger.info?.('UserDashboard', 'Performing search', { query });

      const results = {
        query,
        members: [],
        supplements: [],
        information: []
      };

      // Search members
      try {
        const members = await this.dataService?.readAll?.('members');
        const lowerQuery = query.toLowerCase();
        results.members = members.filter(m => 
          m.name.toLowerCase().includes(lowerQuery) ||
          m.email.toLowerCase().includes(lowerQuery)
        );
      } catch (e) {
        this.logger.debug?.('UserDashboard', 'Member search not available', {});
      }

      // Search supplements
      try {
        const supplements = await this.dataService?.readAll?.('supplements');
        const lowerQuery = query.toLowerCase();
        results.supplements = supplements.filter(s => 
          s.name.toLowerCase().includes(lowerQuery) ||
          s.description.toLowerCase().includes(lowerQuery)
        );
      } catch (e) {
        this.logger.debug?.('UserDashboard', 'Supplement search not available', {});
      }

      this.logger.info?.('UserDashboard', 'Search completed', { 
        resultsCount: results.members.length + results.supplements.length 
      });

      return results;
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Search failed', error);
      throw error;
    }
  }

  /**
   * Get supplement catalog
   * @returns {Promise<Array>} Array of supplements
   */
  async getSupplements() {
    try {
      this.logger.info?.('UserDashboard', 'Fetching supplements');

      const supplements = await this.dataService?.readAll?.('supplements');

      return supplements;
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to get supplements', error);
      throw error;
    }
  }

  /**
   * Get supplement details
   * @param {string} supplementId - Supplement ID
   * @returns {Promise<Object>} Supplement details
   */
  async getSupplementDetails(supplementId) {
    try {
      const supplement = await this.dataService?.read?.('supplements', supplementId);

      if (!supplement) {
        throw new Error('Supplement not found');
      }

      return supplement;
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to get supplement details', error);
      throw error;
    }
  }

  /**
   * View diet details
   * @param {string} dietId - Diet ID
   * @returns {Promise<Object>} Diet details
   */
  async getDietDetails(dietId) {
    try {
      this.logger.info?.('UserDashboard', 'Fetching diet details', { dietId });

      const diet = await this.dataService?.read?.('diets', dietId);

      if (!diet) {
        throw new Error('Diet not found');
      }

      return diet;
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to get diet details', error);
      throw error;
    }
  }

  /**
   * Get available diets
   * @returns {Promise<Array>} Array of diets
   */
  async getAvailableDiets() {
    try {
      this.logger.info?.('UserDashboard', 'Fetching available diets');

      const diets = await this.dataService?.readAll?.('diets');

      return diets;
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to get diets', error);
      throw error;
    }
  }

  /**
   * Get user activity log
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of activity logs
   */
  async getActivityLog(userId) {
    try {
      const logs = await this.dataService?.readAll?.('activityLogs', { userId });

      return logs.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to get activity log', error);
      throw error;
    }
  }

  /**
   * Get user dashboard summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Summary data
   */
  async getDashboardSummary(userId) {
    try {
      const user = await this.getUserProfile(userId);
      const activityCount = (await this.getActivityLog(userId)).length;

      return {
        userId,
        name: user.name,
        email: user.email,
        role: user.role,
        recentActivity: activityCount,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };
    } catch (error) {
      this.logger.error?.('UserDashboard', 'Failed to get dashboard summary', error);
      throw error;
    }
  }
}

// Create singleton instance
const userDashboard = new UserDashboard();

// Export globally
if (typeof window !== 'undefined') {
  window.userDashboard = userDashboard;
  window.UserDashboard = UserDashboard;
}
