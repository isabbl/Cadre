"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/contexts/AuthContext";
import { getTemplate, getResponses } from "@/lib/firestore";

type Variable = { name: string; type: string };
type Template = { id: string; title: string; content: string; variables: Variable[] };
type ResponseItem = {
  id: string;
  templateId: string;
  answers: Record<string, string>;
  createdAt: string;
};

function fillTemplate(content: string, answers: Record<string, string>): string {
  return content.replace(/\{\{(.*?)\}\}/g, (_, key) => answers[key.trim()] ?? `{{${key.trim()}}}`);
}

export default function ResultsPage() {
  const params = useParams();
  const id = String(params.id);
  const { companyId } = useAuth();

  const [template, setTemplate] = useState<Template | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewingDoc, setViewingDoc] = useState<ResponseItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    async function load() {
      try {
        const [t, r] = await Promise.all([
          getTemplate(id),
          getResponses(companyId!, id),
        ]);
        setTemplate((t as Template) || null);
        setResponses((r as ResponseItem[]) || []);
      } catch {
        // mantém estado vazio
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, companyId]);

  const filtered = responses.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );

  function handleCopy(r: ResponseItem) {
    if (!template?.content) return;
    const text = fillTemplate(template.content, r.answers);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint(r: ResponseItem) {
    if (!template?.content) return;
    const filled = fillTemplate(template.content, r.answers);
    const el = document.getElementById("doc-print");
    if (el) {
      el.innerText = filled;
      window.print();
    }
  }

  return (
    <ProtectedPage>
      {/* Área invisível usada apenas na impressão */}
      <div id="doc-print" style={{ display: "none" }} />

      {/* Modal do documento */}
      {viewingDoc && template?.content && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => setViewingDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">{template.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {viewingDoc.createdAt ? new Date(viewingDoc.createdAt).toLocaleString("pt-BR") : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(viewingDoc)}
                  className="text-xs border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? "Copiado!" : "Copiar texto"}
                </button>
                <button
                  onClick={() => handlePrint(viewingDoc)}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Exportar PDF
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="text-slate-400 hover:text-slate-700 ml-1 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-8 py-6">
              <div className="font-serif text-slate-800 text-sm leading-relaxed whitespace-pre-wrap border border-slate-100 rounded-xl bg-slate-50 p-6 min-h-[200px]">
                {fillTemplate(template.content, viewingDoc.answers)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">← Dashboard</Link>
          <span className="text-slate-300">/</span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{template?.title || "Respostas"}</h1>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {responses.length} {responses.length === 1 ? "resposta recebida" : "respostas recebidas"}
          </p>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {loading && (
          <div className="text-slate-400 text-sm text-center py-16">Carregando...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500 text-sm">Nenhuma resposta encontrada.</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {filtered.map((r, index) => (
            <div key={r.id || index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                <span className="text-xs font-mono text-slate-400">#{r.id?.slice(0, 8)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString("pt-BR") : ""}
                  </span>
                  {template?.content && (
                    <button
                      onClick={() => setViewingDoc(r)}
                      className="text-xs bg-slate-900 hover:bg-slate-700 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                      Ver documento
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(r.answers || {}).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="text-slate-500 font-medium min-w-[140px]">{key}:</span>
                    <span className="text-slate-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedPage>
  );
}
