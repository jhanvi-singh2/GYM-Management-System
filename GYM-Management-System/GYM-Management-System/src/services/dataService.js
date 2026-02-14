// Data layer - handles CRUD operations
// uses localStorage as mock database for now
// TODO: Replace with real Firebase Firestore when ready

class DataService {
  constructor() {
    this.logger = typeof window !== 'undefined' ? window.logger : console;
    this.eventBus = typeof window !== 'undefined' ? window.eventBus : null;
    this.data = {
      members: [],
      bills: [],
      notifications: [],
      feePackages: [],
      supplements: []
    };
    // load existing data
    this._loadFromStorage();
  }

  /**
   * Load data from local storage
   * @private
   */
  _loadFromStorage() {
    try {
      const stored = localStorage.getItem('gymData');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = { ...this.data, ...parsed };
        console.log('[DataService] Loaded from storage');
      } else {
        // initialize with default members if no data exists
        this._initializeDefaultData();
      }
    } catch (error) {
      console.error('[DataService] Error loading storage:', error);
      this._initializeDefaultData();
    }
  }

  /**
   * Initialize with default members and packages
   * @private
   */
  _initializeDefaultData() {
    const defaultMembers = [
      {
        id: 'mem_' + Date.now() + '001',
        name: 'Krishna',
        email: 'krishna@gym.com',
        phone: '9876543210',
        gender: 'Male',
        age: 23,
        gymStartDate: '01/01/2026',
        status: 'active',
        feePackage: 'monthly',
        joinDate: new Date().toISOString(),
        lastPayment: new Date().toISOString(),
        totalPaid: 5000
      },
      {
        id: 'mem_' + Date.now() + '002',
        name: 'Shivam',
        email: 'shivam@gym.com',
        phone: '9876543211',
        gender: 'Male',
        age: 25,
        gymStartDate: '05/01/2026',
        status: 'active',
        feePackage: 'monthly',
        joinDate: new Date().toISOString(),
        lastPayment: new Date().toISOString(),
        totalPaid: 5000
      },
      {
        id: 'mem_' + Date.now() + '003',
        name: 'Jhanvi',
        email: 'jhanvi@gym.com',
        phone: '9876543212',
        gender: 'Female',
        age: 21,
        gymStartDate: '08/01/2026',
        status: 'active',
        feePackage: 'monthly',
        joinDate: new Date().toISOString(),
        lastPayment: new Date().toISOString(),
        totalPaid: 5000
      },
      {
        id: 'mem_' + Date.now() + '004',
        name: 'Hardik',
        email: 'hardik@gym.com',
        phone: '9876543213',
        gender: 'Male',
        age: 27,
        gymStartDate: '02/01/2026',
        status: 'active',
        feePackage: 'quarterly',
        joinDate: new Date().toISOString(),
        lastPayment: new Date().toISOString(),
        totalPaid: 13500
      },
      {
        id: 'mem_' + Date.now() + '005',
        name: 'Gunjan',
        email: 'gunjan@gym.com',
        phone: '9876543214',
        gender: 'Female',
        age: 24,
        gymStartDate: '10/01/2026',
        status: 'active',
        feePackage: 'monthly',
        joinDate: new Date().toISOString(),
        lastPayment: new Date().toISOString(),
        totalPaid: 5000
      }
    ];

    const defaultPackages = [
      {
        id: 'pkg_001',
        name: 'Monthly',
        key: 'monthly',
        price: 5000,
        duration: '1 Month',
        features: ['Gym Access', 'Basic Equipment']
      },
      {
        id: 'pkg_002',
        name: 'Quarterly',
        key: 'quarterly',
        price: 13500,
        duration: '3 Months',
        features: ['Gym Access', 'All Equipment', 'Personal Locker']
      },
      {
        id: 'pkg_003',
        name: 'Annual',
        key: 'annual',
        price: 50000,
        duration: '12 Months',
        features: ['Gym Access', 'All Equipment', 'Personal Locker', 'Trainer Session', 'Priority Support']
      }
    ];

    this.data.members = defaultMembers;
    this.data.feePackages = defaultPackages;
    this._saveToStorage();
    console.log('[DataService] Initialized with default data');
  }

  /**
   * Save data to local storage
   * @private
   */
  _saveToStorage() {
    try {
      localStorage.setItem('gymData', JSON.stringify(this.data));
    } catch (error) {
      console.error('[DataService] Error saving to storage:', error);
    }
  }

  async create(collection, data) {
    try {
      this.logger.info?.('DataService', `Creating in ${collection}`, { data });

      const docId = this._generateDocId();
      const document = {
        id: docId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // store in memory
      if (this.data[collection]) {
        this.data[collection].push(document);
        this._saveToStorage();
      }

      this.logger.info?.('DataService', 'Document created', { collection, docId });
      this.eventBus?.publish?.(`${collection}:created`, document);

      return document;
    } catch (error) {
      this.logger.error?.('DataService', `Failed to create in ${collection}`, error);
      throw error;
    }
  }

  async read(collection, docId) {
    try {
      // fetch single doc
      this.logger.debug?.('DataService', `Reading from ${collection}`, { docId });

      const doc = this.data[collection]?.find(d => d.id === docId);
      if (!doc) {
        throw new Error(`Document ${docId} not found in ${collection}`);
      }

      return doc;
    } catch (error) {
      this.logger.error?.('DataService', `Failed to read`, error);
      throw error;
    }
  }

  async readAll(collection, filter = {}) {
    try {
      // get all docs from collection
      this.logger.debug?.('DataService', `Reading all from ${collection}`, { filter });

      let docs = [...(this.data[collection] || [])];

      // apply filters if provided
      if (Object.keys(filter).length > 0) {
        docs = docs.filter(doc => {
          return Object.entries(filter).every(([key, value]) => doc[key] === value);
        });
      }

      return docs;
    } catch (error) {
      this.logger.error?.('DataService', `Failed to read collection`, error);
      throw error;
    }
  }

  async update(collection, docId, data) {
    try {
      this.logger.info?.('DataService', `Updating ${collection}`, { docId, data });

      const index = this.data[collection]?.findIndex(d => d.id === docId);
      if (index === -1 || index === undefined) {
        throw new Error(`Document ${docId} not found in ${collection}`);
      }

      const updated = {
        ...this.data[collection][index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      this.data[collection][index] = updated;
      this._saveToStorage();

      this.logger.info?.('DataService', 'Document updated', { collection, docId });
      this.eventBus?.publish?.(`${collection}:updated`, updated);

      return updated;
    } catch (error) {
      this.logger.error?.('DataService', `Failed to update`, error);
      throw error;
    }
  }

  async delete(collection, docId) {
    try {
      this.logger.info?.('DataService', `Deleting document from ${collection}`, { docId });

      const index = this.data[collection]?.findIndex(d => d.id === docId);
      if (index === -1 || index === undefined) {
        throw new Error(`Document ${docId} not found in ${collection}`);
      }

      const deleted = this.data[collection][index];
      this.data[collection].splice(index, 1);
      this._saveToStorage();

      this.logger.info?.('DataService', 'Document deleted successfully', { collection, docId });
      this.eventBus?.publish?.(`${collection}:deleted`, deleted);
    } catch (error) {
      this.logger.error?.('DataService', `Failed to delete document from ${collection}`, error);
      throw error;
    }
  }

  /**
   * Query documents with advanced filters
   * @param {string} collection - Collection name
   * @param {Array} conditions - Query conditions
   * @returns {Promise<Array>} Matching documents
   */
  async query(collection, conditions = []) {
    try {
      this.logger.debug?.('DataService', `Querying ${collection}`, { conditions });

      let results = [...(this.data[collection] || [])];

      conditions.forEach(condition => {
        const { field, operator, value } = condition;
        results = results.filter(doc => {
          switch (operator) {
            case '==': return doc[field] === value;
            case '!=': return doc[field] !== value;
            case '>': return doc[field] > value;
            case '<': return doc[field] < value;
            case '>=': return doc[field] >= value;
            case '<=': return doc[field] <= value;
            case 'in': return Array.isArray(value) && value.includes(doc[field]);
            default: return true;
          }
        });
      });
      return results;
    } catch (error) {
      this.logger.error?.('DataService', `Query failed on ${collection}`, error);
      throw error;
    }
  }

  getStats(collection) {
    // quick stats for debugging
    const docs = this.data[collection] || [];
    return {
      total: docs.length,
      collection,
      firstDoc: docs[0],
      lastDoc: docs[docs.length - 1]
    };
  }

  _generateDocId() {
    // create id using timestamp + random
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
const dataService = new DataService();

// Export globally
if (typeof window !== 'undefined') {
  window.dataService = dataService;
  window.DataService = DataService;
}
