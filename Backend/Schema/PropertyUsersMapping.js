const conn = require('../db');

const propertyUsersMapping = async () => {
    const client = await conn();
    try {
        const result = await client.query(`
            CREATE TABLE IF NOT EXISTS property_users_mapping (
                id SERIAL PRIMARY KEY,
                property_id INTEGER,
                user_id INTEGER,
                FOREIGN KEY (property_id) REFERENCES properties(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log('Property Users Mapping table created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await client.end();
    }
}

module.exports = propertyUsersMapping;