const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        const [halls] = await db.query('SELECT * FROM halls ORDER BY hall_name');
        res.json(halls);
    } catch (error) {
        console.error('Get halls error:', error);
        res.status(500).json({ error: 'Failed to fetch halls' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { hall_name, capacity, rows, columns, building, floor, bench_capacity } = req.body;
        
        const [result] = await db.query(
            'INSERT INTO halls (hall_name, capacity, total_rows, total_columns, building, floor, bench_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [hall_name, capacity, rows, columns, building, floor, bench_capacity || 1]
        );
        
        res.json({ success: true, message: 'Hall added successfully', hall_id: result.insertId });
    } catch (error) {
        console.error('Add hall error:', error);
        res.status(500).json({ error: 'Failed to add hall' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { hall_name, capacity, rows, columns, building, floor, is_available, bench_capacity } = req.body;
        
        await db.query(
            'UPDATE halls SET hall_name = ?, capacity = ?, total_rows = ?, total_columns = ?, building = ?, floor = ?, is_available = ?, bench_capacity = ? WHERE hall_id = ?',
            [hall_name, capacity, rows, columns, building, floor, is_available, bench_capacity || 1, id]
        );
        
        res.json({ success: true, message: 'Hall updated successfully' });
    } catch (error) {
        console.error('Update hall error:', error);
        res.status(500).json({ error: 'Failed to update hall' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM halls WHERE hall_id = ?', [id]);
        res.json({ success: true, message: 'Hall deleted successfully' });
    } catch (error) {
        console.error('Delete hall error:', error);
        res.status(500).json({ error: 'Failed to delete hall' });
    }
});

module.exports = router;
