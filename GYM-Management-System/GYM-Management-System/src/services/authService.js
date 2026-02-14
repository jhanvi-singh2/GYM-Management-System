// Authentication handler
// TODO: Hook this up to real Firebase when needed

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.sessionToken = null;
    this.logger = typeof window !== 'undefined' ? window.logger : console;
    this.eventBus = typeof window !== 'undefined' ? window.eventBus : null;
  }

  async register(userData) {
    try {
      this.logger.info?.('AuthService', 'Registering user', { email: userData.email });

      // validate email and password
      if (!this._validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }
      if (!this._validatePassword(userData.password)) {
        throw new Error('Password must be at least 6 characters');
      }

      // create user object
      const user = {
        uid: this._generateUID(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date().toISOString(),
        verified: false
      };

      // store in localStorage (mock DB)
      localStorage.setItem(`user_${user.uid}`, JSON.stringify(user));
      
      // keep session
      this.currentUser = user;
      this.userRole = user.role;
      sessionStorage.setItem('currentUser', JSON.stringify(user));

      this.logger.info?.('AuthService', 'User registered', { email: userData.email });
      this.eventBus?.publish?.('user:registered', user);

      return {
        success: true,
        user,
        message: 'Registration successful!'
      };
    } catch (error) {
      this.logger.error?.('AuthService', 'Registration failed', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      this.logger.info?.('AuthService', 'Login attempt', { email });

      // check required fields
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // find user in mock db
      const user = this._findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // create token
      this.sessionToken = this._generateToken();
      this.currentUser = user;
      this.userRole = user.role;

      // save session
      sessionStorage.setItem('sessionToken', this.sessionToken);
      sessionStorage.setItem('currentUser', JSON.stringify(user));

      this.logger.info?.('AuthService', 'Login successful', { email, role: user.role });
      this.eventBus?.publish?.('user:loggedIn', user);

      return {
        success: true,
        user,
        token: this.sessionToken
      };
    } catch (error) {
      this.logger.error?.('AuthService', 'Login failed', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      this.logger.info?.('AuthService', 'User logging out', { email: this.currentUser?.email });

      // Clear session
      sessionStorage.removeItem('sessionToken');
      sessionStorage.removeItem('currentUser');

      this.currentUser = null;
      this.userRole = null;
      this.sessionToken = null;

      this.logger.info?.('AuthService', 'Logout successful');
      this.eventBus?.publish?.('user:loggedOut');
    } catch (error) {
      this.logger.error?.('AuthService', 'Logout failed', error);
      throw error;
    }
  }

  /**
   * Get current user
   * @returns {Object|null} Current user object or null
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get user role
   * @returns {string|null} User role
   */
  getUserRole() {
    return this.userRole;
  }

  isAuthenticated() {
    // check if user has valid session
    return !!this.sessionToken && !!this.currentUser;
  }

  hasPermission(resource, action) {
    // simple permission check based on role
    const permissions = {
      admin: ['member', 'bill', 'notification', 'report', 'supplement'],
      member: ['bill', 'notification', 'profile'],
      user: ['profile', 'search']
    };

    const allowedResources = permissions[this.userRole] || [];
    return allowedResources.includes(resource);
  }

  /**
   * Validate email format
   * @private
   * @param {string} email
   * @returns {boolean}
   */
  _validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @private
   * @param {string} password
   * @returns {boolean}
   */
  _validatePassword(password) {
    return password && password.length >= 8;
  }

  _generateUID() {
    // create unique user ID
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _generateToken() {
    // generate session token
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  _findUserByEmail(email) {
    // TODO: replace with real firebase query
    const mockUsers = [
      { uid: 'admin1', email: 'admin@gym.com', name: 'Jhanvi Singh', role: 'admin', verified: true },
      { uid: 'member1', email: 'member@gym.com', name: 'Member User', role: 'member', verified: true },
      { uid: 'user1', email: 'user@gym.com', name: 'Regular User', role: 'user', verified: true }
    ];

    return mockUsers.find(u => u.email === email);
  }
}

// singleton instance
const authService = new AuthService();

// expose globally
if (typeof window !== 'undefined') {
  window.authService = authService;
  window.AuthService = AuthService;
}
