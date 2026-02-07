const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* ======================
   Lead Schema
====================== */

const LeadSchema = new mongoose.Schema({
  propertyId: Number,
  propertyTitle: String,
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  message: String,
  agentId: Number,
  status: { type: String, default: "New" }
}, { timestamps: true });

const Lead = mongoose.model("Lead", LeadSchema);

/* ======================
   Routes
====================== */

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/api/leads", async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json({ message: "Lead saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/leads/:agentId", async (req, res) => {
  const leads = await Lead.find({ agentId: req.params.agentId });
  res.json(leads);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
