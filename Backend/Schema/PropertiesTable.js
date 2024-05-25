const conn = require('../db');

const propertiesTable = async () => {
    const client = await conn();
    try {
        const result = await client.query(`
            CREATE TABLE IF NOT EXISTS properties (
                id SERIAL PRIMARY KEY,
                area VARCHAR(255),
                num_rooms INTEGER,
                num_bathrooms INTEGER,
                num_garages INTEGER,
                price INTEGER,
                address VARCHAR(255),
                city VARCHAR(255),
                state VARCHAR(255),
                zipcode VARCHAR(255),
                description TEXT,
                property_type VARCHAR(255),
                image_url TEXT,
                nearby_parks BOOLEAN,
                nearby_hospitals BOOLEAN,
                nearby_schools BOOLEAN,
                sold BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Properties table created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await client.end();
    }
}

module.exports = propertiesTable;
