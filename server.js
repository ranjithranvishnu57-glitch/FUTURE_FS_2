const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ===== DB CONNECT (🔥 CHANGE THIS URL)
mongoose.connect("mongodb+srv://ranjithranvishnu57_db_user:admin@cluster0.6v3r456.mongodb.net/clms")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));
// ===== SCHEMA =====
const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  status: String,
  followUp: String
});

const Lead = mongoose.model("Lead", leadSchema);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// ===== ROUTES =====

// TEST
app.get("/api", (req, res) => {
  res.json({ msg: "API working" });
});

// CREATE LEAD
app.post("/leads", async (req, res) => {
  try {
    console.log("BODY:", req.body); // 👈 ADD THIS

    const lead = new Lead(req.body);
    await lead.save();

    console.log("Saved ✅"); // 👈 ADD THIS

    res.json(lead);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ msg: "Error saving lead" });
  }
});

// GET LEADS
app.get("/leads", async (req, res) => {
  try {
    const leads = await Lead.find();
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching leads" });
  }
});

// DELETE
app.delete("/leads/:id", async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Delete error" });
  }
});

// UPDATE
app.put("/leads/update/:id", async (req, res) => {
  try {
    await Lead.findByIdAndUpdate(req.params.id, req.body);
    res.json({ msg: "Updated" });
  } catch (err) {
    res.status(500).json({ msg: "Update error" });
  }
});

// ===== AUTH =====

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.json({ msg: "User already exists" });

    const user = new User({ email, password });
    await user.save();

    res.json({ msg: "Signup success" });
  } catch (err) {
    res.status(500).json({ msg: "Signup error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) return res.json({ msg: "Invalid credentials" });

    res.json({ msg: "Login success", user });
  } catch (err) {
    res.status(500).json({ msg: "Login error" });
  }
});

// FORGOT PASSWORD
app.post("/forgot", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ msg: "User not found" });

    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password updated" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating password" });
  }
});

// ===== FRONTEND ROUTES =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ===== SERVER =====
app.listen(5000, () => {
  console.log("Server running on port 5000");
});