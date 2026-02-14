// Report generation and analytics
// FIXME: needs better charting library

class AdminReportManager {
  constructor() {
    this.logger = typeof window !== 'undefined' ? window.logger : console;
    this.dataService = typeof window !== 'undefined' ? window.dataService : null;
  }

  async generateMemberReport(options = {}) {
    try {
      this.logger.info?.('AdminReportManager', 'Generating member report');

      const members = await this.dataService?.readAll?.('members');
      
      const report = {
        title: 'Member Report',
        generatedAt: new Date().toISOString(),
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        inactiveMembers: members.filter(m => m.status === 'inactive').length,
        suspendedMembers: members.filter(m => m.status === 'suspended').length,
        membersList: options.detailed ? members : null
      };

      this.logger.info?.('AdminReportManager', 'Member report generated', { 
        totalMembers: report.totalMembers 
      });

      return report;
    } catch (error) {
      this.logger.error?.('AdminReportManager', 'Failed to generate member report', error);
      throw error;
    }
  }

  /**
   * Generate billing report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Report data
   */
  async generateBillingReport(options = {}) {
    try {
      this.logger.info?.('AdminReportManager', 'Generating billing report');

      const bills = await this.dataService?.readAll?.('bills');

      const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
      const paidAmount = bills
        .filter(b => b.status === 'paid')
        .reduce((sum, bill) => sum + bill.amount, 0);
      const pendingAmount = bills
        .filter(b => b.status === 'pending')
        .reduce((sum, bill) => sum + bill.amount, 0);

      const report = {
        title: 'Billing Report',
        generatedAt: new Date().toISOString(),
        totalBills: bills.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        collectionRate: ((paidAmount / totalAmount) * 100).toFixed(2),
        billsList: options.detailed ? bills : null
      };

      this.logger.info?.('AdminReportManager', 'Billing report generated', { 
        totalBills: report.totalBills,
        collectionRate: report.collectionRate
      });

      return report;
    } catch (error) {
      this.logger.error?.('AdminReportManager', 'Failed to generate billing report', error);
      throw error;
    }
  }

  /**
   * Generate revenue report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Report data
   */
  async generateRevenueReport(options = {}) {
    try {
      this.logger.info?.('AdminReportManager', 'Generating revenue report');

      const bills = await this.dataService?.readAll?.('bills', { status: 'paid' });

      const monthlyRevenue = {};
      bills.forEach(bill => {
        const month = new Date(bill.paidDate).toISOString().slice(0, 7);
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + bill.amount;
      });

      const report = {
        title: 'Revenue Report',
        generatedAt: new Date().toISOString(),
        totalRevenue: bills.reduce((sum, bill) => sum + bill.amount, 0),
        monthlyRevenue,
        averageMonthlyRevenue: this._calculateAverage(Object.values(monthlyRevenue))
      };

      this.logger.info?.('AdminReportManager', 'Revenue report generated', { 
        totalRevenue: report.totalRevenue 
      });

      return report;
    } catch (error) {
      this.logger.error?.('AdminReportManager', 'Failed to generate revenue report', error);
      throw error;
    }
  }

  /**
   * Export data as CSV
   * @param {string} collection - Collection name
   * @returns {Promise<string>} CSV data
   */
  async exportAsCSV(collection) {
    try {
      this.logger.info?.('AdminReportManager', 'Exporting as CSV', { collection });

      const data = await this.dataService?.readAll?.(collection);

      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      this.logger.info?.('AdminReportManager', 'CSV export successful', { 
        collection,
        rows: data.length 
      });

      return csvContent;
    } catch (error) {
      this.logger.error?.('AdminReportManager', 'Failed to export as CSV', error);
      throw error;
    }
  }

  /**
   * Export data as JSON
   * @param {string} collection - Collection name
   * @returns {Promise<string>} JSON data
   */
  async exportAsJSON(collection) {
    try {
      this.logger.info?.('AdminReportManager', 'Exporting as JSON', { collection });

      const data = await this.dataService?.readAll?.(collection);

      const jsonContent = JSON.stringify(data, null, 2);

      this.logger.info?.('AdminReportManager', 'JSON export successful', { 
        collection,
        records: data.length 
      });

      return jsonContent;
    } catch (error) {
      this.logger.error?.('AdminReportManager', 'Failed to export as JSON', error);
      throw error;
    }
  }

  /**
   * Generate performance metrics
   * @returns {Promise<Object>} Metrics data
   */
  async generatePerformanceMetrics() {
    try {
      const members = await this.dataService?.readAll?.('members');
      const bills = await this.dataService?.readAll?.('bills');

      const metrics = {
        title: 'Performance Metrics',
        generatedAt: new Date().toISOString(),
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        memberRetentionRate: ((members.filter(m => m.status === 'active').length / members.length) * 100).toFixed(2),
        totalBills: bills.length,
        totalRevenue: bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0),
        billPaymentRate: ((bills.filter(b => b.status === 'paid').length / bills.length) * 100).toFixed(2)
      };

      this.logger.info?.('AdminReportManager', 'Performance metrics generated', metrics);

      return metrics;
    } catch (error) {
      this.logger.error?.('AdminReportManager', 'Failed to generate performance metrics', error);
      throw error;
    }
  }

  /**
   * Calculate average
   * @private
   * @param {Array<number>} values
   * @returns {number}
   */
  _calculateAverage(values) {
    if (values.length === 0) return 0;
    return (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
  }
}

// Create singleton instance
const adminReportManager = new AdminReportManager();

// Export globally
if (typeof window !== 'undefined') {
  window.adminReportManager = adminReportManager;
  window.AdminReportManager = AdminReportManager;
}
