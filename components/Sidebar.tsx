"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";

function IconTemplates() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconResponses() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H6l-4 3V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L9.5 5h3.5l-2.8 2 1 3.5L8 8.5 4.8 10.5l1-3.5L3 5h3.5L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3.5A1.5 1.5 0 002 3.5v9A1.5 1.5 0 003.5 14H6M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
};

function NavItem({ href, label, icon, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <span className={`flex-shrink-0 ${active ? "text-white" : "text-slate-500"}`}>{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, companyName, isAdmin } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const initial = (companyName || user?.email || "?")[0]?.toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-900 border-r border-white/5 flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/5">
        <span className="text-white font-bold text-lg tracking-tight">Cadre</span>
        {companyName && (
          <p className="text-slate-400 text-xs mt-0.5 truncate">{companyName}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">
          Navegação
        </p>
        <NavItem
          href="/dashboard"
          label="Templates"
          icon={<IconTemplates />}
          active={pathname === "/dashboard" || pathname.startsWith("/templates")}
        />
        <NavItem
          href="/responses"
          label="Respostas"
          icon={<IconResponses />}
          active={pathname === "/responses" || pathname.startsWith("/results")}
        />

        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">
              Sistema
            </p>
            <NavItem
              href="/admin"
              label="Admin"
              icon={<IconAdmin />}
              active={pathname.startsWith("/admin")}
            />
          </div>
        )}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-semibold flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-300 font-medium truncate leading-tight">
              {companyName || "Usuário"}
            </p>
            <p className="text-xs text-slate-500 truncate leading-tight">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
        >
          <IconLogout />
          Sair
        </button>
      </div>
    </aside>
  );
}
