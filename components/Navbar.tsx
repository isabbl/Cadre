"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, companyName, isAdmin } = useAuth();

  if (pathname === "/" || pathname.startsWith("/form/") || pathname.startsWith("/admin")) return null;

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-white tracking-tight">
          Cadre
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/dashboard"
            className={`transition-colors ${
              pathname === "/dashboard"
                ? "text-white font-medium"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Templates
          </Link>
          <Link
            href="/responses"
            className={`transition-colors ${
              pathname === "/responses"
                ? "text-white font-medium"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Respostas
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`transition-colors ${
                pathname === "/admin"
                  ? "text-white font-medium"
                  : "text-blue-400 hover:text-blue-300"
              }`}
            >
              Admin
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
              <span className="text-slate-400 text-xs hidden sm:block">
                {isAdmin ? "Admin" : (companyName || user.email)}
              </span>
              <button
                onClick={handleSignOut}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
