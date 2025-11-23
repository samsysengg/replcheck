import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { getCurrentUser, setCurrentUser as saveCurrentUser, removeCurrentUser, setAuthToken, removeAuthToken } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (token: string, userData: User) => {
    setAuthToken(token);
    saveCurrentUser(userData);
    setUser(userData);
  };

  const logout = () => {
    removeAuthToken();
    removeCurrentUser();
    setUser(null);
  };

  const updateUser = (userData: User) => {
    saveCurrentUser(userData);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
