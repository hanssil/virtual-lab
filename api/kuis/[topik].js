const { admin, db } = require('../_lib/firebase-admin');

function docIdOf(uid, topic) {
  return `${uid}__${topic}`;
}

async function verifyTokenFromHeader(req) {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email || null };
  } catch (e) {
    return null;
  }
}

module.exports = async (req, res) => {
  const { topik } = req.query;

  if (req.method === 'GET') {
    try {
      const user = await verifyTokenFromHeader(req);
      const uid = user?.uid || req.query.uid; // allow uid for dev fallback
      if (!uid) return res.status(400).json({ error: 'uid is required' });

      const id = docIdOf(uid, topik);
      const snap = await db.collection('quizResults').doc(id).get();
      if (!snap.exists) return res.status(404).json({ error: 'not found' });
      return res.status(200).json({ id, ...snap.data() });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'internal error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await verifyTokenFromHeader(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { lastScore, totalQuestions, correctAnswers } = req.body || {};
      if (
        typeof lastScore !== 'number' ||
        typeof totalQuestions !== 'number' ||
        typeof correctAnswers !== 'number'
      ) {
        return res.status(400).json({ error: 'invalid payload' });
      }

      const uid = user.uid;
      const userEmail = user.email || null;
      const id = docIdOf(uid, topik);
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
        topic: topik,
      };

      await ref.set(doc, { merge: true });
      return res.status(prev.exists ? 200 : 201).json({ id, ...doc });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'internal error' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
