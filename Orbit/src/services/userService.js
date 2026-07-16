import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { auth } from "../firebase/auth";

/* ==================================
   USER LOOKUP
================================== */

export const getUserById = async (uid) => {
  try {
    const snap = await getDoc(
      doc(db, "users", uid)
    );

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data(),
    };
  } catch (error) {
    console.error(
      "getUserById error:",
      error
    );
    return null;
  }
};

export const getUserByEmail =
  async (email) => {
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", email)
      );

      const snap = await getDocs(q);

      if (snap.empty) return null;

      return {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      };
    } catch (error) {
      console.error(
        "getUserByEmail error:",
        error
      );
      return null;
    }
  };

/* ==================================
   ONLINE STATUS
================================== */

export const setUserOnline =
  async (userId) => {
    try {
      if (!userId) return;

      const userRef = doc(
        db,
        "users",
        userId
      );

      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        // Use merge:true so we never overwrite fields like orbitId
        // if the registration setDoc races and runs after this
        await setDoc(userRef, {
          uid: userId,
          role: "user",
          banned: false,
          isOnline: true,
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true });

        console.log(
          "Created missing user document"
        );
      } else {
        await updateDoc(userRef, {
          isOnline: true,
          lastSeen: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(
        "setUserOnline error:",
        error
      );
    }
  };

export const setUserOffline =
  async (userId) => {
    try {
      if (!userId) return;

      const userRef = doc(
        db,
        "users",
        userId
      );

      const snap = await getDoc(userRef);

      if (!snap.exists()) return;

      await updateDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error(
        "setUserOffline error:",
        error
      );
    }
  };

export const updateHeartbeat =
  async (userId) => {
    try {
      if (!userId) return;

      const userRef = doc(
        db,
        "users",
        userId
      );

      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        return;
      }

      await updateDoc(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error(
        "updateHeartbeat error:",
        error
      );
    }
  };

/* ==================================
   REALTIME USER LISTENER
================================== */

export const listenToUser = (
  uid,
  callback
) => {
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snap.id,
        ...snap.data(),
      });
    },
    (error) => {
      console.error(
        "listenToUser error:",
        error
      );
    }
  );
};

export const listenToUserStatus = (userId, callback) => {
  return onSnapshot(
    doc(db, "users", userId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({
          isOnline: false,
          lastSeen: null,
        });
        return;
      }

      const data = snapshot.data();

      callback({
        isOnline: data.isOnline ?? false,
        lastSeen: data.lastSeen ?? null,
      });
    },
    (error) => {
      console.error("listenToUserStatus:", error);
    }
  );
};

/* ==================================
   REALTIME USERS
================================== */

export const listenToUsers = (
  callback
) => {
  if (!auth.currentUser) {
    console.log(
      "listenToUsers skipped: not authenticated"
    );
    return () => { };
  }

  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const users = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      callback(users);
    },
    (error) => {
      console.error(
        "listenToUsers error:",
        error
      );
    }
  );
};

export const updateUserProfile = async (
  userId,
  data
) => {
  try {
    await updateDoc(
      doc(db, "users", userId),
      {
        ...data,
        updatedAt: serverTimestamp(),
      }
    );

    return true;
  } catch (error) {
    console.error(
      "updateUserProfile error:",
      error
    );
    throw error;
  }
};