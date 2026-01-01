const express = require('express');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
// This line crashes the function if DATABASE_URL is missing
const sql = neon(process.env.DATABASE_URL); 

app.use(express.json());
// Serves static files from the public folder at the root
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        await sql`INSERT INTO users (email, password) VALUES (${email}, ${hashed})`;
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: "User already exists or DB error" });
    }
});

app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (result.length > 0 && await bcrypt.compare(password, result[0].password)) {
            return res.json({ success: true });
        }
        res.status(401).json({ error: "Invalid credentials" });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

// IMPORTANT: Do not use app.listen(). Vercel handles the port.
module.exports = app;
