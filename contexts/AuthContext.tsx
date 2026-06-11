"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  companyId: string | null;
  companyName: string | null;
  isAdmin: boolean;
  suspended: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  companyId: null,
  companyName: null,
  isAdmin: false,
  suspended: false,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setIsAdmin(data.isAdmin === true);

            if (data.companyId) {
              const companyDoc = await getDoc(doc(db, "companies", data.companyId));
              if (companyDoc.exists()) {
                const company = companyDoc.data();
                if (company.active === false) {
                  setSuspended(true);
                } else {
                  setCompanyId(data.companyId);
                  setCompanyName(company.name as string);
                }
              }
            }
          }
        } catch {
          // ignora erros de perfil
        }
      } else {
        setCompanyId(null);
        setCompanyName(null);
        setIsAdmin(false);
        setSuspended(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, companyId, companyName, isAdmin, suspended, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
