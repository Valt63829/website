import { db } from '../firebase/firestore';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Call this when user logs in
export const setUserOnline = async (userId) => {
  await updateDoc(doc(db, 'users', userId), {
    isOnline: true,
    lastSeen: serverTimestamp()
  });
};

// Call this when user logs out or closes tab
export const setUserOffline = async (userId) => {
  await updateDoc(doc(db, 'users', userId), {
    isOnline: false,
    lastSeen: serverTimestamp()
  });
};

// Listen to a specific user's status in real-time
export const listenToUserStatus = (userId, callback) => {
  return onSnapshot(doc(db, 'users', userId), (snap) => {
    if (snap.exists()) {
      callback({
        isOnline: snap.data().isOnline || false,
        lastSeen: snap.data().lastSeen
      });
    }
  });
};