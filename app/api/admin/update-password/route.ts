import { NextResponse } from "next/server";

// Rota desativada — alteração de senha feita diretamente via secondaryAuth no cliente
export async function POST() {
  return NextResponse.json({ error: "Não implementado." }, { status: 501 });
}
