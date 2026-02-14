# 🚀 Quick Start Guide - Exam Hall Allocation System

## Get Up and Running in 5 Minutes!

### ✅ Pre-Setup Checklist

Before starting, make sure you have:
- [ ] XAMPP installed and running (Apache + MySQL)
- [ ] Node.js installed (check: `node --version`)
- [ ] Python installed (check: `python --version`)
- [ ] Your project files extracted

---

## Step 1: Start XAMPP (30 seconds)

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache** → Should turn green
3. Click **Start** next to **MySQL** → Should turn green

✅ **Both should show "Running" status**

---

## Step 2: Create Database (1 minute)

1. Open browser: `http://localhost/phpmyadmin`
2. Click **SQL** tab at the top
3. Copy the SQL from your project (or use the script below)
4. Paste and click **Go**

**Quick SQL (Copy This):**
```sql
CREATE DATABASE IF NOT EXISTS exam_hall_db;
USE exam_hall_db;

-- (Paste the full schema.sql content here)
```

✅ **Check left sidebar - you should see `exam_hall_db` with 5 tables**

---

## Step 3: Install Backend (2 minutes)

Open **Command Prompt** in your project's **backend** folder:

```bash
# Install packages (only first time)
npm install

# Create admin user
node scripts/create-admin.js

# Create sample students
node scripts/create-students.js
```

✅ **You should see success messages for admin and students created**

---

## Step 4: Start Server (10 seconds)

```bash
npm start
```

✅ **You should see:**
```
=================================
🚀 Server running on port 3000
📱 Frontend: http://localhost:3000
🔌 API: http://localhost:3000/api
=================================
✅ Database connected successfully!
```

**✨ DONE! Your system is now running!**

---

## 🎯 What to Do Next

### Option 1: Test Admin Login

1. Open: `http://localhost:3000/admin/login.html`
2. **Username:** `admin`
3. **Password:** `admin123`
4. Click **Login**
5. ✅ You should see the admin dashboard!

### Option 2: Test Student Login

1. Open: `http://localhost:3000/student/login.html`
2. **Roll Number:** `23CS001`
3. **Password:** `23CS001`
4. Click **Login**
5. ✅ You should see the student dashboard!

---

## 🎨 Explore Features

### As Admin:
1. **Dashboard** - View statistics
2. **Students** - Add/manage students
3. **Halls** - Configure exam halls
4. **Exams** - Schedule exams
5. **Allocate** - Run seat allocation

### As Student:
1. **Profile** - View your details
2. **Exams** - Check upcoming exams
3. **Allocations** - See your seat numbers

---

## ⚡ Quick Commands Reference

```bash
# Start server
npm start

# Stop server
Ctrl + C (in terminal)

# Restart server
Ctrl + C, then npm start

# Create more students
node scripts/create-students.js

# Reset admin password
node scripts/create-admin.js
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot connect to database"
**Fix:** Start MySQL in XAMPP (green status)

### Issue 2: "Port 3000 already in use"
**Fix:** Change port in `server.js` to 3001 or 3002

### Issue 3: "npm not recognized"
**Fix:** Install Node.js from nodejs.org

### Issue 4: "Python not found"
**Fix:** Install Python from python.org

### Issue 5: Can't login
**Fix:** Check if admin/students were created successfully

---

## 📋 Test the Complete Flow

1. **Login as Admin** (`admin` / `admin123`)
2. **Add a Hall** 
   - Name: Test Hall
   - Capacity: 30
   - Rows: 5, Columns: 6
3. **Schedule an Exam**
   - Name: Mid Sem Exam
   - Subject: Data Structures
   - Date: Tomorrow
   - Branch: Computer Science
   - Year: 2
4. **Allocate Seats**
   - Select the exam
   - Click "Allocate"
   - View seating plan
5. **Login as Student** (`23CS001` / `23CS001`)
6. **Check Seat Allocation**

✅ **Success!** Your exam hall allocation system is working!

---

## 🎉 Congratulations!

You've successfully set up and tested the Exam Hall Allocation System!

### What You Can Do Now:

1. **Add Real Students**
   - Manually or import from Excel
   - Set their default password = roll number

2. **Configure Real Halls**
   - Add your actual exam halls
   - Set correct capacities

3. **Schedule Exams**
   - Add exam timetable
   - Run allocations

4. **Share with Students**
   - Give them the student login URL
   - Share their roll numbers and passwords

---

## 📱 Access URLs

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| Admin Login | http://localhost:3000/admin/login.html |
| Admin Dashboard | http://localhost:3000/admin/dashboard.html |
| Student Login | http://localhost:3000/student/login.html |
| Student Dashboard | http://localhost:3000/student/dashboard.html |

---

## 💡 Pro Tips

1. **Keep XAMPP running** whenever using the system
2. **Don't close the terminal** where `npm start` is running
3. **Students should change their password** after first login
4. **Backup your database** regularly from phpMyAdmin
5. **Test allocation** with sample data first

---

## 🆘 Need Help?

1. Check the detailed **README.md** file
2. Look at error messages in:
   - Browser Console (F12)
   - Server terminal
3. Verify XAMPP services are running
4. Restart the server: `Ctrl+C` then `npm start`

---

**Happy Allocating! 🎓**

Your system is production-ready for your final year project presentation!
