// Gym Management System 
// Basic gym admin and member management

class GymApp {
  constructor() {
    this.currentUser = null;
    this.members = [];
    this.bills = [];
    this.packages = [
      { id: 1, name: 'Monthly', price: 5000, days: 30 },
      { id: 2, name: 'Quarterly', price: 13500, days: 90 },
      { id: 3, name: 'Annual', price: 50000, days: 365 }
    ];
    this.notifications = [];
    this.supplements = [
      { id: 1, name: 'Protein Powder', price: 1500 },
      { id: 2, name: 'Whey Shake', price: 100 },
      { id: 3, name: 'Creatine', price: 800 }
    ];

    this.diets = [
      { id: 1, name: 'Weight Loss Plan', details: 'Low carbs, high protein. ~1500 kcal/day.' },
      { id: 2, name: 'Muscle Gain Plan', details: 'High protein, calorie surplus. ~3000 kcal/day.' },
      { id: 3, name: 'Balanced Diet', details: 'Balanced macros for maintenance.' }
    ];
    this.loadData();
  }

  loadData() {
    const saved = localStorage.getItem('gymData');
    if (saved) {
      const data = JSON.parse(saved);
      this.members = data.members || [];
      this.bills = data.bills || [];
      this.notifications = data.notifications || [];
    } else {
      // Initialize with sample members
      this.members = [
        {
          id: 1,
          name: 'Krishna Sharma',
          email: 'krishna@gmail.com',
          phone: '9876543210',
          age: 23,
          gender: 'Male',
          package: 'Monthly',
          joinDate: '2025-11-15'
        },
        {
          id: 2,
          name: 'Shivam Verma',
          email: 'shivam@gmail.com',
          phone: '8765432109',
          age: 25,
          gender: 'Male',
          package: 'Quarterly',
          joinDate: '2025-10-20'
        },
        {
          id: 3,
          name: 'Jhanvi Desai',
          email: 'jhanvi@gmail.com',
          phone: '7654321098',
          age: 21,
          gender: 'Female',
          package: 'Monthly',
          joinDate: '2025-12-05'
        },
        {
          id: 4,
          name: 'Hardik Patel',
          email: 'hardik@gmail.com',
          phone: '6543210987',
          age: 27,
          gender: 'Male',
          package: 'Annual',
          joinDate: '2025-09-10'
        },
        {
          id: 5,
          name: 'Gunjan Singh',
          email: 'gunjan@gmail.com',
          phone: '5432109876',
          age: 24,
          gender: 'Female',
          package: 'Quarterly',
          joinDate: '2025-11-01'
        }
      ];
      this.saveData();
    }
  }

  saveData() {
    localStorage.setItem('gymData', JSON.stringify({
      members: this.members,
      bills: this.bills,
      notifications: this.notifications
    }));
  }

  init() {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.renderDashboard();
    } else {
      this.renderLogin();
    }
  }

  login(email, password) {
    const users = [
      { email: 'jhanvi@gmail.com', password: 'admin123', role: 'admin', name: 'Jhanvi Singh' },
      { email: 'member@gmail.com', password: 'member123', role: 'member', name: 'Krishna Sharma' },
      { email: 'user@gmail.com', password: 'user123', role: 'user', name: 'Regular User' }
    ];

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUser = user;
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      this.renderDashboard();
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('currentUser');
    this.renderLogin();
  }

  renderLogin() {
    document.getElementById('root').innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <span class="auth-pill">Welcome Back</span>
            <h1>Gym Manager</h1>
            <p>Sign in to manage notifications, billing, and everything in one place.</p>
          </div>
          
          <form class="auth-form" onsubmit="app.handleLogin(event)">
            <div class="form-group">
              <label for="email">Email</label>
              <input class="input-field" type="email" id="email" required placeholder="you@example.com">
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input class="input-field" type="password" id="password" required placeholder="••••••••">
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">Login</button>
          </form>

          <div class="login-info">
            <p><strong>Test Accounts</strong></p>
            <p>Admin: jhanvi@gmail.com / admin123</p>
            <p>Member: member@gmail.com / member123</p>
            <p>User: user@gmail.com / user123</p>
          </div>
        </div>
      </div>
    `;
  }

  handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (this.login(email, password)) {
      this.renderDashboard();
    } else {
      alert('Invalid credentials!');
    }
  }

  renderDashboard() {
    let content = '';
    
    if (this.currentUser.role === 'admin') {
      content = this.renderAdminDashboard();
    } else if (this.currentUser.role === 'member') {
      content = this.renderMemberDashboard();
    } else {
      content = this.renderUserDashboard();
    }

    document.getElementById('root').innerHTML = `
      <div class="app-shell">
        <aside class="sidebar">
          <div class="brand">
            <span class="brand-mark">🏋</span>
            <div>
              <h2>Gym Manager</h2>
              <p>Control center</p>
            </div>
          </div>
          <nav class="nav">
            <button onclick="app.showSection('dashboard')" class="nav-btn nav-btn-primary">📊 Dashboard</button>
          
          ${this.currentUser.role === 'admin' ? `
            <button onclick="app.showSection('members')" class="nav-btn">👥 Members</button>
            <button onclick="app.showSection('bills')" class="nav-btn">💳 Billing</button>
            <button onclick="app.showSection('notifications')" class="nav-btn">🔔 Notifications</button>
            <button onclick="app.showSection('reports')" class="nav-btn">📈 Reports</button>
            <button onclick="app.showSection('supplements')" class="nav-btn">🛒 Supplements</button>
            <button onclick="app.showSection('diets')" class="nav-btn">🥗 Diets</button>
          ` : ''}
          
          ${this.currentUser.role === 'member' || this.currentUser.role === 'user' ? `
            <button onclick="app.showSection('details')" class="nav-btn">📋 Details</button>
            <button onclick="app.showSection('notifications')" class="nav-btn">🔔 Notifications</button>
            <button onclick="app.showSection('supplements')" class="nav-btn">🛒 Supplements</button>
            <button onclick="app.showSection('diets')" class="nav-btn">🥗 Diet Plans</button>
          ` : ''}
          
          ${this.currentUser.role === 'user' ? `
            <button onclick="app.showSection('search')" class="nav-btn">🔍 Search</button>
          ` : ''}
          </nav>
          <button onclick="app.logout()" class="nav-btn nav-btn-danger">Logout</button>
        </aside>
        
        <div class="content" id="content">
          ${content}
        </div>
      </div>
    `;
  }

  renderAdminDashboard() {
    return `
      <div class="page-header">
        <div>
          <h1>Welcome, ${this.currentUser.name}</h1>
          <p>Quick snapshot of your gym performance today.</p>
        </div>
      </div>
      <div class="stat-grid">
        <div class="stat-card">
          <p class="stat-label">Total Members</p>
          <h3>${this.members.length}</h3>
        </div>
        <div class="stat-card">
          <p class="stat-label">Total Bills</p>
          <h3>${this.bills.length}</h3>
        </div>
        <div class="stat-card">
          <p class="stat-label">Active Notices</p>
          <h3>${this.notifications.length}</h3>
        </div>
        <div class="stat-card">
          <p class="stat-label">Revenue</p>
          <h3>₹${this.bills.reduce((sum, b) => sum + (b.amount || 0), 0)}</h3>
        </div>
      </div>
    `;
  }

  renderMemberDashboard() {
    return `
      <div class="page-header">
        <div>
          <h1>Welcome, ${this.currentUser.name}</h1>
          <p>Your membership details at a glance.</p>
        </div>
      </div>
      <div class="panel">
        <h3>Your Details</h3>
        <p><strong>Name:</strong> ${this.currentUser.name}</p>
        <p><strong>Email:</strong> ${this.currentUser.email}</p>
        <p><strong>Role:</strong> Member</p>
      </div>
    `;
  }

  renderUserDashboard() {
    return `
      <div class="page-header">
        <div>
          <h1>Welcome, ${this.currentUser.name}</h1>
          <p>Explore gym details and keep up with updates.</p>
        </div>
      </div>
      <div class="panel">
        <h3>User Information</h3>
        <p><strong>Name:</strong> ${this.currentUser.name}</p>
        <p><strong>Email:</strong> ${this.currentUser.email}</p>
        <p>You can browse gym details and search for information.</p>
      </div>
    `;
  }

  showSection(section) {
    let html = '';
    
    if (section === 'dashboard') {
      html = this.renderAdminDashboard();
    } else if (section === 'members') {
      html = this.renderMembersSection();
    } else if (section === 'bills') {
      html = this.renderBillsSection();
    } else if (section === 'notifications') {
      html = this.renderNotificationsSection();
    } else if (section === 'reports') {
      html = this.renderReportsSection();
    } else if (section === 'supplements') {
      html = this.renderSupplementsSection();
    } else if (section === 'diets') {
      html = this.renderDietsSection();
    } else if (section === 'details') {
      html = this.renderDetailsSection();
    } else if (section === 'search') {
      html = this.renderSearchSection();
    }
    
    document.getElementById('content').innerHTML = html;
  }

  renderMembersSection() {
    let membersHTML = '';
    
    for (let i = 0; i < this.members.length; i++) {
      const m = this.members[i];
      membersHTML += `
        <tr>
          <td>${m.name}</td>
          <td>${m.email}</td>
          <td>${m.phone}</td>
          <td>${m.package}</td>
          <td>
            <button onclick="app.editMember(${i})" class="btn btn-mini btn-primary">Edit</button>
            <button onclick="app.deleteMember(${i})" class="btn btn-mini btn-danger">Delete</button>
          </td>
        </tr>
      `;
    }

    return `
      <div class="section-header">
        <h2 class="section-title">Member Management</h2>
        <div class="section-actions">
          <button onclick="app.showAddMemberForm()" class="btn btn-primary">+ Add Member</button>
        </div>
      </div>
      
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Package</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${membersHTML || '<tr><td colspan="5" class="empty-state">No members yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  showAddMemberForm() {
    const packageOptions = this.packages.map(p => `<option value="${p.name}">${p.name} (₹${p.price})</option>`).join('');
    
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Add New Member</h2>
      </div>
      <form onsubmit="app.handleAddMember(event)" class="form-card">
        <div class="form-group">
          <label>Name</label>
          <input class="input-field" type="text" id="memberName" required>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input class="input-field" type="email" id="memberEmail" required>
        </div>
        
        <div class="form-group">
          <label>Phone</label>
          <input class="input-field" type="tel" id="memberPhone" required>
        </div>
        
        <div class="form-group">
          <label>Age</label>
          <input class="input-field" type="number" id="memberAge" required>
        </div>
        
        <div class="form-group">
          <label>Gender</label>
          <select class="input-field" id="memberGender" required>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Package</label>
          <select class="input-field" id="memberPackage" required>
            ${packageOptions}
          </select>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Add Member</button>
          <button type="button" onclick="app.showSection('members')" class="btn btn-outline btn-block">Back</button>
        </div>
      </form>
    `;
  }

  handleAddMember(event) {
    event.preventDefault();
    
    const member = {
      id: Date.now(),
      name: document.getElementById('memberName').value,
      email: document.getElementById('memberEmail').value,
      phone: document.getElementById('memberPhone').value,
      age: document.getElementById('memberAge').value,
      gender: document.getElementById('memberGender').value,
      package: document.getElementById('memberPackage').value,
      joinDate: new Date().toLocaleDateString()
    };
    
    this.members.push(member);
    this.saveData();
    alert('Member added successfully!');
    this.showSection('members');
  }

  editMember(index) {
    const m = this.members[index];
    const packageOptions = this.packages.map(p => `<option value="${p.name}" ${p.name === m.package ? 'selected' : ''}>${p.name}</option>`).join('');
    
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Edit Member</h2>
      </div>
      <form onsubmit="app.handleEditMember(${index}, event)" class="form-card">
        <div class="form-group">
          <label>Name</label>
          <input class="input-field" type="text" id="memberName" value="${m.name}" required>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input class="input-field" type="email" id="memberEmail" value="${m.email}" required>
        </div>
        
        <div class="form-group">
          <label>Phone</label>
          <input class="input-field" type="tel" id="memberPhone" value="${m.phone}" required>
        </div>
        
        <div class="form-group">
          <label>Package</label>
          <select class="input-field" id="memberPackage" required>
            ${packageOptions}
          </select>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Update Member</button>
          <button type="button" onclick="app.showSection('members')" class="btn btn-outline btn-block">Cancel</button>
        </div>
      </form>
    `;
  }

  handleEditMember(index, event) {
    event.preventDefault();
    
    this.members[index].name = document.getElementById('memberName').value;
    this.members[index].email = document.getElementById('memberEmail').value;
    this.members[index].phone = document.getElementById('memberPhone').value;
    this.members[index].package = document.getElementById('memberPackage').value;
    
    this.saveData();
    alert('Member updated successfully!');
    this.showSection('members');
  }

  deleteMember(index) {
    if (confirm('Are you sure you want to delete this member?')) {
      this.members.splice(index, 1);
      this.saveData();
      this.showSection('members');
    }
  }

  renderBillsSection() {
    let billsHTML = '';
    
    for (let i = 0; i < this.bills.length; i++) {
      const b = this.bills[i];
      billsHTML += `
        <tr>
          <td>${b.memberName}</td>
          <td>₹${b.amount}</td>
          <td>${b.date}</td>
          <td><span class="status-chip ${b.status === 'overdue' ? 'danger' : b.status === 'pending' ? 'warning' : ''}">${this._capitalize(b.status)}</span></td>
          <td>
            <button onclick="app.viewBillReceipt(${i})" class="btn btn-mini btn-primary">View</button>
            <button onclick="app.deleteBill(${i})" class="btn btn-mini btn-danger">Delete</button>
          </td>
        </tr>
      `;
    }

    return `
      <div class="section-header">
        <h2 class="section-title">Billing Management</h2>
        <div class="section-actions">
          <button onclick="app.showCreateBillForm()" class="btn btn-primary">+ Create Bill</button>
        </div>
      </div>
      
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${billsHTML || '<tr><td colspan="5" class="empty-state">No bills yet</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  showCreateBillForm() {
    const memberOptions = this.members.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
    
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Create Bill</h2>
      </div>
      <form onsubmit="app.handleCreateBill(event)" class="form-card">
        <div class="form-group">
          <label>Select Member</label>
          <select id="billMember" class="input-field" required>
            <option value="">-- Select Member --</option>
            ${memberOptions}
          </select>
        </div>
        
        <div class="form-group">
          <label>Amount (₹)</label>
          <input type="number" id="billAmount" class="input-field" required>
        </div>
        
        <div class="form-group">
          <label>Status</label>
          <select id="billStatus" class="input-field" required>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Create Bill</button>
          <button type="button" onclick="app.showSection('bills')" class="btn btn-outline btn-block">Back</button>
        </div>
      </form>
    `;
  }

  handleCreateBill(event) {
    event.preventDefault();
    
    const bill = {
      id: Date.now(),
      memberName: document.getElementById('billMember').value,
      amount: parseInt(document.getElementById('billAmount').value),
      status: document.getElementById('billStatus').value.toLowerCase(),
      date: new Date().toLocaleDateString()
    };
    
    this.bills.push(bill);
    this.saveData();
    alert('Bill created successfully!');
    this.showSection('bills');
  }

  viewBillReceipt(index) {
    const b = this.bills[index];
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Bill Receipt</h2>
      </div>
      <div class="receipt-card">
        <h3 style="text-align: center; border-bottom: 2px solid rgba(14, 165, 168, 0.5); padding-bottom: 10px;">BILL RECEIPT</h3>
        
        <p><strong>Member Name:</strong> ${b.memberName}</p>
        <p><strong>Bill ID:</strong> #${b.id}</p>
        <p><strong>Date:</strong> ${b.date}</p>
        <p><strong>Amount:</strong> ₹${b.amount}</p>
        <p><strong>Status:</strong> <span class="status-chip ${b.status === 'overdue' ? 'danger' : b.status === 'pending' ? 'warning' : ''}">${this._capitalize(b.status)}</span></p>
        
        <p style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">Thank you for your membership!</p>
        
        <div class="form-actions" style="margin-top: 20px;">
          <button onclick="window.print()" class="btn btn-primary btn-block">Print Receipt</button>
          <button onclick="app.showSection('bills')" class="btn btn-outline btn-block">Back</button>
        </div>
      </div>
    `;
  }

  deleteBill(index) {
    if (confirm('Delete this bill?')) {
      this.bills.splice(index, 1);
      this.saveData();
      this.showSection('bills');
    }
  }

  renderNotificationsSection() {
    let notifHTML = '';
    
    if (this.currentUser.role === 'admin') {
      for (let i = 0; i < this.notifications.length; i++) {
        const n = this.notifications[i];
        notifHTML += `
          <div class="notice-card">
            <p><strong>${n.title}</strong></p>
            <p>${n.message}</p>
            <small>${n.date}</small>
            <div class="notice-actions">
              <button onclick="app.deleteNotification(${i})" class="btn btn-mini btn-danger">Delete</button>
            </div>
          </div>
        `;
      }

      return `
        <div class="section-header">
          <h2 class="section-title">Notifications</h2>
          <div class="section-actions">
            <button onclick="app.showSendNotificationForm()" class="btn btn-primary">+ Send Notification</button>
          </div>
        </div>
        ${notifHTML || '<p>No notifications yet</p>'}
      `;
    } else {
      notifHTML = this.notifications.map(n => `
        <div class="notice-card">
          <p><strong>${n.title}</strong></p>
          <p>${n.message}</p>
          <small>${n.date}</small>
        </div>
      `).join('');

      return `
        <div class="section-header">
          <h2 class="section-title">My Notifications</h2>
        </div>
        ${notifHTML || '<p>No notifications for you</p>'}
      `;
    }
  }

  renderSupplementsSection() {
    let html = '';

    if (this.currentUser.role === 'admin') {
      let items = '';
      for (let i = 0; i < this.supplements.length; i++) {
        const s = this.supplements[i];
        items += `
          <tr>
            <td>${s.name}</td>
            <td>₹${s.price}</td>
            <td>
              <button onclick="app.editSupplement(${i})" class="btn btn-mini btn-primary">Edit</button>
              <button onclick="app.deleteSupplement(${i})" class="btn btn-mini btn-danger">Delete</button>
            </td>
          </tr>
        `;
      }

      html = `
        <div class="section-header">
          <h2 class="section-title">Supplements Store</h2>
          <div class="section-actions">
            <button onclick="app.showAddSupplementForm()" class="btn btn-primary">+ Add Supplement</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${items || '<tr><td colspan="3" class="empty-state">No supplements</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
    } else {
      const list = this.supplements.map(s => `
        <div class="list-card">
          <p><strong>${s.name}</strong></p>
          <p>Price: ₹${s.price}</p>
        </div>
      `).join('');

      html = `
        <div class="section-header">
          <h2 class="section-title">Supplements Store</h2>
        </div>
        ${list || '<p>No supplements available</p>'}
      `;
    }

    return html;
  }

  showAddSupplementForm() {
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Add Supplement</h2>
      </div>
      <form onsubmit="app.handleAddSupplement(event)" class="form-card">
        <div class="form-group">
          <label>Name</label>
          <input class="input-field" type="text" id="suppName" required>
        </div>

        <div class="form-group">
          <label>Price (₹)</label>
          <input class="input-field" type="number" id="suppPrice" required>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Add Supplement</button>
          <button type="button" onclick="app.showSection('supplements')" class="btn btn-outline btn-block">Back</button>
        </div>
      </form>
    `;
  }

  handleAddSupplement(event) {
    event.preventDefault();
    const s = {
      id: Date.now(),
      name: document.getElementById('suppName').value,
      price: parseInt(document.getElementById('suppPrice').value)
    };
    this.supplements.push(s);
    this.saveData();
    alert('Supplement added!');
    this.showSection('supplements');
  }

  editSupplement(index) {
    const s = this.supplements[index];
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Edit Supplement</h2>
      </div>
      <form onsubmit="app.handleEditSupplement(${index}, event)" class="form-card">
        <div class="form-group">
          <label>Name</label>
          <input class="input-field" type="text" id="suppName" value="${s.name}" required>
        </div>

        <div class="form-group">
          <label>Price (₹)</label>
          <input class="input-field" type="number" id="suppPrice" value="${s.price}" required>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Update</button>
          <button type="button" onclick="app.showSection('supplements')" class="btn btn-outline btn-block">Back</button>
        </div>
      </form>
    `;
  }

  handleEditSupplement(index, event) {
    event.preventDefault();
    this.supplements[index].name = document.getElementById('suppName').value;
    this.supplements[index].price = parseInt(document.getElementById('suppPrice').value);
    this.saveData();
    alert('Supplement updated');
    this.showSection('supplements');
  }

  deleteSupplement(index) {
    if (confirm('Delete supplement?')) {
      this.supplements.splice(index, 1);
      this.saveData();
      this.showSection('supplements');
    }
  }

  renderDietsSection() {
    let html = '';
    if (this.currentUser.role === 'admin') {
      let items = '';
      for (let i = 0; i < this.diets.length; i++) {
        const d = this.diets[i];
        items += `
          <tr>
            <td>${d.name}</td>
            <td>${d.details}</td>
            <td>
              <button onclick="app.editDiet(${i})" class="btn btn-mini btn-primary">Edit</button>
              <button onclick="app.deleteDiet(${i})" class="btn btn-mini btn-danger">Delete</button>
            </td>
          </tr>
        `;
      }

      html = `
        <div class="section-header">
          <h2 class="section-title">Diet Plans</h2>
          <div class="section-actions">
            <button onclick="app.showAddDietForm()" class="btn btn-primary">+ Add Diet</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${items || '<tr><td colspan="3" class="empty-state">No diet plans</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
    } else {
      const list = this.diets.map(d => `
        <div class="list-card">
          <p><strong>${d.name}</strong></p>
          <p>${d.details}</p>
        </div>
      `).join('');

      html = `
        <div class="section-header">
          <h2 class="section-title">Diet Plans</h2>
        </div>
        ${list || '<p>No diet plans available</p>'}
      `;
    }

    return html;
  }

  showAddDietForm() {
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Add Diet Plan</h2>
      </div>
      <form onsubmit="app.handleAddDiet(event)" class="form-card">
        <div class="form-group">
          <label>Name</label>
          <input class="input-field" type="text" id="dietName" required>
        </div>

        <div class="form-group">
          <label>Details</label>
          <textarea class="input-field" id="dietDetails" required style="min-height: 120px;"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Add Diet Plan</button>
          <button type="button" onclick="app.showSection('diets')" class="btn btn-outline btn-block">Back</button>
        </div>
      </form>
    `;
  }

  handleAddDiet(event) {
    event.preventDefault();
    const d = {
      id: Date.now(),
      name: document.getElementById('dietName').value,
      details: document.getElementById('dietDetails').value
    };
    this.diets.push(d);
    this.saveData();
    alert('Diet plan added!');
    this.showSection('diets');
  }

  editDiet(index) {
    const d = this.diets[index];
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Edit Diet Plan</h2>
      </div>
      <form onsubmit="app.handleEditDiet(${index}, event)" class="form-card">
        <div class="form-group">
          <label>Name</label>
          <input class="input-field" type="text" id="dietName" value="${d.name}" required>
        </div>

        <div class="form-group">
          <label>Details</label>
          <textarea class="input-field" id="dietDetails" required style="min-height: 120px;">${d.details}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Update Diet Plan</button>
          <button type="button" onclick="app.showSection('diets')" class="btn btn-outline btn-block">Back</button>
        </div>
      </form>
    `;
  }

  handleEditDiet(index, event) {
    event.preventDefault();
    this.diets[index].name = document.getElementById('dietName').value;
    this.diets[index].details = document.getElementById('dietDetails').value;
    this.saveData();
    alert('Diet plan updated');
    this.showSection('diets');
  }

  deleteDiet(index) {
    if (confirm('Delete diet plan?')) {
      this.diets.splice(index, 1);
      this.saveData();
      this.showSection('diets');
    }
  }

  showSendNotificationForm() {
    document.getElementById('content').innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Send Notification</h2>
      </div>
      <form onsubmit="app.handleSendNotification(event)" class="form-card">
        <div class="form-group">
          <label>Title</label>
          <input class="input-field" type="text" id="notifTitle" required>
        </div>
        
        <div class="form-group">
          <label>Message</label>
          <textarea class="input-field" id="notifMessage" required style="min-height: 100px;"></textarea>
        </div>
        
        <div class="form-group">
          <label>Type</label>
          <select id="notifType" class="input-field" required>
            <option value="Monthly Fee Due">Monthly Fee Due</option>
            <option value="Gym Reminder">Gym Reminder</option>
            <option value="Motivational">Motivational Message</option>
            <option value="General">General Announcement</option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Send Notification</button>
          <button type="button" onclick="app.showSection('notifications')" class="btn btn-outline btn-block">Back</button>
        </div>
      </form>
    `;
  }

  handleSendNotification(event) {
    event.preventDefault();
    
    const notification = {
      id: Date.now(),
      title: document.getElementById('notifTitle').value,
      message: document.getElementById('notifMessage').value,
      type: document.getElementById('notifType').value,
      date: new Date().toLocaleDateString()
    };
    
    this.notifications.push(notification);
    this.saveData();
    alert('Notification sent!');
    this.showSection('notifications');
  }

  deleteNotification(index) {
    if (confirm('Delete this notification?')) {
      this.notifications.splice(index, 1);
      this.saveData();
      this.showSection('notifications');
    }
  }

  renderReportsSection() {
    const totalMembers = this.members.length;
    const totalBills = this.bills.length;
    const totalRevenue = this.bills.reduce((sum, b) => sum + b.amount, 0);
    const paidBills = this.bills.filter(b => b.status === 'paid').length;

    return `
      <div class="section-header">
        <h2 class="section-title">Monthly Report</h2>
        <div class="section-actions">
          <button onclick="app.exportReport()" class="btn btn-primary">📥 Export Report</button>
        </div>
      </div>
      <div class="report-grid">
        <div class="report-card">
          <h4>Total Members</h4>
          <p>${totalMembers}</p>
        </div>
        <div class="report-card">
          <h4>Total Bills</h4>
          <p>${totalBills}</p>
        </div>
        <div class="report-card">
          <h4>Total Revenue</h4>
          <p>₹${totalRevenue}</p>
        </div>
        <div class="report-card">
          <h4>Paid Bills</h4>
          <p>${paidBills}/${totalBills}</p>
        </div>
      </div>
    `;
  }

  exportReport() {
    const totalMembers = this.members.length;
    const totalBills = this.bills.length;
    const totalRevenue = this.bills.reduce((sum, b) => sum + b.amount, 0);
    const paidBills = this.bills.filter(b => b.status === 'paid').length;

    let csv = 'GYM MANAGEMENT MONTHLY REPORT\n';
    csv += `Generated Date,${new Date().toLocaleDateString()}\n\n`;
    csv += 'SUMMARY\n';
    csv += `Total Members,${totalMembers}\n`;
    csv += `Total Bills,${totalBills}\n`;
    csv += `Total Revenue,${totalRevenue}\n`;
    csv += `Paid Bills,${paidBills}\n\n`;
    csv += 'MEMBERS\n';
    csv += 'Name,Email,Phone,Package,Join Date\n';
    this.members.forEach(m => {
      csv += `${m.name},${m.email},${m.phone},${m.package},${m.joinDate}\n`;
    });
    csv += '\nBILLS\n';
    csv += 'Member,Amount,Date,Status\n';
    this.bills.forEach(b => {
      csv += `${b.memberName},${b.amount},${b.date},${b.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym_report_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  renderDetailsSection() {
    const member = this.members.find(m => m.name === this.currentUser.name) || { name: this.currentUser.name, package: 'N/A', joinDate: 'N/A' };
    const memberBills = this.bills
      .map((b, index) => ({ bill: b, index }))
      .filter(item => item.bill.memberName === this.currentUser.name);

    return `
      <div class="section-header">
        <h2 class="section-title">My Account</h2>
      </div>
      <div class="panel" style="margin-bottom: 20px;">
        <h3>Personal Details</h3>
        <p><strong>Name:</strong> ${member.name}</p>
        <p><strong>Email:</strong> ${this.currentUser.email}</p>
        <p><strong>Package:</strong> ${member.package}</p>
        <p><strong>Member Since:</strong> ${member.joinDate}</p>
      </div>

      <div class="panel">
        <h3>My Bills</h3>
        <div class="table-wrap" style="margin-top: 12px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              ${memberBills.length > 0 ? memberBills.map(item => `
                <tr>
                  <td>₹${item.bill.amount}</td>
                  <td>${item.bill.date}</td>
                  <td><span class="status-chip ${item.bill.status === 'paid' ? '' : 'warning'}">${this._capitalize(item.bill.status)}</span></td>
                  <td>
                    <button onclick="app.viewBillReceipt(${item.index})" class="btn btn-mini btn-primary">View</button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="4" class="empty-state">No bills</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  _capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  renderSearchSection() {
    return `
      <div class="section-header">
        <h2 class="section-title">Search Information</h2>
      </div>
      <div class="panel search-panel">
        <input type="text" id="searchQuery" class="input-field" placeholder="Search member name...">
        <div style="margin-top: 16px;">
          <button onclick="app.performSearch()" class="btn btn-primary btn-block">Search</button>
        </div>
      </div>
      <div id="searchResults" style="margin-top: 20px;"></div>
    `;
  }

  performSearch() {
    const query = document.getElementById('searchQuery').value.toLowerCase();
    const results = this.members.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.email.toLowerCase().includes(query)
    );

    let html = '<h3>Search Results</h3>';
    if (results.length > 0) {
      html += results.map(m => `
        <div class="notice-card">
          <p><strong>${m.name}</strong></p>
          <p>Email: ${m.email}</p>
          <p>Package: ${m.package}</p>
          <p>Member Since: ${m.joinDate}</p>
        </div>
      `).join('');
    } else {
      html += '<p>No results found.</p>';
    }

    document.getElementById('searchResults').innerHTML = html;
  }
}

const app = new GymApp();
window.addEventListener('DOMContentLoaded', () => app.init());
