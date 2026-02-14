const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyStudent } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(verifyStudent);

router.get('/profile', async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students WHERE student_id = ?', [req.user.id]);
        
        if (students.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const student = students[0];
        delete student.password;
        
        res.json(student);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.get('/exams', async (req, res) => {
    try {
        const [student] = await db.query('SELECT branch, year, semester FROM students WHERE student_id = ?', [req.user.id]);
        
        if (student.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const { branch, year, semester } = student[0];
        
        let query = 'SELECT * FROM exams WHERE 1=1';
        const params = [];
        
        if (branch) {
            query += ' AND (branch = ? OR branch IS NULL)';
            params.push(branch);
        }
        if (year) {
            query += ' AND (year = ? OR year IS NULL)';
            params.push(year);
        }
        if (semester) {
            query += ' AND (semester = ? OR semester IS NULL)';
            params.push(semester);
        }
        
        query += ' ORDER BY exam_date, start_time';
        
        const [exams] = await db.query(query, params);
        res.json(exams);
    } catch (error) {
        console.error('Get student exams error:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

router.get('/allocations', async (req, res) => {
    try {
        const [allocations] = await db.query(`
            SELECT a.*, e.exam_name, e.subject, e.exam_date, e.start_time, e.end_time,
                   h.hall_name, h.building, h.floor
            FROM allocations a
            JOIN exams e ON a.exam_id = e.exam_id
            JOIN halls h ON a.hall_id = h.hall_id
            WHERE a.student_id = ?
            ORDER BY e.exam_date, e.start_time
        `, [req.user.id]);
        
        res.json(allocations);
    } catch (error) {
        console.error('Get allocations error:', error);
        res.status(500).json({ error: 'Failed to fetch allocations' });
    }
});

router.get('/allocation/:examId', async (req, res) => {
    try {
        const { examId } = req.params;
        const [allocations] = await db.query(`
            SELECT a.*, e.exam_name, e.subject, e.exam_date, e.start_time, e.end_time,
                   h.hall_name, h.building, h.floor
            FROM allocations a
            JOIN exams e ON a.exam_id = e.exam_id
            JOIN halls h ON a.hall_id = h.hall_id
            WHERE a.student_id = ? AND a.exam_id = ?
        `, [req.user.id, examId]);
        
        if (allocations.length === 0) {
            return res.status(404).json({ error: 'Allocation not found' });
        }
        
        res.json(allocations[0]);
    } catch (error) {
        console.error('Get allocation error:', error);
        res.status(500).json({ error: 'Failed to fetch allocation' });
    }
});

module.exports = router;
