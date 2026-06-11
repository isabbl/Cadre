import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const templates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newTemplate = {
      title: body.title || "",
      description: body.description || "",
      content: body.content || "",
      variables: body.variables || [],
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "templates"), newTemplate);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao criar template:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar template" },
      { status: 500 }
    );
  }
}
