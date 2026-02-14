# Exam Hall Allocation System - Backend

## Quick Setup

1. Install dependencies:
```bash
npm install
```

2. Configure database in `config/database.js` (default: localhost, root, no password)

3. Create admin:
```bash
node scripts/create-admin.js
```

4. Create sample students:
```bash
node scripts/create-students.js
```

5. Start server:
```bash
npm start
```

Server will run on: http://localhost:3000

## Credentials
- Admin: admin / admin123
- Students: roll_number / roll_number (e.g., 23CS001 / 23CS001)
