import { db } from '../firebase/firestore';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, getDoc,
  query, orderBy, serverTimestamp, arrayUnion, arrayRemove, increment
} from 'firebase/firestore';

// ─── Cloudinary Config ────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'dji1doaee'; // ⚠️ REPLACE WITH YOUR CLOUD NAME
const CLOUDINARY_UPLOAD_PRESET = 'orbit_profile';

// 1. Upload Space Avatar/Cover to Cloudinary
export const uploadSpaceImage = async (uid, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `space_images/${uid}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary Error:", data);
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Error uploading space image:", error);
    throw error;
  }
};

// 2. Listen to all public Spaces (Sorted by popularity)
export const listenToSpaces = (callback) => {
  const q = query(collection(db, 'spaces'), orderBy('memberCount', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const spaces = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(spaces);
  });
};

// 3. Create a new Space
export const createSpace = async (uid, name, description, avatarUrl) => {
  const spaceRef = await addDoc(collection(db, 'spaces'), {
    name,
    description,
    avatar: avatarUrl || null,
    createdBy: uid,
    members: [uid],
    memberCount: 1,
    featured: false, // ✅ Default to not featured
    createdAt: serverTimestamp()
  });

  // Create a default #general channel inside the space
  await addDoc(collection(db, 'spaces', spaceRef.id, 'channels'), {
    name: 'general',
    description: 'General discussion',
    createdAt: serverTimestamp()
  });

  return spaceRef.id;
};

// 4. Join a Space
export const joinSpace = async (spaceId, uid) => {
  const spaceRef = doc(db, 'spaces', spaceId);
  await updateDoc(spaceRef, {
    members: arrayUnion(uid),
    memberCount: increment(1)
  });
};

// 5. Leave a Space
export const leaveSpace = async (spaceId, uid) => {
  const spaceRef = doc(db, 'spaces', spaceId);
  await updateDoc(spaceRef, {
    members: arrayRemove(uid),
    memberCount: increment(-1)
  });
};

// 6. Delete a Space (Owner action)
export const deleteSpace = async (spaceId) => {
  await deleteDoc(doc(db, 'spaces', spaceId));
};

// 7. Get Space Data Once (Without realtime listener)
export const getSpaceById = async (spaceId) => {
  const spaceRef = doc(db, 'spaces', spaceId);
  const snap = await getDoc(spaceRef);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
};

// 8. Toggle Featured Status (Connects to CommunityManagement.jsx)
export const toggleFeaturedSpace = async (spaceId, isCurrentlyFeatured) => {
  const spaceRef = doc(db, 'spaces', spaceId);
  await updateDoc(spaceRef, {
    featured: !isCurrentlyFeatured
  });
};

// 9. Listen to a single Space's data (For chat header updates)
export const listenToSpace = (spaceId, callback) => {
  const spaceRef = doc(db, 'spaces', spaceId);
  return onSnapshot(spaceRef, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

// 10. Listen to Group Chat Messages
export const listenToSpaceMessages = (spaceId, callback) => {
  const messagesRef = collection(db, 'spaces', spaceId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// 11. Upload Chat Image to Cloudinary
export const uploadSpaceChatImage = async (uid, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `space_chats/${uid}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary Error:", data);
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Error uploading chat image:", error);
    throw error;
  }
};

// 12. Send a Message (Text OR Image) to Space Chat
export const sendSpaceMessage = async (spaceId, senderId, text, imageUrl = null) => {
  const messagesRef = collection(db, 'spaces', spaceId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text: text || "",
    imageUrl: imageUrl || null,
    timestamp: serverTimestamp()
  });
};
// 13. Edit a Message
export const updateSpaceMessage = async (spaceId, messageId, newText) => {
  const msgRef = doc(db, 'spaces', spaceId, 'messages', messageId);
  await updateDoc(msgRef, {
    text: newText,
    edited: true // Flag to show "Edited" tag in UI
  });
};

// 14. Delete a Message
export const deleteSpaceMessage = async (spaceId, messageId) => {
  await deleteDoc(doc(db, 'spaces', spaceId, 'messages', messageId));
};

// 15. Pin/Unpin a Message
export const togglePinMessage = async (spaceId, messageId, isCurrentlyPinned) => {
  const msgRef = doc(db, 'spaces', spaceId, 'messages', messageId);
  await updateDoc(msgRef, {
    pinned: !isCurrentlyPinned,
    pinnedAt: !isCurrentlyPinned ? serverTimestamp() : null
  });
};