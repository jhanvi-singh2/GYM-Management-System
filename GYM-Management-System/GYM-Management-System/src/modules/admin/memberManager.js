// Admin member operations
// Add, update, delete members in the system

class AdminMemberManager {
  constructor() {
    this.logger = typeof window !== 'undefined' ? window.logger : console;
    this.dataService = typeof window !== 'undefined' ? window.dataService : null;
    this.eventBus = typeof window !== 'undefined' ? window.eventBus : null;
  }

  async addMember(memberData) {
    try {
      this.logger.info?.('AdminMemberManager', 'Adding new member', { email: memberData.email });

      this._validateMemberData(memberData);

      const member = {
        ...memberData,
        status: 'active',
        joinDate: new Date().toISOString(),
        lastPayment: null,
        totalPaid: 0
      };

      const createdMember = await this.dataService?.create?.('members', member);

      this.logger.info?.('AdminMemberManager', 'Member added', { 
        memberId: createdMember?.id 
      });

      return createdMember;
    } catch (error) {
      this.logger.error?.('AdminMemberManager', 'Failed to add member', error);
      throw error;
    }
  }

  /**
   * Update member information
   * @param {string} memberId - Member ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated member
   */
  async updateMember(memberId, updateData) {
    try {
      this.logger.info?.('AdminMemberManager', 'Updating member', { memberId });

      // Get existing member
      const member = await this.dataService?.read?.('members', memberId);
      if (!member) {
        throw new Error(`Member ${memberId} not found`);
      }

      const updated = await this.dataService?.update?.('members', memberId, updateData);

      this.logger.info?.('AdminMemberManager', 'Member updated successfully', { memberId });
      this.eventBus?.publish?.('member:updated', updated);

      return updated;
    } catch (error) {
      this.logger.error?.('AdminMemberManager', 'Failed to update member', error);
      throw error;
    }
  }

  async deleteMember(memberId) {
    try {
      this.logger.info?.('AdminMemberManager', 'Deleting member', { memberId });

      await this.dataService?.delete?.('members', memberId);

      this.logger.info?.('AdminMemberManager', 'Member deleted', { memberId });
      this.eventBus?.publish?.('member:deleted', { id: memberId });
    } catch (error) {
      this.logger.error?.('AdminMemberManager', 'Failed to delete member', error);
      throw error;
    }
  }

  async getAllMembers() {
    try {
      return await this.dataService?.readAll?.('members');
    } catch (error) {
      this.logger.error?.('AdminMemberManager', 'Failed to get members', error);
      throw error;
    }
  }

  async searchMembers(query) {
    try {
      // find members by name or email
      const members = await this.dataService?.readAll?.('members');
      const lowerQuery = query.toLowerCase();

      return members.filter(m => 
        m.name.toLowerCase().includes(lowerQuery) ||
        m.email.toLowerCase().includes(lowerQuery) ||
        m.phone.includes(query)
      );
    } catch (error) {
      this.logger.error?.('AdminMemberManager', 'Search failed', error);
      throw error;
    }
  }

  async updateMemberStatus(memberId, status) {
    try {
      // validate status
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      return await this.updateMember(memberId, { status });
    } catch (error) {
      this.logger.error?.('AdminMemberManager', 'Failed to update status', error);
      throw error;
    }
  }

  _validateMemberData(data) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Member name is required');
    }
    if (!data.email || !this._validateEmail(data.email)) {
      throw new Error('Valid email is required');
    }
    if (!data.phone || data.phone.trim() === '') {
      throw new Error('Phone number is required');
    }
    if (!data.feePackage) {
      throw new Error('Fee package is required');
    }
  }

  _validateEmail(email) {
    // simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// singleton
const adminMemberManager = new AdminMemberManager();

// expose to window
if (typeof window !== 'undefined') {
  window.adminMemberManager = adminMemberManager;
  window.AdminMemberManager = AdminMemberManager;
}
