import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA8tNQPS5aTDy-RrOevgYFCy0zQhjhqbsw',
  authDomain: 'comfortos.firebaseapp.com',
  projectId: 'comfortos',
  storageBucket: 'comfortos.firebasestorage.app',
  messagingSenderId: '173455945512',
  appId: '1:173455945512:web:7909f8fa1963e47fd5ea1d',
  measurementId: 'G-2RYF9NB71F',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

/** Sign in with Google popup — returns Firebase ID token */
export async function firebaseGoogleSignIn(): Promise<string> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user.getIdToken();
}

/** Sign in with email/password — returns Firebase ID token */
export async function firebaseEmailSignIn(email: string, password: string): Promise<string> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user.getIdToken();
}

/** Create account with email/password — returns Firebase ID token */
export async function firebaseEmailSignUp(
  email: string,
  password: string,
  displayName: string,
): Promise<string> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user.getIdToken();
}

/** Sign out of Firebase */
export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

/** Get current user's fresh ID token (or null) */
export async function getFirebaseIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(true);
}

export type { FirebaseUser };
