import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

const navItem = (active: boolean) =>
  active
    ? "nav-link border-b border-primary/30 pb-1 text-sm font-semibold text-primary transition-all duration-300"
    : "nav-link border-b border-transparent pb-1 text-sm text-[#acabaa] transition-all duration-300 hover:text-[#e7e5e5]";

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const is = (p: string) => pathname === p;

  return (
    <header className="fixed top-0 z-50 w-full bg-[#0e0e0e]/70 shadow-[0_1px_0_0_rgba(72,72,72,0.15)] backdrop-blur-3xl">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-12 py-6">
        <Link
          to="/"
          className="text-xl font-black tracking-tighter text-[#e7e5e5] transition-colors hover:text-primary"
        >
          Glance
        </Link>
        <div className="hidden items-center space-x-8 font-medium md:flex">
          <Link to="/" className={navItem(is("/"))}>
            Home
          </Link>
          <Link to="/upload" className={navItem(is("/upload"))}>
            Upload
          </Link>
          <Link to="/history" className={navItem(is("/history"))}>
            History
          </Link>
          <Link to={{ pathname: "/", hash: "contact-section" }} className={navItem(false)}>
            Contact
          </Link>
          <Link to={{ pathname: "/", hash: "globe-section" }} className={navItem(false)}>
            Globe
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {!user ? (
            <Link
              to="/login"
              className="text-sm font-semibold text-on-surface transition-colors hover:text-primary"
            >
              Login / Signup
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/20"
            >
              <span className="material-symbols-outlined align-middle text-sm">logout</span> Logout
            </button>
          )}
          <Link
            to="/upload"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary transition-all duration-200 ease-out hover:scale-95 hover:bg-primary-dim hover:shadow-[0_0_20px_rgba(162,201,255,0.4)]"
          >
            Launch Analysis
          </Link>
        </div>
      </nav>
    </header>
  );
}
