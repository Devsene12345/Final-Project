// app/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "..//FirebaseConfig";

type Role = "user" | "admin";

type AppUser = {
  uid: string;
  email: string | null;
  name?: string;
  role: Role;
};

type AuthContextType = {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (user: User) => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // create default profile if missing
      await setDoc(ref, {
        uid: user.uid,
        email: user.email ?? null,
        name: user.displayName ?? "",
        role: "user",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      setAppUser({
        uid: user.uid,
        email: user.email ?? null,
        name: user.displayName ?? "",
        role: "user",
      });
      return;
    }

    const data = snap.data() as any;

    // update lastLoginAt
    try {
      await updateDoc(ref, { lastLoginAt: serverTimestamp() });
    } catch {}

    setAppUser({
      uid: user.uid,
      email: user.email ?? null,
      name: data?.name ?? user.displayName ?? "",
      role: (data?.role as Role) ?? "user",
    });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (!u) {
        setAppUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      await loadProfile(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    await loadProfile(firebaseUser);
    setLoading(false);
  };

  const logout = async () => {
    await auth.signOut();
  };

  const value = useMemo<AuthContextType>(
    () => ({
      firebaseUser,
      appUser,
      loading,
      refreshProfile,
      logout,
      isAdmin: appUser?.role === "admin",
    }),
    [firebaseUser, appUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
