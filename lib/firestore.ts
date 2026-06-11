import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// ---- Admin: Companies ----

export async function getCompany(id: string) {
  const snap = await getDoc(doc(db, "companies", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getCompanies() {
  const snap = await getDocs(collection(db, "companies"));
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return (data as any[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateCompany(id: string, name: string) {
  return updateDoc(doc(db, "companies", id), { name });
}

export async function updateCompanyPassword(id: string, newPassword: string) {
  return updateDoc(doc(db, "companies", id), { password: newPassword });
}

export async function toggleCompanyActive(id: string, active: boolean) {
  return updateDoc(doc(db, "companies", id), { active });
}

export async function deleteCompanyAndUser(companyId: string) {
  const q = query(collection(db, "users"), where("companyId", "==", companyId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "companies", companyId));
}

export async function createCompanyAndUser(
  uid: string,
  email: string,
  companyName: string,
  password: string
) {
  const companyRef = await addDoc(collection(db, "companies"), {
    name: companyName,
    email,
    password,
    createdAt: new Date().toISOString(),
  });

  await setDoc(doc(db, "users", uid), {
    email,
    companyId: companyRef.id,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  });

  return companyRef.id;
}

// ---- Templates ----

export async function getTemplates(companyId: string) {
  const q = query(
    collection(db, "templates"),
    where("companyId", "==", companyId)
  );
  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return (data as any[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getTemplate(id: string) {
  const snap = await getDoc(doc(db, "templates", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createTemplate(
  companyId: string,
  data: {
    title: string;
    description: string;
    content: string;
    variables: { name: string; type: string; optional?: boolean }[];
  }
) {
  return addDoc(collection(db, "templates"), {
    ...data,
    companyId,
    createdAt: new Date().toISOString(),
  });
}

export async function updateTemplate(
  id: string,
  data: {
    title: string;
    description: string;
    content: string;
    variables: { name: string; type: string; optional?: boolean }[];
  }
) {
  return updateDoc(doc(db, "templates", id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeTemplate(id: string) {
  return deleteDoc(doc(db, "templates", id));
}

// ---- Responses ----

export async function getResponses(companyId: string, templateId?: string) {
  const q = templateId
    ? query(collection(db, "responses"), where("templateId", "==", templateId))
    : query(collection(db, "responses"), where("companyId", "==", companyId));

  const snap = await getDocs(q);
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return (data as any[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createResponse(data: {
  templateId: string;
  companyId: string;
  answers: Record<string, string>;
}) {
  return addDoc(collection(db, "responses"), {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

export async function deleteResponse(id: string) {
  return deleteDoc(doc(db, "responses", id));
}
