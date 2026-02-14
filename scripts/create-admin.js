const bcrypt = require('bcrypt');
const db = require('../config/database');

async function createAdmin() {
    try {
        const username = 'admin';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query('DELETE FROM admins WHERE username = ?', [username]);
        
        await db.query(
            'INSERT INTO admins (username, password, email, full_name) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, 'admin@example.com', 'System Administrator']
        );
        
        console.log('✅ Admin created successfully');
        console.log('=====================================');
        console.log('Admin Credentials:');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('=====================================');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createAdmin();
