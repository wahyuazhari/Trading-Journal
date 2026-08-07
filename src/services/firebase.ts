import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  writeBatch
} from 'firebase/firestore';
import { Trade, RiskSettings, UserSettings } from '../types';
import { DEFAULT_RISK_SETTINGS, DEFAULT_USER_SETTINGS, getSampleTrades } from './db';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const dbId = firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, dbId);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Trigger Google Sign In (Gmail login)
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('signInWithPopup failed, falling back to signInWithRedirect:', error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to Auth State changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Sync user profile document in Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Trader',
          email: user.email || '',
          photoURL: user.photoURL || '',
          lastLogin: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.error('Error recording user profile in Firestore:', err);
      }
    }
    callback(user);
  });
}

/**
 * Real-time listener for User Trades in Firestore: users/{userId}/trades
 */
export function subscribeUserTrades(userId: string, callback: (trades: Trade[]) => void) {
  const tradesCollectionRef = collection(db, 'users', userId, 'trades');
  const q = query(tradesCollectionRef);

  return onSnapshot(q, (snapshot) => {
    const trades: Trade[] = [];
    snapshot.forEach((docSnap) => {
      trades.push(docSnap.data() as Trade);
    });

    // Sort descending by date & time
    trades.sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const timeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return timeB - timeA;
    });

    callback(trades);
  }, (error) => {
    console.error('Error fetching real-time trades from Firestore:', error);
  });
}

/**
 * Save / Update trade for user
 */
export async function saveTradeToFirestore(userId: string, trade: Trade): Promise<void> {
  const tradeRef = doc(db, 'users', userId, 'trades', trade.id);
  await setDoc(tradeRef, { ...trade, userId }, { merge: true });
}

/**
 * Delete trade for user
 */
export async function deleteTradeFromFirestore(userId: string, tradeId: string): Promise<void> {
  const tradeRef = doc(db, 'users', userId, 'trades', tradeId);
  await deleteDoc(tradeRef);
}

/**
 * Clear all trades for user
 */
export async function clearAllUserTradesFirestore(userId: string): Promise<void> {
  const tradesCollectionRef = collection(db, 'users', userId, 'trades');
  const snapshot = await getDocs(tradesCollectionRef);
  const batch = writeBatch(db);
  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();
}

/**
 * Bulk Replace trades for user (for backup import or sample seeding)
 */
export async function replaceAllUserTradesFirestore(userId: string, newTrades: Trade[]): Promise<void> {
  await clearAllUserTradesFirestore(userId);
  if (newTrades.length === 0) return;

  const batch = writeBatch(db);
  for (const trade of newTrades) {
    const tradeRef = doc(db, 'users', userId, 'trades', trade.id);
    batch.set(tradeRef, { ...trade, userId });
  }
  await batch.commit();
}

/**
 * Seed initial sample trades into Firestore if user account is brand new
 */
export async function seedInitialTradesIfEmpty(userId: string): Promise<Trade[]> {
  const tradesCollectionRef = collection(db, 'users', userId, 'trades');
  const snapshot = await getDocs(tradesCollectionRef);

  if (snapshot.empty) {
    const samples = getSampleTrades();
    const batch = writeBatch(db);
    for (const trade of samples) {
      const tradeRef = doc(db, 'users', userId, 'trades', trade.id);
      batch.set(tradeRef, { ...trade, userId });
    }
    await batch.commit();
    return samples;
  } else {
    const existing: Trade[] = [];
    snapshot.forEach((d) => existing.push(d.data() as Trade));
    return existing;
  }
}

/**
 * Load Risk Settings for user
 */
export async function loadRiskSettingsFromFirestore(userId: string): Promise<RiskSettings> {
  try {
    const ref = doc(db, 'users', userId, 'settings', 'risk');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_RISK_SETTINGS, ...snap.data() } as RiskSettings;
    }
  } catch (err) {
    console.error('Failed to load risk settings from Firestore:', err);
  }
  return DEFAULT_RISK_SETTINGS;
}

/**
 * Save Risk Settings for user
 */
export async function saveRiskSettingsToFirestore(userId: string, settings: RiskSettings): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'settings', 'risk');
    await setDoc(ref, settings, { merge: true });
  } catch (err) {
    console.error('Failed to save risk settings to Firestore:', err);
  }
}

/**
 * Load User Settings
 */
export async function loadUserSettingsFromFirestore(userId: string): Promise<UserSettings> {
  try {
    const ref = doc(db, 'users', userId, 'settings', 'user');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_USER_SETTINGS, ...snap.data() } as UserSettings;
    }
  } catch (err) {
    console.error('Failed to load user settings from Firestore:', err);
  }
  return DEFAULT_USER_SETTINGS;
}

/**
 * Save User Settings
 */
export async function saveUserSettingsToFirestore(userId: string, settings: UserSettings): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'settings', 'user');
    await setDoc(ref, settings, { merge: true });
  } catch (err) {
    console.error('Failed to save user settings to Firestore:', err);
  }
}
