const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let credentials;

// Prefer environment variable (stringified JSON)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
    process.exit(1);
  }
} else {
  // Fallback to local file for dev convenience
  const keyPath = path.join(__dirname, 'serviceAccountKey.json');
  if (!fs.existsSync(keyPath)) {
    console.error('serviceAccountKey.json not found. Set FIREBASE_SERVICE_ACCOUNT env or place the key file in backend/.');
    process.exit(1);
  }
  credentials = require(keyPath);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
