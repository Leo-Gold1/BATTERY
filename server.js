require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DELETE_PASS = process.env.DELETE_PASS;

let collection;

// Connect to MongoDB
async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("batteryDB");
  collection = db.collection("batteries");
  console.log("✅ Connected to MongoDB!");
}
connectDB();

// Serve frontend files
app.use(express.static(path.join(__dirname)));

// API: Get all batteries
app.get("/batteries", async (req, res) => {
  try {
    const batteries = await collection.find().toArray();
    res.json(batteries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch batteries" });
  }
});

// API: Add battery
app.post("/add-battery", async (req, res) => {
  try {
    await collection.insertOne(req.body);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add battery" });
  }
});

// API: Delete battery
app.delete("/delete-battery/:id", async (req, res) => {
  const { password } = req.body;
  if (password !== DELETE_PASS) return res.status(403).json({ error: "Wrong password" });
  try {
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ status: "deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete battery" });
  }
});

// Express 5 fallback fix for frontend routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));