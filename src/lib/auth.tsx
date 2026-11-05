import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onSessionChange, refreshSession, request, setSession, type Session } from "./api";
import type { User } from "./types";

type Status = "loading" | "signed-in" | "signed-out";

type SignupInput = { email: string; password: string; name: string; inviteCode?: string };

type AuthValue = {
  status: Status;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  replaceUser: (user: User) => void;
  /** For password changes, which return a new session. */
  adoptSession: (session: Session) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stop = onSessionChange((session) => {
      setUser(session ? session.user : null);
      setStatus(session ? "signed-in" : "signed-out");
    });
    refreshSession().then((session) => {
      if (!session) setStatus("signed-out");
    });
    return stop;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await request<Session>("/auth/login", { method: "POST", body: { email, password } });
    setSession(session);
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const session = await request<Session>("/auth/signup", { method: "POST", body: input });
    setSession(session);
  }, []);

  const logout = useCallback(async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      setSession(null);
    }
  }, []);

  const replaceUser = useCallback((next: User) => setUser(next), []);
  const adoptSession = useCallback((session: Session) => setSession(session), []);

  const value = useMemo(
    () => ({ status, user, login, signup, logout, replaceUser, adoptSession }),
    [status, user, login, signup, logout, replaceUser, adoptSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
