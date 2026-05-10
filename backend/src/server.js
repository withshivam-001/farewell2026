require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const videoRoutes = require("./routes/videos");
const wallRoutes = require("./routes/wall");
const memoriesRoutes = require("./routes/memories");
const groupsRoutes = require("./routes/groups");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payment");
const settingsRoutes = require("./routes/settings");

const app = express();

// Connect DB
connectDB();

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // increased for dev
  message: { error: "Too many requests" },
});
app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/wall", wallRoutes);
app.use("/api/memories", memoriesRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/settings", settingsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} nahi mili` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
  console.log(`📡 API: http://localhost:${PORT}/api\n`);
});
