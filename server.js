require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from ROOT
app.use(express.static(__dirname));

// PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table if not exists
pool.query(`
CREATE TABLE IF NOT EXISTS batteries (
  id SERIAL PRIMARY KEY,
  biker_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  reg_number TEXT NOT NULL,
  battery_company TEXT NOT NULL,
  battery_type TEXT NOT NULL,
  dealer_name TEXT,
  warranty_start_date DATE,
  frame_number TEXT,
  engine_number TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Add battery
app.post("/add-battery", async (req, res) => {
  try {
    const b = req.body;

    await pool.query(
      `INSERT INTO batteries
      (biker_name, phone_number, reg_number, battery_company, battery_type, dealer_name, warranty_start_date, frame_number, engine_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        b.biker_name,
        b.phone_number,
        b.reg_number,
        b.battery_company,
        b.battery_type,
        b.dealer_name,
        b.warranty_start_date || null,
        b.frame_number,
        b.engine_number
      ]
    );

    res.json({ status: "success" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add battery" });
  }
});

// Get batteries
app.get("/batteries", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM batteries ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

// Delete battery
app.delete("/delete-battery/:id", async (req, res) => {
  if (req.body.password !== process.env.DELETE_PASS)
    return res.status(403).json({ error: "Wrong password" });

  await pool.query("DELETE FROM batteries WHERE id=$1", [req.params.id]);
  res.json({ status: "deleted" });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;