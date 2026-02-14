# Gym Management System — Internship Project

A simple and clean Gym Management web app built using plain HTML, CSS and JavaScript. This project is a beginner-friendly that demonstrates basic features like user roles, member management, billing, simple reports, and notifications using browser storage.

---

## Quick Start

1. Open the project in your editor (VS Code recommended).
2. Serve the project or open the HTML file:

```bash
# From project root
python -m http.server 8000
# Open http://localhost:8000/public in your browser
```

Or use VS Code Live Server to preview.

---

## Demo Accounts (for testing)

- Admin: jhanvi.singh@gym.com / admin123
- Member: member@gym.com / member123
- User: user@gym.com / user123

Use these to log in and explore the app.

---

## Features

- Admin
  - Login as Admin
  - Add / Edit / Delete members
  - Create bills and mark payments
  - Send notifications
  - Export a simple CSV report
- Member
  - Login as Member
  - View personal details and bills
  - View notifications
- User
  - Login as User
  - Search members and view supplements & diet plans

Data is stored in browser localStorage for simplicity — no backend required for the demo.

---

## Project Structure

- public/
  - index.html  (app entry)
- src/
  - app.js      (main UI and app logic)
  - services/   (auth and data helpers)
  - modules/    (admin, member, user modules)
  - styles/     (CSS files)
- README.md

---

## Author

- Jhanvi Singh built as an internship project.

---


