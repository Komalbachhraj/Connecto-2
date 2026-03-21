const express = require("express");
const cors = require("cors");
const http = require("http");
const initSocket = require("./socket");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const matchRoutes = require("./routes/matchRoutes");

const app = express();

// 1. Middlewares
// Yahan origin check kar lena, trailing slash "/" mat lagana
app.use(
  cors({
    origin: [
      "https://connecto-2.vercel.app",
      "http://localhost:5173",
      "http://localhost:8080",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.use(express.json());

// 2. Routes setup
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/match", matchRoutes);

app.get("/", (req, res) => {
  res.send("Connecto Backend is running! 🚀");
});

// 3. SERVER INITIALIZATION
const server = http.createServer(app);

// Socket logic ko server instance pass kiya
initSocket(server);

// Port Configuration
const PORT = process.env.PORT || 5000;

// Render/Deployment ke liye module export
module.exports = app;

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
