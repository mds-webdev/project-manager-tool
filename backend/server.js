const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const Project = require("./models/Project");
const User = require('./models/User'); // ⬅️ falls nicht bereits importiert
require("dotenv").config();

const app = express();

// CORS + JSON Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Session
app.use(
  session({
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 2 * 60 * 60 * 1000 },
  })
);

// MongoDB Verbindung
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB verbunden"))
  .catch((err) => console.error("🔴 MongoDB-Fehler:", err));

// Dev-Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (process.env.ENVIRONMENT === "dev") {
    if (username === "mario" && password === "test123") {
      req.session.user = { username };
      return res.status(200).json({ message: "Login erfolgreich", username });
    } else {
      return res.status(401).json({ message: "Falscher Login" });
    }
  }
});

// Auth Status
app.get("/auth/status", (req, res) => {
  if (req.session.user) {
    return res
      .status(200)
      .json({ loggedIn: true, username: req.session.user.username });
  }
  return res.status(401).json({ loggedIn: false });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout erfolgreich" });
  });
});

// Projekte speichern
app.post("/api/projects", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Nicht eingeloggt" });

  const { name } = req.body;
  try {
    const newProject = new Project({
      name,
      createdBy: req.session.user.username,
    });
    await newProject.save();
    res.status(201).json({ message: "Projekt gespeichert" });
  } catch (err) {
    console.error("❌ Fehler beim Speichern:", err);
    res.status(500).json({ message: "Fehler beim Speichern" });
  }
});

app.get("/api/projects", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Nicht eingeloggt" });

  try {
    const projects = await Project.find({
      createdBy: req.session.user.username,
    }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    console.error("❌ Fehler beim Abrufen:", err);
    res.status(500).json({ message: "Fehler beim Abrufen der Projekte" });
  }
});

//PROJECT DELETE
app.delete("/api/projects/:id", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Nicht eingeloggt" });

  try {
    const result = await Project.deleteOne({
      _id: req.params.id,
      createdBy: req.session.user.username,
    });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Projekt gelöscht" });
    } else {
      res
        .status(404)
        .json({ message: "Projekt nicht gefunden oder kein Zugriff" });
    }
  } catch (err) {
    console.error("❌ Fehler beim Löschen:", err);
    res.status(500).json({ message: "Löschfehler" });
  }
});

//PROJECT EDIT
app.put("/api/projects/:id", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Nicht eingeloggt" });

  const { name, status } = req.body;

  try {
    const updated = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.session.user.username },
      { name, status },
      { new: true }
    );

    if (updated) {
      res.status(200).json(updated);
    } else {
      res.status(404).json({ message: "Projekt nicht gefunden" });
    }
  } catch (err) {
    console.error("❌ Fehler beim Aktualisieren:", err);
    res.status(500).json({ message: "Fehler beim Update" });
  }
});

//LOGGED IN
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Nicht eingeloggt' });
  res.json({ username: req.session.user.username });
});


//COMMENTS FOR PROJECTS
app.post('/api/projects/:id/comments', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Nicht eingeloggt' });

  const { text } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projekt nicht gefunden' });

    project.comments.push({
      text,
      author: req.session.user.username,
      createdAt: new Date()
    });

    await project.save();
    res.status(201).json({ message: 'Kommentar gespeichert', comment: project.comments.at(-1) });
  } catch (err) {
    console.error('❌ Fehler beim Speichern des Kommentars:', err);
    res.status(500).json({ message: 'Fehler beim Speichern' });
  }
});

app.delete('/api/projects/:projectId/comments/:index', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Nicht eingeloggt' });

  const { projectId, index } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Projekt nicht gefunden' });

    const comment = project.comments[index];
    if (!comment || comment.author !== req.session.user.username) {
      return res.status(403).json({ message: 'Keine Berechtigung zum Löschen' });
    }

    project.comments.splice(index, 1);
    await project.save();
    res.status(200).json({ message: 'Kommentar gelöscht' });
  } catch (err) {
    console.error('❌ Fehler beim Löschen des Kommentars:', err);
    res.status(500).json({ message: 'Löschfehler' });
  }
});

//BENUTZER ROLLEN VERWALTEN
app.get('/api/seed-users', async (req, res) => {
  try {
    await User.deleteMany({});
    await User.insertMany([
      { username: "mario", password: "123", role: "programmierer" },
      { username: "anna", password: "abc", role: "designer" },
      { username: "tim", password: "xyz", role: "content" },
      { username: "lara", password: "admin", role: "admin" }
    ]);
    res.send('Benutzer eingefügt ✅');
  } catch (err) {
    res.status(500).send('Fehler beim Seed');
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username role'); // Nur wichtige Felder
    res.json(users);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Benutzer:', err);
    res.status(500).json({ message: 'Fehler beim Laden der Benutzer' });
  }
});

app.put('/api/users/:id/role', async (req, res) => {
  const { role } = req.body;

  try {
    await User.findByIdAndUpdate(req.params.id, { role });
    res.status(200).json({ message: 'Rolle geändert' });
  } catch (err) {
    console.error('❌ Fehler beim Rollen-Update:', err);
    res.status(500).json({ message: 'Fehler beim Rollenwechsel' });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`)
);
