import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  logout as logoutApi,
  type CurrentUser,
} from "../api/auth";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CurrentUser | null>;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadUser() {

    try {

      const currentUser =
        await getCurrentUser();

      setUser(currentUser);

      return currentUser;

    } catch {

      setUser(null);

      return null;

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function logout() {

    try {

      await logoutApi();

    } finally {

      setUser(null);

    }
  }

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: user !== null,
    logout,
    refreshUser: loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}