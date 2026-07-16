import { db } from '../firebase/firestore';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { createNotification } from './notificationService';

// 1. Send a Friend Request
export const sendFriendRequest = async (senderUid, receiverUid) => {
  const q = query(
    collection(db, 'friend_requests'),
    where('from', '==', senderUid),
    where('to', '==', receiverUid)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) return;

  await addDoc(collection(db, 'friend_requests'), {
    from: senderUid,
    to: receiverUid,
    status: 'pending',
    timestamp: serverTimestamp()
  });

  // Send notification
  const senderDoc = await getDoc(doc(db, 'users', senderUid));
  const senderData = senderDoc.exists() ? senderDoc.data() : {};

  await createNotification(receiverUid, {
    type: 'friend_request',
    fromUserId: senderUid,
    title: `${senderData.name || 'Someone'} wants to connect`,
    actionUrl: '/notifications'
  });
};

// 2. Listen to Incoming Friend Requests
export const listenToIncomingRequests = (uid, callback) => {
  const q = query(
    collection(db, 'friend_requests'),
    where('to', '==', uid),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, async (snapshot) => {
    const requests = await Promise.all(
      snapshot.docs.map(async (requestDoc) => {
        const data = requestDoc.data();

        let senderData = null;

        try {
          const senderDoc = await getDoc(doc(db, 'users', data.from));

          if (senderDoc.exists()) {
            senderData = {
              uid: senderDoc.id,
              ...senderDoc.data()
            };
          }
        } catch (error) {
          console.error('Error fetching sender data:', error);
        }

        return {
          id: requestDoc.id,
          ...data,
          sender: senderData
        };
      })
    );

    callback(requests);
  });
};

// 3. Accept a Friend Request
export const acceptFriendRequest = async (
  requestId,
  senderUid,
  receiverUid
) => {
  const reqRef = doc(db, 'friend_requests', requestId);

  await updateDoc(reqRef, {
    status: 'accepted'
  });

  const senderRef = doc(db, 'users', senderUid);
  const receiverRef = doc(db, 'users', receiverUid);

  await updateDoc(senderRef, {
    friends: arrayUnion(receiverUid)
  });

  await updateDoc(receiverRef, {
    friends: arrayUnion(senderUid)
  });

  // Send notification to original sender
  const receiverDoc = await getDoc(receiverRef);
  const receiverData = receiverDoc.exists()
    ? receiverDoc.data()
    : {};

  await createNotification(senderUid, {
    type: 'friend_accepted',
    fromUserId: receiverUid,
    title: `${receiverData.name || 'User'} accepted your request!`,
    subtitle: 'You are now friends. Say hi!',
    actionUrl: '/chats'
  });
};

// 4. Decline a Friend Request
export const declineFriendRequest = async (requestId) => {
  await deleteDoc(doc(db, 'friend_requests', requestId));
};

// 5. Listen to User's Friends List
export const listenToFriendsList = (uid, callback) => {
  const userRef = doc(db, 'users', uid);

  return onSnapshot(userRef, async (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    const friendUids = [...new Set(snap.data().friends || [])];

    if (friendUids.length === 0) {
      callback([]);
      return;
    }

    const friendsData = await Promise.all(
      friendUids.map(async (friendUid) => {
        const friendDoc = await getDoc(
          doc(db, 'users', friendUid)
        );

        if (!friendDoc.exists()) return null;

        return {
          uid: friendDoc.id,
          ...friendDoc.data()
        };
      })
    );

    callback(friendsData.filter(Boolean));
  });
};