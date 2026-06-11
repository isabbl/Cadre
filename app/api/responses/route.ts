import { NextResponse } from "next/server";
import { addDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("templateId");

    const col = collection(db, "responses");
    const q = templateId
      ? query(col, where("templateId", "==", templateId))
      : query(col, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    const responses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Erro ao buscar respostas:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newResponse = {
      templateId: body.templateId || "",
      answers: body.answers || {},
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "responses"), newResponse);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
