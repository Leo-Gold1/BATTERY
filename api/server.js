const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table
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
    console.log("Table ready");
  } catch (err) {
    console.error(err);
  }
})();

// Routes
app.post("/api/add-battery", async (req, res) => {
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
});

app.get("/api/batteries", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM batteries ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

app.delete("/api/delete-battery/:id", async (req, res) => {
  if (req.body.password !== process.env.DELETE_PASS) {
    return res.status(403).json({ error: "Wrong password" });
  }

  await pool.query("DELETE FROM batteries WHERE id=$1", [
    req.params.id
  ]);

  res.json({ success: true });
});


// 🔥 LOCALHOST SUPPORT (ONLY FOR REPLIT / LOCAL)
if (process.env.VERCEL !== "1") {
  app.use(express.static("./"));

  app.get("/", (req, res) => {
    res.sendFile(require("path").join(__dirname, "../index.html"));
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log("Running locally on http://localhost:" + PORT);
  });
}

// Export for Vercel
module.exports = app;