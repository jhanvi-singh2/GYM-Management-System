// Billing and payment handling
// manage membership packages and bills

class AdminBillingManager {
  constructor() {
    this.logger = typeof window !== 'undefined' ? window.logger : console;
    this.dataService = typeof window !== 'undefined' ? window.dataService : null;
    this.eventBus = typeof window !== 'undefined' ? window.eventBus : null;
  }

  async createFeePackage(packageData) {
    try {
      this.logger.info?.('AdminBillingManager', 'Creating package', { 
        name: packageData.name 
      });

      this._validatePackageData(packageData);

      const feePackage = {
        ...packageData,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      const created = await this.dataService?.create?.('feePackages', feePackage);

      this.logger.info?.('AdminBillingManager', 'Fee package created', { 
        packageId: created?.id 
      });

      return created;
    } catch (error) {
      this.logger.error?.('AdminBillingManager', 'Failed to create fee package', error);
      throw error;
    }
  }

  /**
   * Create bill for member
   * @param {Object} billData - Bill information
   * @param {string} billData.memberId - Member ID
   * @param {number} billData.amount - Bill amount
   * @param {string} billData.dueDate - Due date
   * @returns {Promise<Object>} Created bill
   */
  async createBill(billData) {
    try {
      this.logger.info?.('AdminBillingManager', 'Creating bill', { 
        memberId: billData.memberId 
      });

      this._validateBillData(billData);

      const bill = {
        ...billData,
        billDate: new Date().toISOString(),
        status: 'pending',
        receiptNumber: this._generateReceiptNumber(),
        paidDate: null
      };

      const created = await this.dataService?.create?.('bills', bill);

      this.logger.info?.('AdminBillingManager', 'Bill created successfully', { 
        billId: created?.id,
        amount: billData.amount
      });

      this.eventBus?.publish?.('bill:created', created);

      return created;
    } catch (error) {
      this.logger.error?.('AdminBillingManager', 'Failed to create bill', error);
      throw error;
    }
  }

  /**
   * Record payment for bill
   * @param {string} billId - Bill ID
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Updated bill
   */
  async recordPayment(billId, paymentData) {
    try {
      this.logger.info?.('AdminBillingManager', 'Recording payment', { billId });

      const bill = await this.dataService?.read?.('bills', billId);
      if (!bill) {
        throw new Error(`Bill ${billId} not found`);
      }

      if (bill.status === 'paid') {
        throw new Error('Bill is already paid');
      }

      const updated = await this.dataService?.update?.('bills', billId, {
        status: 'paid',
        paidDate: new Date().toISOString(),
        paymentMethod: paymentData.method,
        paymentNotes: paymentData.notes
      });

      this.logger.info?.('AdminBillingManager', 'Payment recorded successfully', { billId });
      this.eventBus?.publish?.('payment:recorded', updated);

      return updated;
    } catch (error) {
      this.logger.error?.('AdminBillingManager', 'Failed to record payment', error);
      throw error;
    }
  }

  /**
   * Generate bill receipt
   * @param {string} billId - Bill ID
   * @returns {Promise<Object>} Receipt data
   */
  async generateReceipt(billId) {
    try {
      const bill = await this.dataService?.read?.('bills', billId);
      if (!bill) {
        throw new Error(`Bill ${billId} not found`);
      }

      const receipt = {
        receiptNumber: bill.receiptNumber,
        billDate: bill.billDate,
        amount: bill.amount,
        status: bill.status,
        paidDate: bill.paidDate,
        memberId: bill.memberId,
        generatedAt: new Date().toISOString()
      };

      this.logger.info?.('AdminBillingManager', 'Receipt generated', { billId });

      return receipt;
    } catch (error) {
      this.logger.error?.('AdminBillingManager', 'Failed to generate receipt', error);
      throw error;
    }
  }

  /**
   * Get all fee packages
   * @returns {Promise<Array>} Array of packages
   */
  async getFeePackages() {
    try {
      return await this.dataService?.readAll?.('feePackages', { isActive: true });
    } catch (error) {
      this.logger.error?.('AdminBillingManager', 'Failed to get fee packages', error);
      throw error;
    }
  }

  /**
   * Get bills for member
   * @param {string} memberId - Member ID
   * @returns {Promise<Array>} Array of bills
   */
  async getMemberBills(memberId) {
    try {
      return await this.dataService?.readAll?.('bills', { memberId });
    } catch (error) {
      this.logger.error?.('AdminBillingManager', 'Failed to get member bills', error);
      throw error;
    }
  }

  /**
   * Get overdue bills
   * @returns {Promise<Array>} Array of overdue bills
   */
  async getOverdueBills() {
    try {
      const bills = await this.dataService?.readAll?.('bills');
      const today = new Date();

      return bills.filter(bill => 
        bill.status === 'pending' && new Date(bill.dueDate) < today
      );
    } catch (error) {
      this.logger.error?.('AdminBillingManager', 'Failed to get overdue bills', error);
      throw error;
    }
  }

  /**
   * Validate package data
   * @private
   * @param {Object} data - Package data
   */
  _validatePackageData(data) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Package name is required');
    }
    if (typeof data.price !== 'number' || data.price <= 0) {
      throw new Error('Price must be a positive number');
    }
    if (!['monthly', 'quarterly', 'annual'].includes(data.duration)) {
      throw new Error('Invalid duration');
    }
  }

  /**
   * Validate bill data
   * @private
   * @param {Object} data - Bill data
   */
  _validateBillData(data) {
    if (!data.memberId) {
      throw new Error('Member ID is required');
    }
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    if (!data.dueDate) {
      throw new Error('Due date is required');
    }
  }

  /**
   * Generate unique receipt number
   * @private
   * @returns {string}
   */
  _generateReceiptNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `RCP-${timestamp.slice(-4)}-${random}`;
  }
}

// Create singleton instance
const adminBillingManager = new AdminBillingManager();

// Export globally
if (typeof window !== 'undefined') {
  window.adminBillingManager = adminBillingManager;
  window.AdminBillingManager = AdminBillingManager;
}
