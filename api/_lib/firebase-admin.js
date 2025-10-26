const admin = require('firebase-admin');

if (!admin.apps.length) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT env');
  let creds;
  try {
    creds = JSON.parse(json);
  } catch (e) {
    console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
    throw e;
  }
  admin.initializeApp({ credential: admin.credential.cert(creds) });
}

const db = admin.firestore();
module.exports = { admin, db };
