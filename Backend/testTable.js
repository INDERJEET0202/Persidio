const conn = require('./db');

const testTable = async () => {
    const client = await conn();
    try {
        const result = await client.query(
            'CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name TEXT)'
        );
        console.log('Table created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await client.end();
    }
}

module.exports = testTable;