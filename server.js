const multer = require("multer");
const cloudinary = require("cloudinary").v2;
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });



/* ======================
   Lead Schema
====================== */

const LeadSchema = new mongoose.Schema({
  propertyId: String,
  propertyTitle: String,
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  message: String,
  agentId: Number,
  status: { type: String, default: "New" }
}, { timestamps: true });

const PropertySchema = new mongoose.Schema({
  title: String,
  price: Number,
  area: Number,
  beds: Number,
  location: String,
  status: String,
  lat: Number,
  lng: Number,
  images: [String]
}, { timestamps: true });

// Create property
app.post("/api/properties", async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json({ message: "Property saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all properties
app.get("/api/properties", async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
});


const Property = mongoose.model("Property", PropertySchema);


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


app.post("/api/upload", upload.array("images", 10), async (req, res) => {
  try {
    const uploadPromises = req.files.map(file =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "nova-estates" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(file.buffer);
      })
    );

    const imageUrls = await Promise.all(uploadPromises);

    res.json({ imageUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update property availability
app.put("/api/properties/:id/status", async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

