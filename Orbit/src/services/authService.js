import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";

import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

const provider = new GoogleAuthProvider();

// ─── Helper: Generate unique Orbit ID ─────────
const generateOrbitId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ORBIT-";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ─── Helper: Create NEW user document ─────────
const createNewUser = async (user, provider) => {
  const userRef = doc(db, "users", user.uid);

  const newUserData = {
    uid: user.uid,
    name: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    provider: provider,
    role: "user",
    online: true,
    orbitId: generateOrbitId(),
    points: 0,
    gems: 0,
    streak: 0,
    bio: "Exploring the Orbit universe 🚀",
    coverImage: "",
    avatar: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userRef, newUserData, { merge: false });
};

// ─── Helper: Update EXISTING user on login ────
const updateExistingUser = async (user) => {
  const userRef = doc(db, "users", user.uid);

  // Only update fields that should change on login
  // ⚠️ DO NOT touch: role, orbitId, points, gems, streak, createdAt
  const updateData = {
    online: true,
    updatedAt: serverTimestamp()
  };

  // Update name/photo only if they changed (Google might update their profile)
  if (user.displayName) {
    updateData.name = user.displayName;
  }
  if (user.photoURL) {
    updateData.photoURL = user.photoURL;
  }

  await updateDoc(userRef, updateData);
};

// ─── Helper: Save or update user after auth ───
const handleUserAuth = async (user, provider) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await updateExistingUser(user);
  } else {
    await createNewUser(user, provider);
  }
};

// ─── Auth Functions ───────────────────────────

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  await handleUserAuth(result.user, "google");
  return result.user;
};

export const registerWithEmail = async (name, email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  // Create user doc with the provided name
  const user = result.user;
  const userRef = doc(db, "users", user.uid);

  await setDoc(userRef, {
    uid: user.uid,
    name: name,
    email: user.email,
    photoURL: "",
    provider: "email",
    role: "user",
    online: true,
    orbitId: generateOrbitId(),
    points: 0,
    gems: 0,
    streak: 0,
    bio: "Exploring the Orbit universe 🚀",
    coverImage: "",
    avatar: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: false });

  return user;
};

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await handleUserAuth(result.user, "email");
  return result.user;
};

export const logoutUser = async () => {
  const user = auth.currentUser;

  if (user) {
    try {
      // Set user offline before signing out
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        online: false,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch {
      // If this fails, still log them out
      // (e.g., user doc doesn't exist, network error)
    }
  }

  await signOut(auth);
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};