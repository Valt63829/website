import { db } from '../firebase/firestore';
import {
  collection, query, orderBy,
  startAt, endAt, onSnapshot
} from 'firebase/firestore';

// Real-time search for Users (by Name OR Orbit ID)
export const searchUsers = (searchTerm, callback) => {
  const usersRef = collection(db, 'users');

  // Query 1: Search by Name
  const q1 = query(
    usersRef,
    orderBy('name'),
    startAt(searchTerm),
    endAt(searchTerm + '\uf8ff')
  );

  // Query 2: Search by Orbit ID (converted to uppercase for consistency)
  const q2 = query(
    usersRef,
    orderBy('orbitId'),
    startAt(searchTerm.toUpperCase()),
    endAt(searchTerm.toUpperCase() + '\uf8ff')
  );

  let resultsMap = new Map(); // Prevents duplicate users if they match both queries

  const unsub1 = onSnapshot(q1, (snapshot1) => {
    snapshot1.docs.forEach(doc => resultsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    callback(Array.from(resultsMap.values()));
  });

  const unsub2 = onSnapshot(q2, (snapshot2) => {
    snapshot2.docs.forEach(doc => resultsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    callback(Array.from(resultsMap.values()));
  });

  return () => {
    unsub1();
    unsub2();
  };
};

// Real-time search for Communities (Spaces)
export const searchCommunities = (searchTerm, callback) => {
  const q = query(
    collection(db, 'communities'),
    orderBy('name'),
    startAt(searchTerm),
    endAt(searchTerm + '\uf8ff')
  );

  return onSnapshot(q, (snapshot) => {
    const communities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(communities);
  });
};

// Real-time search for Events
export const searchEvents = (searchTerm, callback) => {
  const q = query(
    collection(db, 'events'),
    orderBy('name'),
    startAt(searchTerm),
    endAt(searchTerm + '\uf8ff')
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(events);
  });
};