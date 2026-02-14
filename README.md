# Exam Hall Allocation System

## Complete Setup Guide

### Prerequisites
- Node.js (v14 or higher)
- Python 3.x
- MySQL (via XAMPP)
- Modern web browser

---

## 🚀 Installation Steps

### Step 1: Database Setup

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start **Apache** and **MySQL** services (click Start buttons)
   - Both should show green "Running" status

2. **Create Database**
   - Open browser and go to: `http://localhost/phpmyadmin`
   - Click "SQL" tab
   - Copy and paste the SQL script from `database/schema.sql`
   - Click "Go" to execute
   - Verify 5 tables are created: admins, students, halls, exams, allocations

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create admin user
node scripts/create-admin.js

# Create sample students
node scripts/create-students.js

# Start the server
npm start
```

**Server should start on:** `http://localhost:3000`

### Step 3: Frontend Setup

1. Copy the `frontend` folder to your project
2. The frontend will be automatically served by the backend server
3. Access at: `http://localhost:3000`

---

## 🔐 Default Credentials

### Admin Login
- **Username:** `admin`
- **Password:** `admin123`
- **URL:** `http://localhost:3000/admin/login.html`

### Student Login (Sample Students)
- **Roll Number:** `23CS001` to `23CS005`, `23IT001` to `23IT004`, etc.
- **Password:** Same as roll number (e.g., `23CS001`)
- **URL:** `http://localhost:3000/student/login.html`

---

## 📂 Project Structure

```
exam-hall-allocation/
│
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL configuration
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── routes/
│   │   ├── auth.js               # Login routes
│   │   ├── admin.js              # Admin routes
│   │   ├── student.js            # Student routes
│   │   ├── hall.js               # Hall management
│   │   ├── exam.js               # Exam management
│   │   └── allocation.js         # Allocation logic
│   ├── python/
│   │   └── allocate.py           # Allocation algorithm
│   ├── scripts/
│   │   ├── create-admin.js       # Create admin user
│   │   └── create-students.js    # Create sample students
│   ├── server.js                 # Main server file
│   └── package.json
│
├── frontend/
│   ├── index.html                # Landing page
│   ├── admin/
│   │   ├── login.html            # Admin login
│   │   ├── dashboard.html        # Admin dashboard
│   │   ├── students.html         # Student management
│   │   ├── halls.html            # Hall management
│   │   ├── exams.html            # Exam management
│   │   └── allocate.html         # Allocation page
│   ├── student/
│   │   ├── login.html            # Student login
│   │   └── dashboard.html        # Student dashboard
│   ├── css/
│   │   └── style.css             # All styles
│   └── js/
│       ├── config.js             # API configuration
│       ├── admin.js              # Admin functions
│       └── student.js            # Student functions
│
└── database/
    └── schema.sql                # Database schema
```

---

## 🎯 Features

### Admin Features
1. **Dashboard**
   - View statistics (students, halls, exams, allocations)
   - Quick action buttons

2. **Student Management**
   - Add/Edit/Delete students
   - Bulk import from Excel/CSV
   - View all students

3. **Hall Management**
   - Add/Edit/Delete exam halls
   - Configure capacity and seating layout
   - Mark halls as available/unavailable

4. **Exam Management**
   - Schedule exams with date and time
   - Set branch, year, and semester filters
   - Track exam status

5. **Seat Allocation**
   - Smart automatic allocation algorithm
   - Configure allocation rules (branch mixing, gaps, etc.)
   - View seating plans
   - Generate PDF reports

### Student Features
1. **Dashboard**
   - View profile information
   - See upcoming exams
   - Check seat allocations

2. **Exam Schedule**
   - View all scheduled exams
   - See exam details (date, time, subject)

3. **Seat Allocation**
   - View allocated seat number
   - See hall details and location
   - Check seat allocation history

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/change-password` - Change password

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/students` - Get all students
- `POST /api/admin/students` - Add student
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student
- `POST /api/admin/students/import` - Bulk import

### Halls
- `GET /api/halls` - Get all halls
- `POST /api/halls` - Add hall
- `PUT /api/halls/:id` - Update hall
- `DELETE /api/halls/:id` - Delete hall

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Add exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam
- `GET /api/exams/:id/eligible-students` - Get eligible students

### Allocations
- `GET /api/allocations` - Get all allocations
- `POST /api/allocations/allocate` - Run allocation
- `GET /api/allocations/exam/:examId` - Get exam allocations
- `DELETE /api/allocations/exam/:examId` - Delete allocations
- `GET /api/allocations/seating-plan/:examId/:hallId` - Get seating plan

### Student
- `GET /api/student/profile` - Get profile
- `GET /api/student/exams` - Get upcoming exams
- `GET /api/student/allocation/:examId` - Get seat allocation
- `GET /api/student/allocations` - Get all allocations

---

## 🐛 Troubleshooting

### Database Connection Failed
- Ensure XAMPP MySQL is running (green in XAMPP Control Panel)
- Check database credentials in `backend/config/database.js`
- Default: `user: 'root'`, `password: ''` (empty)

### Port Already in Use
- Change port in `backend/server.js`: `const PORT = 3001;`
- Update API_BASE_URL in `frontend/js/config.js`

### Python Not Found
- Install Python from python.org
- Ensure "Add Python to PATH" is checked during installation
- Restart terminal/command prompt

### npm install Errors
- Update npm: `npm install -g npm@latest`
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

---

## 📊 Allocation Algorithm

The Python allocation algorithm (`backend/python/allocate.py`) implements:

1. **Branch Mixing** (Optional)
   - Mix students from different branches
   - Or keep branches separate

2. **Year Mixing** (Optional)
   - Mix students from different years
   - Or allocate year-wise

3. **Gap Between Students**
   - Configure empty seats between students
   - Default: 1 seat gap

4. **Fair Distribution**
   - Distributes students evenly across available halls
   - Fills halls sequentially

---

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Beautiful transitions and effects
- **Modern UI** - Clean, professional interface
- **Color-Coded Stats** - Easy-to-read dashboard
- **Interactive Forms** - User-friendly data entry
- **Real-time Updates** - Instant feedback

---

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes (admin/student separation)
- Session management
- SQL injection prevention

---

## 📝 Usage Guide

### For Administrators

1. **Login** at `http://localhost:3000/admin/login.html`

2. **Add Students**
   - Go to "Students" menu
   - Click "Add Student" or import from Excel
   - Fill in details: Roll No, Name, Branch, Year, Semester

3. **Configure Halls**
   - Go to "Halls" menu
   - Add halls with capacity and layout (rows x columns)
   - Example: Hall A with 10 rows x 6 columns = 60 capacity

4. **Schedule Exam**
   - Go to "Exams" menu
   - Add exam with name, subject, date, time
   - Set filters (branch, year, semester)

5. **Allocate Seats**
   - Go to "Allocate Seats" menu
   - Select an exam
   - Configure allocation rules
   - Click "Allocate" to run the algorithm
   - View and download seating plans

### For Students

1. **Login** at `http://localhost:3000/student/login.html`
   - Enter roll number and password

2. **View Dashboard**
   - See profile information
   - Check upcoming exams
   - View seat allocations

3. **Check Seat**
   - See allocated hall and seat number
   - Note exam date and time
   - View hall location

---

## 🚧 Future Enhancements

- Email notifications to students
- SMS alerts for exam reminders
- QR code generation for hall passes
- Multiple session support
- Analytics dashboard
- Mobile app
- PDF seating chart generation with hall layout

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review error messages in browser console (F12)
3. Check server logs in terminal

---

## 📄 License

This project is for educational purposes.

---

## 👥 Credits

Developed as a final year project for exam hall management and allocation.

**Technologies Used:**
- Backend: Node.js, Express.js
- Database: MySQL
- Allocation: Python
- Frontend: HTML, CSS, JavaScript
- Authentication: JWT
- Styling: Custom CSS with animations

---

## ✅ Testing Checklist

- [ ] Database created successfully
- [ ] Admin user created (username: admin)
- [ ] Sample students created (15 students)
- [ ] Server running on port 3000
- [ ] Admin login works
- [ ] Student login works
- [ ] Can add/edit/delete students
- [ ] Can add/edit/delete halls
- [ ] Can schedule exams
- [ ] Allocation algorithm runs successfully
- [ ] Students can view their seat allocations

---

**Last Updated:** January 2026
