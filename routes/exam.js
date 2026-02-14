const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        const [exams] = await db.query('SELECT * FROM exams ORDER BY exam_date, start_time');
        res.json(exams);
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { exam_name, subject, exam_date, start_time, end_time, branch, year, semester } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO exams (exam_name, subject, exam_date, start_time, end_time, branch, year, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [exam_name, subject, exam_date, start_time, end_time, branch, year, semester]
        );
        
        res.json({ success: true, message: 'Exam added successfully', exam_id: result.insertId });
    } catch (error) {
        console.error('Add exam error:', error);
        res.status(500).json({ error: 'Failed to add exam' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { exam_name, subject, exam_date, start_time, end_time, branch, year, semester, status } = req.body;
        
        await db.query(
            'UPDATE exams SET exam_name = ?, subject = ?, exam_date = ?, start_time = ?, end_time = ?, branch = ?, year = ?, semester = ?, status = ? WHERE exam_id = ?',
            [exam_name, subject, exam_date, start_time, end_time, branch, year, semester, status, id]
        );
        
        res.json({ success: true, message: 'Exam updated successfully' });
    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({ error: 'Failed to update exam' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM exams WHERE exam_id = ?', [id]);
        res.json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({ error: 'Failed to delete exam' });
    }
});

router.get('/:id/eligible-students', async (req, res) => {
    try {
        const { id } = req.params;
        const [exams] = await db.query('SELECT * FROM exams WHERE exam_id = ?', [id]);
        
        if (exams.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        
        const exam = exams[0];
        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];
        
        if (exam.branch) {
            query += ' AND branch = ?';
            params.push(exam.branch);
        }
        if (exam.year) {
            query += ' AND year = ?';
            params.push(exam.year);
        }
        if (exam.semester) {
            query += ' AND semester = ?';
            params.push(exam.semester);
        }
        query += ' ORDER BY roll_number';
        
        const [students] = await db.query(query, params);
        res.json(students);
    } catch (error) {
        console.error('Get eligible students error:', error);
        res.status(500).json({ error: 'Failed to fetch eligible students' });
    }
});

module.exports = router;
