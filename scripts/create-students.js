const bcrypt = require('bcrypt');
const db = require('../config/database');

const students = [
    { roll_number: '23CS001', name: 'Student 1', branch: 'Computer Science', year: 2, semester: 3 },
    { roll_number: '23CS002', name: 'Student 2', branch: 'Computer Science', year: 2, semester: 3 },
    { roll_number: '23CS003', name: 'Student 3', branch: 'Computer Science', year: 2, semester: 3 },
    { roll_number: '23CS004', name: 'Student 4', branch: 'Computer Science', year: 2, semester: 3 },
    { roll_number: '23CS005', name: 'Student 5', branch: 'Computer Science', year: 2, semester: 3 },
    { roll_number: '23IT001', name: 'Student 6', branch: 'Information Technology', year: 2, semester: 3 },
    { roll_number: '23IT002', name: 'Student 7', branch: 'Information Technology', year: 2, semester: 3 },
    { roll_number: '23IT003', name: 'Student 8', branch: 'Information Technology', year: 2, semester: 3 },
    { roll_number: '23IT004', name: 'Student 9', branch: 'Information Technology', year: 2, semester: 3 },
    { roll_number: '23EC001', name: 'Student 10', branch: 'Electronics', year: 2, semester: 3 },
    { roll_number: '23EC002', name: 'Student 11', branch: 'Electronics', year: 2, semester: 3 },
    { roll_number: '23EC003', name: 'Student 12', branch: 'Electronics', year: 2, semester: 3 },
    { roll_number: '23ME001', name: 'Student 13', branch: 'Mechanical', year: 2, semester: 3 },
    { roll_number: '23ME002', name: 'Student 14', branch: 'Mechanical', year: 2, semester: 3 },
    { roll_number: '23ME003', name: 'Student 15', branch: 'Mechanical', year: 2, semester: 3 }
];

async function createStudents() {
    try {
        for (const student of students) {
            const hashedPassword = await bcrypt.hash(student.roll_number, 10);
            
            await db.query('DELETE FROM students WHERE roll_number = ?', [student.roll_number]);
            
            await db.query(
                'INSERT INTO students (roll_number, password, name, branch, year, semester) VALUES (?, ?, ?, ?, ?, ?)',
                [student.roll_number, hashedPassword, student.name, student.branch, student.year, student.semester]
            );
        }
        
        console.log('✅ Sample students setup complete!');
        console.log(`   Created: ${students.length} students`);
        console.log('');
        console.log('📝 Student Login Info:');
        console.log('   Password for each student is their roll number');
        console.log('   Example: 23CS001 / 23CS001');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createStudents();
