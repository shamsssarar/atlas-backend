import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import { config } from './env';

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: config.FIREBASE_PROJECT_ID,
    clientEmail: config.FIREBASE_CLIENT_EMAIL,
    // We replace the escaped newlines to ensure the key is read correctly
    privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

export const auth: Auth = firebaseAdmin.auth();