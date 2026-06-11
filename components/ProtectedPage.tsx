"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, suspended, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Carregando...</p>
      </div>
    );
  }

  if (suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-lg font-bold text-slate-900">Conta suspensa</h1>
          <p className="text-slate-500 text-sm mt-2">
            O acesso desta empresa foi temporariamente suspenso. Entre em contato com o suporte.
          </p>
          <button
            onClick={() => signOut(auth).then(() => router.push("/"))}
            className="mt-6 text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
