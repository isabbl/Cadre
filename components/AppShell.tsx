"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const publicRoutes = ["/", /^\/form\//, /^\/admin/];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = publicRoutes.some((r) =>
    typeof r === "string" ? pathname === r : r.test(pathname)
  );

  if (isPublic) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">{children}</main>
    </div>
  );
}
