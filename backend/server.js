require("dotenv").config();

// Environment Variable Validation
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "GEMINI_API_KEY"];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(`❌ CRITICAL ERROR: ${env} is not defined in .env`);
    process.exit(1);
  }
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Security Headers
app.use(helmet());

// Body Parser with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Dynamic CORS for Local & Production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://my-quizzyy.vercel.app'
].filter(Boolean).map(o => o.replace(/\/$/, "")); // Strip trailing slashes

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                     normalizedOrigin.startsWith('http://localhost:') ||
                     normalizedOrigin.endsWith('.vercel.app'); // Allow Vercel previews
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`❌ CORS REJECTED: Origin "${origin}" is not in the allowed list:`, allowedOrigins);
      // Instead of an error, we return false to the origin check which naturally fails CORS
      callback(null, false); 
    }
  },
  credentials: true
}));

// Rate Limiting (Global or specific to auth can be added)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Basic Route
app.get("/", (req, res) => {
  res.send("MyQuizzyy AI API is running...");
});

// Import Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myquizzyy")
  .then(() => {
    console.log("-----------------------------------------");
    console.log("✅ MongoDB Connected Successfully");
    console.log("-----------------------------------------");
  })
  .catch((err) => {
    console.log("-----------------------------------------");
    console.error("❌ MONGODB CONNECTION ERROR:");
    console.error(err);
    console.log("-----------------------------------------");
    console.log("Please check your MONGO_URI in .env and ensure your IP is whitelisted in MongoDB Atlas.");
    // For now, let's not exit, so the server can at least respond to "/"
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
