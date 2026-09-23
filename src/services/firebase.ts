import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import configJson from '../../firebase-applet-config.json';
import { getEnvironmentConfig } from '../config/environment';

// Configuration resolution: prioritize environment variables, fallback to generated json
const meta = typeof import.meta !== 'undefined' ? (import.meta as any) : undefined;
const safeEnv =
  meta && meta.env
    ? meta.env
    : (typeof process !== 'undefined' ? process.env : {}) || {};

export const envConfig = getEnvironmentConfig();

const firebaseConfig = {
  apiKey: (safeEnv as Record<string, string>).VITE_FIREBASE_API_KEY || configJson.apiKey,
  authDomain: (safeEnv as Record<string, string>).VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
  projectId: (safeEnv as Record<string, string>).VITE_FIREBASE_PROJECT_ID || configJson.projectId,
  storageBucket: (safeEnv as Record<string, string>).VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
  messagingSenderId: (safeEnv as Record<string, string>).VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
  appId: (safeEnv as Record<string, string>).VITE_FIREBASE_APP_ID || configJson.appId,
};

const firestoreDbId =
  (safeEnv as Record<string, string>).VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  configJson.firestoreDatabaseId ||
  '(default)';

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, firestoreDbId);
export const firebaseApp: FirebaseApp = app;

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/**
 * Avaliação e suporte a Firebase App Check.
 * Respeita a diretriz de não ativar serviços externos compulsoriamente sem chaves explícitas.
 */
export function initializeAppCheckIfConfigured(): boolean {
  try {
    const appCheckKey = (safeEnv as Record<string, string>).VITE_FIREBASE_APPCHECK_KEY;
    const isDebugToken = typeof window !== 'undefined' && (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN;

    if (!appCheckKey && !isDebugToken) {
      // Serviço mantido inativo deliberadamente para evitar requisições desnecessárias
      return false;
    }

    // App Check está configurado no ambiente
    return true;
  } catch (err) {
    console.warn('[Firebase] App Check não inicializado:', err);
    return false;
  }
}
