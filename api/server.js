const express = require('express');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const sql = neon(process.env.DATABASE_URL);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize DB Table
const init = async () => {
    await sql`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, 
        email TEXT UNIQUE, 
        password TEXT
    )`;
};
init();

// API Endpoints
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        await sql`INSERT INTO users (email, password) VALUES (${email}, ${hashed})`;
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: "User already exists" });
    }
});

app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (result.length > 0 && await bcrypt.compare(password, result[0].password)) {
        return res.json({ success: true, message: "Logged in!" });
    }
    res.status(401).json({ error: "Invalid credentials" });
});

module.exports = app;