const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config();

const app = express();

// CORS + JSON Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 2 * 60 * 60 * 1000 }
}));

// MongoDB Verbindung
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 MongoDB verbunden'))
  .catch(err => console.error('🔴 MongoDB-Fehler:', err));

// Dev-Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (process.env.ENVIRONMENT === 'dev') {
    if (username === 'mario' && password === 'test123') {
      req.session.user = { username };
      return res.status(200).json({ message: 'Login erfolgreich', username });
    } else {
      return res.status(401).json({ message: 'Falscher Login' });
    }
  }
});

// Auth Status
app.get('/auth/status', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ loggedIn: true, username: req.session.user.username });
  }
  return res.status(401).json({ loggedIn: false });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout erfolgreich' });
  });
});

// Projekte speichern
app.post('/api/projects', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Nicht eingeloggt' });

  const { name } = req.body;
  try {
    const newProject = new Project({
      name,
      createdBy: req.session.user.username
    });
    await newProject.save();
    res.status(201).json({ message: 'Projekt gespeichert' });
  } catch (err) {
    console.error('❌ Fehler beim Speichern:', err);
    res.status(500).json({ message: 'Fehler beim Speichern' });
  }
});

app.get('/api/projects', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Nicht eingeloggt' });

  try {
    const projects = await Project.find({ createdBy: req.session.user.username }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen:', err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Projekte' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend läuft auf http://localhost:${PORT}`));
