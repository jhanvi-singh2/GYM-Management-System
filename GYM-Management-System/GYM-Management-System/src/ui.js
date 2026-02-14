// UI helper functions
// Creates modals, alerts, forms, etc

class UIManager {
  constructor() {
    this.app = null;
    this.currentModal = null;
  }

  init(app) {
    this.app = app;
  }

  showAlert(message, type = 'info', duration = 3000) {
    // show notification toast
    const alertId = `alert-${Date.now()}`;
    const alertHTML = `
      <div class="alert alert-${type}" id="${alertId}" style="animation: slideDown 0.3s ease-out;">
        ${message}
      </div>
    `;

    const alertContainer = document.querySelector('.alert-container') || this._createAlertContainer();
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);

    if (duration > 0) {
      setTimeout(() => {
        const element = document.getElementById(alertId);
        if (element) {
          element.style.animation = 'slideDown 0.3s ease-out reverse';
          setTimeout(() => element.remove(), 300);
        }
      }, duration);
    }
  }

  /**
   * Create alert container
   * @private
   */
  _createAlertContainer() {
    const container = document.createElement('div');
    container.className = 'alert-container';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 400px;';
    document.body.appendChild(container);
    return container;
  }

  /**
   * Open modal dialog
   * @param {string} title - Modal title
   * @param {string} content - Modal content HTML
   * @param {Array} buttons - Action buttons
   */
  openModal(title, content, buttons = []) {
    const modalId = `modal-${Date.now()}`;
    const buttonsHTML = buttons.map(btn => `
      <button class="btn-small ${btn.class || 'btn-primary-small'}" data-action="${btn.action}">
        ${btn.label}
      </button>
    `).join('');

    const modalHTML = `
      <div class="modal active" id="${modalId}">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${title}</h2>
            <button class="close-btn" data-close>&times;</button>
          </div>
          <div class="modal-body">${content}</div>
          <div class="modal-footer" style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
            ${buttonsHTML}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById(modalId);
    const closeBtn = modal.querySelector('[data-close]');
    
    closeBtn.addEventListener('click', () => this.closeModal(modalId));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal(modalId);
    });

    buttons.forEach(btn => {
      const btnElement = modal.querySelector(`[data-action="${btn.action}"]`);
      if (btnElement && btn.callback) {
        btnElement.addEventListener('click', () => {
          btn.callback();
          this.closeModal(modalId);
        });
      }
    });

    this.currentModal = modalId;
    return modalId;
  }

  /**
   * Close modal
   * @param {string} modalId - Modal ID
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  }

  /**
   * Show loading state
   * @param {boolean} show - Show/hide loader
   */
  showLoading(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
      if (show) {
        loader.classList.add('active');
      } else {
        loader.classList.remove('active');
      }
    }
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format date
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get status badge HTML
   * @param {string} status - Status value
   * @returns {string} HTML badge
   */
  getStatusBadge(status) {
    const badges = {
      active: '<span class="badge badge-success">Active</span>',
      inactive: '<span class="badge badge-warning">Inactive</span>',
      suspended: '<span class="badge badge-danger">Suspended</span>',
      paid: '<span class="badge badge-success">Paid</span>',
      pending: '<span class="badge badge-warning">Pending</span>',
      overdue: '<span class="badge badge-danger">Overdue</span>'
    };
    return badges[status] || status;
  }

  /**
   * Create form input
   * @param {Object} config - Input configuration
   * @returns {string} HTML input
   */
  createInput(config) {
    const { name, label, type = 'text', placeholder = '', value = '', required = false } = config;
    return `
      <div class="form-group">
        <label for="${name}">${label}${required ? ' *' : ''}</label>
        <input 
          type="${type}" 
          id="${name}" 
          name="${name}" 
          placeholder="${placeholder}"
          value="${value}"
          ${required ? 'required' : ''}
        >
      </div>
    `;
  }

  /**
   * Create select dropdown
   * @param {Object} config - Select configuration
   * @returns {string} HTML select
   */
  createSelect(config) {
    const { name, label, options = [], value = '', required = false } = config;
    const optionsHTML = options.map(opt => `
      <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
        ${opt.label}
      </option>
    `).join('');

    return `
      <div class="form-group">
        <label for="${name}">${label}${required ? ' *' : ''}</label>
        <select id="${name}" name="${name}" ${required ? 'required' : ''}>
          <option value="">Select ${label}</option>
          ${optionsHTML}
        </select>
      </div>
    `;
  }

  /**
   * Create table row
   * @param {Array} columns - Column values
   * @param {Array} actions - Action buttons
   * @returns {string} HTML row
   */
  createTableRow(columns, actions = []) {
    const actionsHTML = actions.map(action => `
      <button class="btn-small btn-primary-small" data-action="${action.action}" title="${action.title}">
        ${action.label}
      </button>
    `).join('');

    return `
      <tr>
        ${columns.map(col => `<td>${col}</td>`).join('')}
        <td style="text-align: center;">${actionsHTML}</td>
      </tr>
    `;
  }

  /**
   * Create stat card
   * @param {Object} config - Card configuration
   * @returns {string} HTML card
   */
  createStatCard(config) {
    const { icon, value, label, color = 'var(--primary)' } = config;
    return `
      <div class="stat-card">
        <div class="stat-icon" style="color: ${color};">${icon}</div>
        <div class="stat-value" style="color: ${color};">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    `;
  }

  /**
   * Create empty state
   * @param {string} message - Empty state message
   * @param {string} icon - Icon emoji
   * @returns {string} HTML empty state
   */
  createEmptyState(message, icon = '📭') {
    return `
      <div class="empty-state">
        <div style="font-size: 3em; margin-bottom: 10px;">${icon}</div>
        <h3>${message}</h3>
      </div>
    `;
  }

  /**
   * Format number with commas
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Get initials from name
   * @param {string} name - Full name
   * @returns {string} Initials
   */
  getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get form data
   * @param {HTMLElement} form - Form element
   * @returns {Object} Form data
   */
  getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    return data;
  }

  /**
   * Set form data
   * @param {HTMLElement} form - Form element
   * @param {Object} data - Data to set
   */
  setFormData(form, data) {
    Object.entries(data).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = value;
      }
    });
  }

  /**
   * Create export menu
   * @param {Array} formats - Export formats
   */
  createExportMenu(formats = ['CSV', 'JSON', 'PDF']) {
    const menu = document.createElement('div');
    menu.className = 'export-menu';
    menu.style.cssText = `
      position: absolute;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      min-width: 150px;
    `;

    formats.forEach(format => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 10px 15px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
      `;
      item.textContent = `Export as ${format}`;
      item.addEventListener('mouseover', () => {
        item.style.background = '#f5f5f5';
      });
      item.addEventListener('mouseout', () => {
        item.style.background = 'white';
      });
      item.onclick = () => this._handleExport(format);
      menu.appendChild(item);
    });

    return menu;
  }

  /**
   * Handle export
   * @private
   */
  _handleExport(format) {
    this.showAlert(`Exporting as ${format}...`, 'info', 2000);
  }

  /**
   * Get color for role
   * @param {string} role - User role
   * @returns {string} Color code
   */
  getRoleColor(role) {
    const colors = {
      admin: '#667eea',
      member: '#48c774',
      user: '#3273dc'
    };
    return colors[role] || '#999';
  }

  /**
   * Create progress bar
   * @param {number} percentage - Progress percentage
   * @param {string} label - Label
   * @returns {string} HTML progress bar
   */
  createProgressBar(percentage, label = '') {
    return `
      <div style="margin: 10px 0;">
        ${label ? `<div style="font-size: 0.9em; margin-bottom: 5px;">${label}</div>` : ''}
        <div style="background: #eee; border-radius: 10px; height: 20px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, var(--primary), var(--secondary)); width: ${percentage}%; height: 100%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8em; font-weight: 600;">
            ${Math.round(percentage)}%
          </div>
        </div>
      </div>
    `;
  }
}

// Create singleton instance
const ui = new UIManager();

// Export globally
if (typeof window !== 'undefined') {
  window.ui = ui;
  window.UIManager = UIManager;
}
