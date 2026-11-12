import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onSessionChange, refreshSession, request, setSession, type Session } from "./api";
import { useLang } from "./i18n";
import type { Profile, User } from "./types";

/*
 * Who is signed in, and their Student Intelligence Profile.
 *
 * `status` says where to send the student: to the welcome screen (signed-out),
 * to onboarding (signed-in but the profile is not finished), or home.
 */

type Status = "loading" | "signed-out" | "signed-in";

/** Profile fields to save. Onboarding can be marked finished, never unfinished. */
export type ProfileChanges = Partial<Omit<Profile, "onboarded">> & { onboarded?: true };

type AuthValue = {
  status: Status;
  user: User | null;
  /** null only while it is still loading after sign-in. */
  profile: Profile | null;
  /** The profile could not be loaded (no connection): offer to try again. */
  profileFailed: boolean;
  reloadProfile: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { email: string; password: string; name: string; inviteCode?: string }) => Promise<void>;
  logout: () => Promise<void>;
  /** Saves the given profile fields and returns the saved profile. */
  saveProfile: (changes: ProfileChanges) => Promise<Profile>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const client = useQueryClient();
  const { setLang } = useLang();
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    const stop = onSessionChange((session) => {
      setUser(session ? session.user : null);
      setStatus(session ? "signed-in" : "signed-out");
      if (!session) {
        loadedFor.current = null;
        setProfile(null);
      }
    });
    refreshSession().then((session) => {
      if (!session) setStatus("signed-out");
    });
    return stop;
  }, []);

  const [profileFailed, setProfileFailed] = useState(false);
  const loadProfile = useCallback(() => {
    setProfileFailed(false);
    request<{ profile: Profile }>("/profile")
      .then((res) => {
        setProfile(res.profile);
        if (res.profile.uiLanguage) setLang(res.profile.uiLanguage);
      })
      // Left null: the app shows a retry rather than guessing whether onboarding is done.
      .catch(() => setProfileFailed(true));
  }, [setLang]);

  // The profile follows the account: loaded once per sign-in.
  useEffect(() => {
    if (!user || loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    loadProfile();
  }, [user, loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setSession(await request<Session>("/auth/login", { method: "POST", body: { email, password } }));
  }, []);

  const signup = useCallback(async (input: { email: string; password: string; name: string; inviteCode?: string }) => {
    setSession(await request<Session>("/auth/signup", { method: "POST", body: input }));
  }, []);

  const logout = useCallback(async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      // One student's courses and notes must never show for the next person on this device.
      client.clear();
      setSession(null);
    }
  }, [client]);

  const saveProfile = useCallback(async (changes: ProfileChanges) => {
    const res = await request<{ profile: Profile }>("/profile", { method: "PATCH", body: changes });
    setProfile(res.profile);
    return res.profile;
  }, []);

  const value = useMemo(
    () => ({ status, user, profile, profileFailed, reloadProfile: loadProfile, login, signup, logout, saveProfile }),
    [status, user, profile, profileFailed, loadProfile, login, signup, logout, saveProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
