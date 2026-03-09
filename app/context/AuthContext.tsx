// app/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../FirebaseConfig";
import {
  getUserProfile,
  upsertUserProfile,
  UserProfile,
} from "../Services/rtdb";

type AuthContextType = {
  firebaseUser: User | null;
  appUser: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (user: User) => {
    const profile = await getUserProfile(user.uid);

    const next: UserProfile = profile ?? {
      uid: user.uid,
      email: user.email ?? null,
      name: user.displayName ?? "",
      role: "user",
    };

    await upsertUserProfile(next);
    setAppUser(next);
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
      try {
        await loadProfile(u);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      await loadProfile(firebaseUser);
    } finally {
      setLoading(false);
    }
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
