import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

/* =======================================
   Search Users by Name or Orbit ID
======================================= */

export const searchUsers = async (text) => {
  if (!text.trim()) return [];

  const users = [];
  const seen = new Set();
  const term = text.trim();

  const addUsers = (snapshot) => {
    snapshot.forEach((d) => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        users.push({ id: d.id, ...d.data() });
      }
    });
  };

  // ── 1. Exact orbitId match ──
  try {
    const q = query(
      collection(db, "users"),
      where("orbitId", "==", term),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      addUsers(snap);
      return users;
    }
  } catch (err) { /* skip */ }

  // ── 2. Prefix search on name fields ──
  // Checks displayName, name, fullName — whichever exists
  const nameFields = ["displayName", "name", "fullName", "username"];
  const variants = [
    term,
    term.charAt(0).toUpperCase() + term.slice(1).toLowerCase(),
    term.toLowerCase(),
  ];

  for (const field of nameFields) {
    for (const v of [...new Set(variants)]) {
      try {
        const q = query(
          collection(db, "users"),
          where(field, ">=", v),
          where(field, "<=", v + "\uf8ff"),
          limit(10)
        );
        const snap = await getDocs(q);
        addUsers(snap);
        if (users.length > 0) break;
      } catch (err) { /* skip */ }
    }
    if (users.length > 0) break;
  }

  // ── 3. Prefix search on orbitId ──
  if (users.length === 0) {
    try {
      const q = query(
        collection(db, "users"),
        where("orbitId", ">=", term),
        where("orbitId", "<=", term + "\uf8ff"),
        limit(10)
      );
      const snap = await getDocs(q);
      addUsers(snap);
    } catch (err) { /* skip */ }
  }

  // ── 4. Client-side filter ──
  if (users.length > 0) {
    const q = term.toLowerCase();
    return users.filter((u) =>
      getName(u).toLowerCase().includes(q) ||
      (u.orbitId || "").toLowerCase().includes(q)
    );
  }

  return users;
};

// Resolves name from any possible field
export const getName = (user) =>
  user.displayName || user.name || user.fullName || user.username || "Unknown";

/* =======================================
   Give XP
======================================= */

export const giveXP = async ({ userId, amount, reason, ownerId }) => {
  await updateDoc(doc(db, "users", userId), {
    points: increment(Number(amount)),
  });

  await addDoc(collection(db, "rewardHistory"), {
    userId,
    type: "XP",
    amount: Number(amount),
    reason,
    ownerId,
    createdAt: serverTimestamp(),
  });
};

/* =======================================
   Give Gems
======================================= */

export const giveGems = async ({ userId, amount, reason, ownerId }) => {
  await updateDoc(doc(db, "users", userId), {
    gems: increment(Number(amount)),
  });

  await addDoc(collection(db, "rewardHistory"), {
    userId,
    type: "GEMS",
    amount: Number(amount),
    reason,
    ownerId,
    createdAt: serverTimestamp(),
  });
};

/* =======================================
   Reward History
======================================= */

export const listenRewardHistory = (callback) => {
  const q = query(
    collection(db, "rewardHistory"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  });
};

/* =======================================
   Compatibility Wrapper
======================================= */

export const awardPoints = async (userId, amount) => {
  try {
    await giveXP({
      userId,
      amount,
      reason: "Chat Activity",
      ownerId: "system",
    });
  } catch (error) {
    console.error("Error in awardPoints wrapper:", error);
  }
};