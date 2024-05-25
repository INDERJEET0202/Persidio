// require('dotenv').config();
// const { Client } = require("pg");

// const client = new Client({
//     connectionString: process.env.DATABASE_URL
// });

// (async () => {
//     await client.connect();
//     try {
//         const results = await client.query("SELECT NOW()");
//         console.log(results);
//     } catch (err) {
//         console.error("error executing query:", err);
//     } finally {
//         await client.end();
//     }
// })();


require('dotenv').config();
const { Client } = require('pg');

const connectToDatabase = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    return client;
};

module.exports = connectToDatabase;
