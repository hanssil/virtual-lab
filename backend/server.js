const express = require('express');
const cors = require('cors');
const path = require('path');
const { admin, db } = require('./firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors()); // allow all origins during development

// Optional: serve static frontend for dev convenience
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'virtual-lab-api', storage: 'firestore', time: new Date().toISOString() });
});

// Auth middleware: verify Firebase ID token when provided
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email || null };
    return next();
  } catch (e) {
    console.error('Invalid token:', e.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function docIdOf({ uid, topic }) {
  return `${uid}__${topic}`;
}

// GET previous quiz result
// /api/kuis/:topic?uid=...
app.get('/api/kuis/:topic', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.params;
    const uid = req.user?.uid || req.query.uid; // allow query uid for dev if no token
    if (!uid) return res.status(400).json({ error: 'uid is required' });
    const id = docIdOf({ uid, topic });
    const snap = await db.collection('quizResults').doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: 'not found' });
    return res.json({ id, ...snap.data() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal error' });
  }
});

// POST create/update quiz result
// expects: { uid, userEmail, lastScore, totalQuestions, correctAnswers }
app.post('/api/kuis/:topic', authMiddleware, async (req, res) => {
  try {
    const { topic } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { lastScore, totalQuestions, correctAnswers } = req.body || {};
    if (
      typeof lastScore !== 'number' ||
      typeof totalQuestions !== 'number' ||
      typeof correctAnswers !== 'number'
    ) {
      return res.status(400).json({ error: 'lastScore, totalQuestions, correctAnswers must be numbers' });
    }

    const uid = req.user.uid;
    const userEmail = req.user.email || null;
    const id = docIdOf({ uid, topic });
    const ref = db.collection('quizResults').doc(id);
    const prev = await ref.get();
    const attempts = prev.exists ? (prev.data().attempts || 0) + 1 : 1;

    const doc = {
      userId: uid,
      userEmail,
      lastScore,
      totalQuestions,
      correctAnswers,
      completedAt: new Date().toISOString(),
      attempts,
      topic
    };

    await ref.set(doc, { merge: true });
    return res.status(prev.exists ? 200 : 201).json({ id, ...doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal error' });
  }
});

// Optional: serve frontend locally for dev (uncomment if needed)
// const FRONTEND_DIR = path.join(__dirname, '../');
// app.use(express.static(FRONTEND_DIR));

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
