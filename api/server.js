const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL1,
  ssl: process.env.VERCEL ? { rejectUnauthorized: false } : false
});

/* CREATE TABLE (UNLIMITED ROWS) */
(async () => {
  try {
    await pool.query(`
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
    console.log("✅ Table ready");
  } catch (err) {
    console.error("❌ Table creation error:", err.message);
  }
})();

/* ================= ADD BATTERY ================= */
app.post("/api/add-battery", async (req, res) => {
  try {
    const b = req.body;

    const result = await pool.query(`
      INSERT INTO batteries
      (customer_name, phone_number, reg_number, battery_company,
       battery_sent_date, dealer_name, frame_number, engine_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `, [
      b.customer_name,
      b.phone_number,
      b.reg_number,
      b.battery_company,
      b.battery_sent_date || null,
      b.dealer_name || null,
      b.frame_number || null,
      b.engine_number || null
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ INSERT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET ALL ================= */
app.get("/api/batteries", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM batteries ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ FETCH ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ================= SEARCH ================= */
app.get("/api/search", async (req, res) => {
  try {
    const q = `%${req.query.q}%`;
    const result = await pool.query(`
      SELECT * FROM batteries
      WHERE customer_name ILIKE $1
      OR phone_number ILIKE $1
      OR reg_number ILIKE $1
      OR battery_company ILIKE $1
      ORDER BY created_at DESC
    `, [q]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ SEARCH ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ================= WARRANTY ================= */
app.post("/api/update-warranty/:id", async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (status === "Denied" && !reason) return res.status(400).json({ error: "Reason required" });

    await pool.query(`
      UPDATE batteries
      SET warranty_status=$1, warranty_reason=$2
      WHERE id=$3
    `, [status, reason || null, req.params.id]);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ WARRANTY ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE ================= */
app.delete("/api/delete-battery/:id", async (req, res) => {
  try {
    if (req.body.password !== process.env.DELETE_PASS) {
      return res.status(403).json({ error: "Wrong password" });
    }
    await pool.query("DELETE FROM batteries WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ================= SERVE FRONTEND ================= */
app.use(express.static(path.join(__dirname, "../")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
