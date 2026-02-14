const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Admin login — plain text password comparison (no bcrypt)
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Direct plain-text match in SQL — no hashing
        const [admins] = await db.query(
            'SELECT * FROM admins WHERE username = ? AND password = ?',
            [username, password]
        );

        if (admins.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = admins[0];

        // Return a simple session token (no JWT needed)
        const token = `admin-${admin.admin_id}-${Date.now()}`;

        res.json({
            success: true,
            token,
            user: {
                id: admin.admin_id,
                username: admin.username,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Student login — roll number only, no password required
router.post('/student/login', async (req, res) => {
    try {
        const { roll_number } = req.body;

        if (!roll_number) {
            return res.status(400).json({ error: 'Roll number is required' });
        }

        const [students] = await db.query(
            'SELECT * FROM students WHERE roll_number = ?',
            [roll_number]
        );

        if (students.length === 0) {
            return res.status(404).json({ error: 'Student not found. Check your roll number.' });
        }

        const student = students[0];
        const token = `student-${student.student_id}-${Date.now()}`;

        res.json({
            success: true,
            token,
            user: {
                id: student.student_id,
                roll_number: student.roll_number,
                name: student.name,
                role: 'student'
            }
        });
    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
