const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
    // .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

// Schemas and Models
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const DataSchema = new mongoose.Schema({ text: String, userId: String });

const User = mongoose.model("User", UserSchema);
const Data = mongoose.model("Data", DataSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("Access Denied");

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Invalid Token");
        req.user = user;
        next();
    });
};

// Routes
app.post("/signup", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({ username: req.body.username, password: hashedPassword });
        await newUser.save();
        res.status(201).send("User created");
    } catch (error) {
        res.status(500).send("Error creating user");
    }
});

app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !(await bcrypt.compare(req.body.password, user.password)))
            return res.status(400).send("Invalid credentials");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).send("Error logging in");
    }
});

app.post("/save", authenticateToken, async (req, res) => {
    try {
        const newData = new Data({ text: req.body.text, userId: req.user.id });
        await newData.save();
        res.status(201).send("Data saved successfully!");
    } catch (error) {
        res.status(500).send("Error saving data");
    }
});

app.get("/data", authenticateToken, async (req, res) => {
    try {
        const data = await Data.find({ userId: req.user.id });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).send("Error retrieving data");
    }
});

// 
// Update an existing data entry
app.put("/data/:id", authenticateToken, async (req, res) => {
    try {
        const updatedData = await Data.findByIdAndUpdate(
            req.params.id,
            { text: req.body.text },
            { new: true }
        );
        res.status(200).json(updatedData);
    } catch (error) {
        res.status(500).send("Error updating data");
    }
});

// Delete a data entry
app.delete("/data/:id", authenticateToken, async (req, res) => {
    try {
        await Data.findByIdAndDelete(req.params.id);
        res.status(200).send("Data deleted successfully");
    } catch (error) {
        res.status(500).send("Error deleting data");
    }
});

// Socket.io
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("voiceData", async (data) => {
        console.log("Received voice data:", data);
        const newData = new Data({ text: data.text, userId: data.userId });
        await newData.save();
        io.emit("dataUpdate", data);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
