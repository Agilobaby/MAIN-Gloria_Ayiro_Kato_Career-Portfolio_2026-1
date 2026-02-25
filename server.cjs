require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// --- Configuration ---
const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // Local MongoDB
const JWT_SECRET = process.env.JWT_SECRET; // In prod, use process.env

// --- Middleware ---
// Security Headers
app.use(helmet());
// NoSQL Injection Prevention
// NoSQL injection prevention — strips $ and . from request body keys
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      });
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});
// Global Rate Limiter - 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});
app.use(globalLimiter);
// Strict Login Rate Limiter - 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' }
});
// Contact Form Rate Limiter - 3 submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You have sent too many messages. Please wait an hour before trying again.' }
});

app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Database Schema ---

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin'
  }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
  title: String,
  category: String,
  image: String,
  link: String,
  description: String
});
const Project = mongoose.model('Project', projectSchema);

// Experience Schema
const experienceSchema = new mongoose.Schema({
  type: { type: String, enum: ['education', 'work'] },
  title: String,
  role: String,
  date: String,
  description: String
});
const Experience = mongoose.model('Experience', experienceSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  subject: { type: String, trim: true, maxlength: [200, 'Subject cannot exceed 200 characters'] },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Security Log Schema
const securityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  status: { type: String, required: true },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});
const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

const logSecurityEvent = async (action, status, req) => {
  try {
    await SecurityLog.create({
      action,
      status,
      ip: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'Unknown'
    });
  } catch (e) {
    // Never let logging crash the main app
  }
};

// --- Failed Login Lockout ---
const loginAttempts = new Map();

const checkLockout = (email) => {
  const attempts = loginAttempts.get(email);
  if (!attempts) return false;
  if (attempts.count >= 5) {
    const timeSince = Date.now() - attempts.lastAttempt;
    if (timeSince < 15 * 60 * 1000) return true;
    loginAttempts.delete(email);
    return false;
  }
  return false;
};

const recordFailedAttempt = (email) => {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(email, attempts);
};

const clearLoginAttempts = (email) => {
  loginAttempts.delete(email);
};
// --- Routes ---

// 1. Auth Routes
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check email-based account lockout
    if (checkLockout(email)) {
      return res.status(429).json({ error: 'Account temporarily locked. Too many failed attempts. Try again in 15 minutes.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      recordFailedAttempt(email);
      await logSecurityEvent('LOGIN_FAILED', 'WARNING', req);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      recordFailedAttempt(email);
      await logSecurityEvent('LOGIN_FAILED', 'WARNING', req);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    clearLoginAttempts(email);
    await logSecurityEvent('LOGIN_SUCCESS', 'SUCCESS', req);
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { _id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware for protected routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// 2. Projects Routes
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json(project);
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// 3. Experience Routes
app.get('/api/experience', async (req, res) => {
  const exp = await Experience.find();
  res.json(exp);
});

app.post('/api/experience', authMiddleware, async (req, res) => {
  const exp = new Experience(req.body);
  await exp.save();
  res.json(exp);
});

app.delete('/api/experience/:id', authMiddleware, async (req, res) => {
  await Experience.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// 4. Contact Routes
app.post('/api/contact', contactLimiter, async (req, res) => {
  // Honeypot check — bots fill hidden fields, humans never see them
  if (req.body.website_url) {
    return res.json({ message: 'Message sent' }); // Silent rejection
  }

  // Email injection prevention
  const emailValue = req.body.email || '';
  if (emailValue.includes('\n') || emailValue.includes('\r') ||
      emailValue.includes('%0a') || emailValue.includes('%0d')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const msg = new Message({
      fullName: req.body.fullName,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
    });
    await msg.save();
    res.json({ message: 'Message sent' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/messages', authMiddleware, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

// --- Initialization & Seeding ---
const seedData = async () => {
  // Seed Admin
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt)
    await User.create({ email: process.env.ADMIN_EMAIL, passwordHash, role: 'admin' });
    console.log('Admin user created: process.env.ADMIN_EMAIL/ process.env.ADMIN_PASSWORD');
  }

  // Seed Projects (if empty)
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany([
      { title: 'Dashboard UI', category: 'UI Design', image: 'https://picsum.photos/400/300?random=1' },
      { title: 'E-commerce App', category: 'Web Templates', image: 'https://picsum.photos/400/300?random=2' },
      { title: 'Brand Identity', category: 'Branding', image: 'https://picsum.photos/400/300?random=3' },
    ]);
    console.log('Seed projects created');
  }

  // Seed Experience (if empty)
  const expCount = await Experience.countDocuments();
  if (expCount === 0) {
    await Experience.insertMany([
      { type: 'education', title: 'University of Toronto', role: 'Student', date: 'Jan 2016 - Dec 2021', description: 'Major in Computer Science. Graduated with Honors.' },
      { type: 'education', title: 'Programming Course', role: 'Student', date: 'Jan 2016 - Dec 2021', description: 'Intensive bootcamp for Full Stack Development.' },
      { type: 'education', title: 'Web Developer Courses', role: 'Student', date: 'Jan 2016 - Dec 2021', description: 'Advanced React and Node.js certification.' },
      { type: 'work', title: 'Lead Web Designer', role: 'Designer', date: 'Jan 2016 - Dec 2021', description: 'Led a team of 5 designers.' },
      { type: 'work', title: 'Junior Web Designer', role: 'Designer', date: 'Jan 2016 - Dec 2021', description: 'Created mockups for clients.' },
      { type: 'work', title: 'Senior Web Designer', role: 'Designer', date: 'Jan 2016 - Dec 2021', description: 'Specialized in accessibility and responsive design.' },
    ]);
    console.log('Seed experience created');
  }
};

// --- Server Start ---
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedData();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
