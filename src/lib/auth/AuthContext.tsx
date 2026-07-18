"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { User } from "../../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  logout: async () => {},
  updateName: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch custom user data from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // If this is a new user via Google Sign In, create a default profile
          const newUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "Citizen",
            email: firebaseUser.email || "",
            role: "citizen",
            createdAt: new Date(),
          };
          await setDoc(userDocRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with email/password", error);
      throw error;
    }
  };

  const updateName = async (newName: string) => {
    if (!auth.currentUser || !user) return;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { name: newName });
      setUser({ ...user, name: newName });
    } catch (error) {
      console.error("Error updating name", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  );
};
