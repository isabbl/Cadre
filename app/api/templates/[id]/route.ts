import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const ref = doc(db, "templates", id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Template não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
  } catch (error) {
    console.error("Erro ao buscar template:", error);
    return NextResponse.json(
      { error: "Erro ao buscar template" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const ref = doc(db, "templates", id);
    await updateDoc(ref, {
      title: body.title || "",
      description: body.description || "",
      content: body.content || "",
      variables: body.variables || [],
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar template:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar template" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const ref = doc(db, "templates", id);
    await deleteDoc(ref);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir template:", error);
    return NextResponse.json(
      { error: "Erro ao excluir template" },
      { status: 500 }
    );
  }
}
