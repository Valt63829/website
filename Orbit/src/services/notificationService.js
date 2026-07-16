import { db } from '../firebase/firestore';
import { 
  collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, getDocs 
} from 'firebase/firestore';

// 1. Listen to User's Notification Feed
export const listenToNotifications = (uid, callback) => {
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notifs);
  });
};

// 2. Mark a notification as read
export const markNotifAsRead = async (uid, notifId) => {
  const ref = doc(db, 'users', uid, 'notifications', notifId);
  await updateDoc(ref, { read: true });
};

// 3. Mark ALL notifications as read
export const markAllNotifsAsRead = async (uid) => {
  const q = query(collection(db, 'users', uid, 'notifications'));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach(doc => {
    if (!doc.data().read) batch.update(doc.ref, { read: true });
  });
  await batch.commit();
};

// ─── Notification Creators (Called from other services) ─────────

export const createNotification = async (toUid, notifData) => {
  await addDoc(collection(db, 'users', toUid, 'notifications'), {
    ...notifData,
    timestamp: serverTimestamp(),
    read: false
  });
};