"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db } from "@/lib/instant";

export interface User {
  id: string;
  email: string;
  createdAt?: number;
  displayName?: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  authError: string | null;
  sendMagicCode: (email: string) => Promise<void>;
  signInWithMagicCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Use InstantDB's built-in auth hook
  const { user: instantUser, isLoading, error } = db.useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Query user record to check isWhitelisted
  const userQuery = db.useQuery(
    instantUser
      ? {
          $users: {
            $: {
              where: {
                id: instantUser.id,
              },
            },
          },
        }
      : null
  );

  // Check if user is whitelisted
  useEffect(() => {
    if (!instantUser) {
      setUser(null);
      setAuthError(null);
      return;
    }

    // Wait for user query to load
    if (userQuery.isLoading) {
      return;
    }

    // Check if user record exists and is whitelisted
    const userRecord = userQuery.data?.$users?.[0];

    if (!userRecord?.isWhitelisted) {
      // Sign out unauthorized user immediately
      db.auth.signOut();
      setUser(null);
      setAuthError(
        "Access denied. Your account has not been approved. Please contact an administrator."
      );
      return;
    }

    // User is whitelisted
    const userData: User = {
      id: instantUser.id,
      email: instantUser.email,
      createdAt: Date.now(),
    };
    setUser(userData);
    setAuthError(null);
  }, [instantUser, isLoading, userQuery.isLoading, userQuery.data]);

  // Handle auth errors
  useEffect(() => {
    if (error) {
      setAuthError(error.message || "Authentication error occurred");
    }
  }, [error]);

  const sendMagicCode = async (email: string) => {
    try {
      setAuthError(null);
      await db.auth.sendMagicCode({ email });
    } catch (err: any) {
      setAuthError(err.message || "Failed to send magic code");
      throw err;
    }
  };

  const signInWithMagicCode = async (email: string, code: string) => {
    try {
      setAuthError(null);
      await db.auth.signInWithMagicCode({ email, code });
      // The whitelist check will happen in the useEffect hook
    } catch (err: any) {
      setAuthError(err.message || "Invalid verification code");
      throw err;
    }
  };

  const logout = async () => {
    try {
      db.auth.signOut();
      setUser(null);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || "Failed to log out");
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        authError,
        sendMagicCode,
        signInWithMagicCode,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
