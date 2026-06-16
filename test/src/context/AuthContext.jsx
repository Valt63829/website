import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Guest");
  const [avatarLetter, setAvatarLetter] = useState("G");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // ✅ CASE 1: Google user (has displayName)
        if (firebaseUser.displayName) {
          setUserName(firebaseUser.displayName);
          setAvatarLetter(firebaseUser.displayName.charAt(0).toUpperCase());
        }

        // ✅ CASE 2: Email login (NO displayName)
        else if (firebaseUser.email) {
          const emailName = firebaseUser.email.split("@")[0];

          setUserName(emailName);
          setAvatarLetter(emailName.charAt(0).toUpperCase());
        }

      } else {
        setUser(null);
        setUserName("Guest");
        setAvatarLetter("G");
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userName, avatarLetter, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);