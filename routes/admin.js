const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/dashboard/stats', async (req, res) => {
    try {
        const [[{student_count}]] = await db.query('SELECT COUNT(*) as student_count FROM students');
        const [[{hall_count}]] = await db.query('SELECT COUNT(*) as hall_count FROM halls');
        const [[{exam_count}]] = await db.query('SELECT COUNT(*) as exam_count FROM exams');
        const [[{allocation_count}]] = await db.query('SELECT COUNT(*) as allocation_count FROM allocations');
        
        res.json({
            students: student_count,
            halls: hall_count,
            exams: exam_count,
            allocations: allocation_count
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

router.get('/students', async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students ORDER BY roll_number');
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

router.post('/students', async (req, res) => {
    try {
        const { roll_number, name, branch, year, semester, email, phone } = req.body;
        
        
        const [result] = await db.query(
            'INSERT INTO students (roll_number, password, name, branch, year, semester, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [roll_number, roll_number, name, branch, year, semester, email, phone]
        );
        
        res.json({ success: true, message: 'Student added successfully', student_id: result.insertId });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ error: 'Failed to add student' });
    }
});

router.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { roll_number, name, branch, year, semester, email, phone } = req.body;
        
        await db.query(
            'UPDATE students SET roll_number = ?, name = ?, branch = ?, year = ?, semester = ?, email = ?, phone = ? WHERE student_id = ?',
            [roll_number, name, branch, year, semester, email, phone, id]
        );
        
        res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

router.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM students WHERE student_id = ?', [id]);
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

module.exports = router;
