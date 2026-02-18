require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; // Local MongoDB
const JWT_SECRET = process.env.JWT_SECRET; // In prod, use process.env

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Database Schema ---

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' }
});
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
  fullName: String,
  email: String,
  subject: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- Routes ---

// 1. Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
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
app.post('/api/contact', async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json({ message: 'Message sent' });
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
    console.log('Admin user created: admin@example.com / password123');
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
