const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});
pool.connect().then(() => {
    console.log('Connected to the database '+process.env.DB_NAME);
}).catch((err) => {
    console.error('Error connecting to the database', err);
});
module.exports = pool;