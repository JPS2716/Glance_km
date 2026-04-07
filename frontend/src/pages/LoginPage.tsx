import { GlobeSection } from "@/components/GlobeSection";
import { useAuth } from "@/contexts/AuthContext";
import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
  const { user, login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (!loading && user) navigate("/upload", { replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    if (mode === "login") {
      const ok = await login(email, password);
      if (ok) navigate("/upload");
    } else {
      const ok = await signup(email, password);
      if (ok) navigate("/upload");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-6 selection:bg-primary/30">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#a2c9ff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <Link
        to="/"
        className="absolute left-8 top-8 flex items-center gap-2 font-medium text-on-surface transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Home
      </Link>

      <div className="z-10 w-full max-w-md rounded-3xl border border-outline-variant/10 bg-surface-container/60 p-10 shadow-[0_0_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-surface-container-highest shadow-xl">
            <span className="material-symbols-outlined text-3xl text-primary">lock</span>
          </div>
          <h1 className="mb-2 font-headline text-3xl font-black tracking-tighter text-on-surface">
            {mode === "login" ? "Welcome Back" : "Join Glance"}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {mode === "login"
              ? "Sign in to sync your intelligent analysis vault."
              : "Establish access to the neural network."}
          </p>
        </div>

        <div className="mb-8 flex rounded-xl border border-outline-variant/5 bg-surface-container-lowest p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
              mode === "login"
                ? "bg-surface-container text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
              mode === "signup"
                ? "bg-surface-container text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => setMode("signup")}
          >
            Create Account
          </button>
        </div>

        <form className="space-y-6" onSubmit={(e) => void onSubmit(e)}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Email Address
            </label>
            <input
              name="email"
              required
              type="email"
              placeholder="Identifier"
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-outline-variant transition-all hover:bg-surface-container-highest/30 focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Password
            </label>
            <input
              name="password"
              required
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-outline-variant transition-all hover:bg-surface-container-highest/30 focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <button
            type="submit"
            className="editorial-gradient mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 py-4 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[0.98] hover:opacity-90"
          >
            {mode === "login" ? (
              <>
                Sign In
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            ) : (
              <>
                Create Account
                <span className="material-symbols-outlined text-sm">person_add</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-16 w-full max-w-4xl">
        <GlobeSection className="rounded-t-3xl border border-outline-variant/10" />
      </div>
    </div>
  );
}
