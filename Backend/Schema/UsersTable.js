const conn = require('../db');

const usersTable = async () => {
    const client = await conn();
    try {
        const result = await client.query(
            'CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, first_name TEXT, last_name TEXT , password TEXT, email TEXT, phone_number TEXT, type TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
        );
        console.log('Users created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await client.end();
    }
}

module.exports = usersTable;