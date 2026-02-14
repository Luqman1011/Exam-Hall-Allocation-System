const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { allocateSeats, generateSeatMap } = require('../services/allocation-algorithm');

const router = express.Router();

router.use(verifyToken);
router.use(verifyAdmin);

// Get all allocations
router.get('/', async (req, res) => {
    try {
        const [allocations] = await db.query(`
            SELECT a.*, e.exam_name, e.subject, e.exam_date, e.start_time, e.end_time,
                   s.roll_number, s.name as student_name, s.branch, s.year,
                   h.hall_name, h.building, h.floor
            FROM allocations a
            JOIN exams e ON a.exam_id = e.exam_id
            JOIN students s ON a.student_id = s.student_id
            JOIN halls h ON a.hall_id = h.hall_id
            ORDER BY e.exam_date DESC, h.hall_name, a.seat_number
        `);
        res.json(allocations);
    } catch (error) {
        console.error('Get allocations error:', error);
        res.status(500).json({ error: 'Failed to fetch allocations' });
    }
});

// Get allocations for specific exam
router.get('/exam/:examId', async (req, res) => {
    try {
        const { examId } = req.params;
        const [allocations] = await db.query(`
            SELECT a.*, s.roll_number, s.name as student_name, s.branch, s.year,
                   h.hall_name, h.building, h.floor
            FROM allocations a
            JOIN students s ON a.student_id = s.student_id
            JOIN halls h ON a.hall_id = h.hall_id
            WHERE a.exam_id = ?
            ORDER BY h.hall_name, a.seat_number
        `, [examId]);
        res.json(allocations);
    } catch (error) {
        console.error('Get exam allocations error:', error);
        res.status(500).json({ error: 'Failed to fetch exam allocations' });
    }
});

// Get seat map for a specific hall and exam
router.get('/seatmap/:examId/:hallId', async (req, res) => {
    try {
        const { examId, hallId } = req.params;
        
        // Get hall details
        const [halls] = await db.query('SELECT * FROM halls WHERE hall_id = ?', [hallId]);
        if (halls.length === 0) {
            return res.status(404).json({ error: 'Hall not found' });
        }
        const hall = halls[0];
        
        // Get allocations for this hall and exam
        const [allocations] = await db.query(`
            SELECT a.*, s.roll_number, s.name as student_name, s.branch, s.year
            FROM allocations a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.exam_id = ? AND a.hall_id = ?
            ORDER BY a.row_number, a.column_number, a.bench_position
        `, [examId, hallId]);
        
        // Create seat map structure
        const seatMap = {
            hall: hall,
            seats: []
        };
        
        for (let row = 1; row <= hall.total_rows; row++) {
            const rowSeats = [];
            for (let col = 1; col <= hall.total_columns; col++) {
                const seatAllocations = allocations.filter(
                    a => a.row_number === row && a.column_number === col
                );
                
                rowSeats.push({
                    row: row,
                    column: col,
                    seat_number: seatAllocations.length > 0 ? seatAllocations[0].seat_number : `${String.fromCharCode(64 + row)}${col}`,
                    students: seatAllocations,
                    occupied: seatAllocations.length > 0
                });
            }
            seatMap.seats.push(rowSeats);
        }
        
        res.json(seatMap);
    } catch (error) {
        console.error('Get seat map error:', error);
        res.status(500).json({ error: 'Failed to fetch seat map' });
    }
});

// Get seat map for student view
router.get('/student/seatmap/:examId/:studentId', async (req, res) => {
    try {
        const { examId, studentId } = req.params;
        
        // Get student's allocation
        const [allocations] = await db.query(`
            SELECT a.*, h.hall_name, h.building, h.floor, h.total_rows, h.total_columns,
                   s.roll_number, s.name as student_name, s.branch, s.year
            FROM allocations a
            JOIN halls h ON a.hall_id = h.hall_id
            JOIN students s ON a.student_id = s.student_id
            WHERE a.exam_id = ? AND a.student_id = ?
        `, [examId, studentId]);
        
        if (allocations.length === 0) {
            return res.status(404).json({ error: 'Allocation not found' });
        }
        
        const allocation = allocations[0];
        
        // Get all allocations for this hall (anonymized)
        const [hallAllocations] = await db.query(`
            SELECT a.row_number, a.column_number, a.seat_number, a.bench_position
            FROM allocations a
            WHERE a.exam_id = ? AND a.hall_id = ?
            ORDER BY a.row_number, a.column_number, a.bench_position
        `, [examId, allocation.hall_id]);
        
        // Create seat map
        const seatMap = {
            myAllocation: allocation,
            hall: {
                hall_name: allocation.hall_name,
                building: allocation.building,
                floor: allocation.floor,
                total_rows: allocation.total_rows,
                total_columns: allocation.total_columns
            },
            seats: []
        };
        
        for (let row = 1; row <= allocation.total_rows; row++) {
            const rowSeats = [];
            for (let col = 1; col <= allocation.total_columns; col++) {
                const seatAllocations = hallAllocations.filter(
                    a => a.row_number === row && a.column_number === col
                );
                
                const isMySeat = allocation.row_number === row && allocation.column_number === col;
                
                rowSeats.push({
                    row: row,
                    column: col,
                    seat_number: seatAllocations.length > 0 ? seatAllocations[0].seat_number : `${String.fromCharCode(64 + row)}${col}`,
                    occupied: seatAllocations.length > 0,
                    isMySeat: isMySeat,
                    count: seatAllocations.length
                });
            }
            seatMap.seats.push(rowSeats);
        }
        
        res.json(seatMap);
    } catch (error) {
        console.error('Get student seat map error:', error);
        res.status(500).json({ error: 'Failed to fetch seat map' });
    }
});

// Delete allocations for an exam
router.delete('/exam/:examId', async (req, res) => {
    try {
        const { examId } = req.params;
        await db.query('DELETE FROM allocations WHERE exam_id = ?', [examId]);
        await db.query('UPDATE exams SET status = ? WHERE exam_id = ?', ['pending', examId]);
        res.json({ success: true, message: 'Allocations deleted successfully' });
    } catch (error) {
        console.error('Delete allocations error:', error);
        res.status(500).json({ error: 'Failed to delete allocations' });
    }
});

// Manual seat allocation
router.post('/manual', async (req, res) => {
    try {
        const { exam_id, student_id, hall_id, row_number, column_number, bench_position } = req.body;
        
        // Validate inputs
        if (!exam_id || !student_id || !hall_id || !row_number || !column_number) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if student already allocated
        const [existing] = await db.query(
            'SELECT * FROM allocations WHERE exam_id = ? AND student_id = ?',
            [exam_id, student_id]
        );
        
        if (existing.length > 0) {
            // Update existing allocation
            const seat_number = bench_position > 1 
                ? `${String.fromCharCode(64 + row_number)}${column_number}-${bench_position}`
                : `${String.fromCharCode(64 + row_number)}${column_number}`;
            
            await db.query(
                'UPDATE allocations SET hall_id = ?, seat_number = ?, row_number = ?, column_number = ?, bench_position = ? WHERE exam_id = ? AND student_id = ?',
                [hall_id, seat_number, row_number, column_number, bench_position || 1, exam_id, student_id]
            );
            
            res.json({ success: true, message: 'Allocation updated successfully' });
        } else {
            // Create new allocation
            const seat_number = bench_position > 1 
                ? `${String.fromCharCode(64 + row_number)}${column_number}-${bench_position}`
                : `${String.fromCharCode(64 + row_number)}${column_number}`;
            
            await db.query(
                'INSERT INTO allocations (exam_id, student_id, hall_id, seat_number, row_number, column_number, bench_position) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [exam_id, student_id, hall_id, seat_number, row_number, column_number, bench_position || 1]
            );
            
            res.json({ success: true, message: 'Student allocated successfully' });
        }
    } catch (error) {
        console.error('Manual allocation error:', error);
        res.status(500).json({ error: 'Failed to allocate student manually' });
    }
});

// Swap two students' seats
router.post('/swap', async (req, res) => {
    try {
        const { exam_id, student_id_1, student_id_2 } = req.body;
        
        // Get both allocations
        const [alloc1] = await db.query(
            'SELECT * FROM allocations WHERE exam_id = ? AND student_id = ?',
            [exam_id, student_id_1]
        );
        const [alloc2] = await db.query(
            'SELECT * FROM allocations WHERE exam_id = ? AND student_id = ?',
            [exam_id, student_id_2]
        );
        
        if (alloc1.length === 0 || alloc2.length === 0) {
            return res.status(404).json({ error: 'One or both allocations not found' });
        }
        
        const a1 = alloc1[0];
        const a2 = alloc2[0];
        
        // Swap seats
        await db.query(
            'UPDATE allocations SET hall_id = ?, seat_number = ?, row_number = ?, column_number = ?, bench_position = ? WHERE exam_id = ? AND student_id = ?',
            [a2.hall_id, a2.seat_number, a2.row_number, a2.column_number, a2.bench_position, exam_id, student_id_1]
        );
        
        await db.query(
            'UPDATE allocations SET hall_id = ?, seat_number = ?, row_number = ?, column_number = ?, bench_position = ? WHERE exam_id = ? AND student_id = ?',
            [a1.hall_id, a1.seat_number, a1.row_number, a1.column_number, a1.bench_position, exam_id, student_id_2]
        );
        
        res.json({ success: true, message: 'Seats swapped successfully' });
    } catch (error) {
        console.error('Swap seats error:', error);
        res.status(500).json({ error: 'Failed to swap seats' });
    }
});

// Run allocation algorithm
router.post('/allocate', async (req, res) => {
    try {
        const { exam_id, allocation_rules } = req.body;
        
        // Get exam details
        const [exams] = await db.query('SELECT * FROM exams WHERE exam_id = ?', [exam_id]);
        if (exams.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        const exam = exams[0];
        
        // Get eligible students
        let studentQuery = 'SELECT * FROM students WHERE 1=1';
        const studentParams = [];
        
        if (exam.branch) {
            studentQuery += ' AND branch = ?';
            studentParams.push(exam.branch);
        }
        if (exam.year) {
            studentQuery += ' AND year = ?';
            studentParams.push(exam.year);
        }
        if (exam.semester) {
            studentQuery += ' AND semester = ?';
            studentParams.push(exam.semester);
        }
        studentQuery += ' ORDER BY roll_number';
        
        const [students] = await db.query(studentQuery, studentParams);
        
        if (students.length === 0) {
            return res.status(400).json({ error: 'No eligible students found' });
        }
        
        // Get available halls
        const [halls] = await db.query('SELECT * FROM halls WHERE is_available = 1 ORDER BY hall_name');
        
        if (halls.length === 0) {
            return res.status(400).json({ error: 'No available halls found' });
        }
        
        // Check capacity (considering bench capacity)
        const benchCapacity = allocation_rules.bench_capacity || 1;
        const totalCapacity = halls.reduce((sum, h) => sum + (h.total_rows * h.total_columns * benchCapacity), 0);
        
        if (totalCapacity < students.length) {
            return res.status(400).json({ 
                error: `Insufficient capacity. Students: ${students.length}, Capacity: ${totalCapacity}` 
            });
        }
        
        // Run allocation algorithm
        const allocations = allocateSeats({
            exam_id,
            students,
            halls,
            rules: allocation_rules
        });
        
        // Delete existing allocations for this exam
        await db.query('DELETE FROM allocations WHERE exam_id = ?', [exam_id]);
        
        // Insert new allocations
        for (const alloc of allocations) {
            await db.query(
                'INSERT INTO allocations (exam_id, student_id, hall_id, seat_number, row_number, column_number, bench_position) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [alloc.exam_id, alloc.student_id, alloc.hall_id, alloc.seat_number, alloc.row_number, alloc.column_number, alloc.bench_position || 1]
            );
        }
        
        // Update exam status
        await db.query('UPDATE exams SET status = ? WHERE exam_id = ?', ['allocated', exam_id]);
        
        res.json({ 
            success: true, 
            message: 'Allocation completed successfully',
            allocated_count: allocations.length
        });
        
    } catch (error) {
        console.error('Allocation error:', error);
        res.status(500).json({ error: 'Allocation algorithm failed', details: error.message });
    }
});

// Alias: /seating-plan/:examId/:hallId  (same as /seatmap/:examId/:hallId)
// Used by frontend seatmap.html via API.SEATING_PLAN
router.get('/seating-plan/:examId/:hallId', async (req, res) => {
    try {
        const { examId, hallId } = req.params;
        const [halls] = await db.query('SELECT * FROM halls WHERE hall_id = ?', [hallId]);
        if (halls.length === 0) return res.status(404).json({ error: 'Hall not found' });
        const hall = halls[0];

        const [allocations] = await db.query(`
            SELECT a.*, s.roll_number, s.name as student_name, s.branch, s.year
            FROM allocations a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.exam_id = ? AND a.hall_id = ?
            ORDER BY a.row_number, a.column_number, a.bench_position
        `, [examId, hallId]);

        // Build structured seat grid
        const seatMap = { hall, seats: [] };

        for (let row = 1; row <= hall.total_rows; row++) {
            const rowSeats = [];
            for (let col = 1; col <= hall.total_columns; col++) {
                const students = allocations.filter(a => a.row_number === row && a.column_number === col);
                const label = students[0]?.seat_number || `${String.fromCharCode(64 + row)}${col}`;
                rowSeats.push({
                    row, column: col,
                    seat_number: label,
                    students,
                    occupied: students.length > 0
                });
            }
            seatMap.seats.push(rowSeats);
        }
        res.json(seatMap);
    } catch (error) {
        console.error('Seating plan error:', error);
        res.status(500).json({ error: 'Failed to fetch seating plan' });
    }
});

module.exports = router;
