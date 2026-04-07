import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  saveActivity: (
    filename: string,
    inferenceTime: number,
    totalDetections: number,
    outputUrl: string,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null);
      })
      .catch((err) => console.error("Supabase getSession:", err))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      alert("Supabase is not configured.");
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(`Login failed: ${error.message}`);
      return false;
    }
    return true;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      alert("Supabase is not configured.");
      return false;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(`Signup failed: ${error.message}`);
      return false;
    }
    alert("Account created! Check your email if verification is required.");
    return true;
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) alert(`Logout failed: ${error.message}`);
  }, []);

  const saveActivity = useCallback(
    async (
      filename: string,
      inferenceTime: number,
      totalDetections: number,
      outputUrl: string,
    ) => {
      if (!supabase || !user) return;
      const { error } = await supabase.from("activity_history").insert([
        {
          user_id: user.id,
          filename,
          inference_time: inferenceTime,
          total_detections: totalDetections,
          output_url: outputUrl,
        },
      ]);
      if (error) console.error("Error saving activity:", error);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      saveActivity,
    }),
    [user, loading, login, signup, logout, saveActivity],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
