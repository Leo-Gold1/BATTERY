require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table safely
pool.query(`
CREATE TABLE IF NOT EXISTS batteries (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  reg_number TEXT NOT NULL,
  battery_company TEXT NOT NULL,
  battery_sent_date DATE,
  dealer_name TEXT,
  frame_number TEXT,
  engine_number TEXT,
  warranty_status TEXT DEFAULT 'Pending',
  warranty_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

// Root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Add Battery
app.post("/add-battery", async (req, res) => {
  try {
    const b = req.body;

    await pool.query(
      `INSERT INTO batteries
      (customer_name, phone_number, reg_number, battery_company, battery_sent_date, dealer_name, frame_number, engine_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        b.customer_name,
        b.phone_number,
        b.reg_number,
        b.battery_company,
        b.battery_sent_date || null,
        b.dealer_name || null,
        b.frame_number || null,
        b.engine_number || null
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

// Get All
app.get("/batteries", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM batteries ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

// Search by Reg Number
app.get("/search/:reg", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM batteries WHERE reg_number ILIKE $1",
    [`%${req.params.reg}%`]
  );
  res.json(result.rows);
});

// Update Warranty
app.put("/update-warranty/:id", async (req, res) => {
  const { status, reason } = req.body;

  await pool.query(
    `UPDATE batteries 
     SET warranty_status=$1, warranty_reason=$2 
     WHERE id=$3`,
    [status, reason || null, req.params.id]
  );

  res.json({ success: true });
});

// Local dev only
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
  );
}

module.exports = app;