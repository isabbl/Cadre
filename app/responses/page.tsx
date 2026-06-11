"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/contexts/AuthContext";
import { getResponses, getTemplates } from "@/lib/firestore";

type ResponseItem = {
  id: string;
  templateId: string;
  answers: Record<string, string>;
  createdAt: string;
};

type Template = { id: string; title: string; content: string };

function fillTemplate(content: string, answers: Record<string, string>): string {
  return content.replace(/\{\{(.*?)\}\}/g, (_, key) => answers[key.trim()] ?? `{{${key.trim()}}}`);
}

export default function ResponsesPage() {
  const { companyId } = useAuth();
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [templateMap, setTemplateMap] = useState<Record<string, Template>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    async function load() {
      try {
        const [r, t] = await Promise.all([
          getResponses(companyId!),
          getTemplates(companyId!),
        ]);
        const map: Record<string, Template> = {};
        for (const tpl of t as Template[]) map[tpl.id] = tpl;
        setResponses(r as ResponseItem[]);
        setTemplateMap(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companyId]);

  const filtered = responses.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );

  function handleCopy(r: ResponseItem) {
    const tpl = templateMap[r.templateId];
    if (!tpl?.content) return;
    navigator.clipboard.writeText(fillTemplate(tpl.content, r.answers));
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handlePrint(r: ResponseItem) {
    const tpl = templateMap[r.templateId];
    if (!tpl?.content) return;
    const el = document.getElementById("doc-print");
    if (el) {
      el.innerText = fillTemplate(tpl.content, r.answers);
      window.print();
    }
  }

  return (
    <ProtectedPage>
      {/* Área invisível usada só na impressão */}
      <div id="doc-print" style={{ display: "none" }} />

      <div className="px-8 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Respostas</h1>
            <p className="text-slate-500 text-sm mt-1">
              {responses.length} {responses.length === 1 ? "resposta recebida" : "respostas recebidas"}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            width="15" height="15" viewBox="0 0 15 15" fill="none"
          >
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar respostas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Carregando respostas...</p>
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-700 font-semibold">Nenhuma resposta ainda</p>
            <p className="text-slate-400 text-sm mt-2">
              Compartilhe o link de um template para começar a receber respostas
            </p>
            <Link href="/dashboard" className="inline-block mt-5 text-sm text-blue-600 hover:underline font-medium">
              Ver templates →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((r, index) => {
            const tpl = templateMap[r.templateId];
            const templateTitle = tpl?.title || "Template removido";
            const hasDoc = !!tpl?.content;
            const answerEntries = Object.entries(r.answers || {});
            const preview = answerEntries.slice(0, 3);

            return (
              <div
                key={r.id || index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link
                      href={`/results/${r.templateId}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate"
                    >
                      {templateTitle}
                    </Link>
                    <span className="text-slate-300 text-xs">·</span>
                    <span className="text-xs font-mono text-slate-400 truncate">
                      #{r.id?.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-xs text-slate-400">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : ""}
                    </span>
                    {hasDoc && (
                      <>
                        <button
                          onClick={() => handleCopy(r)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-colors bg-white"
                        >
                          {copiedId === r.id ? "Copiado!" : "Copiar"}
                        </button>
                        <button
                          onClick={() => handlePrint(r)}
                          className="text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          PDF
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Answers */}
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {preview.map(([key, value]) => (
                      <div key={key} className="min-w-0">
                        <p className="text-xs font-medium text-slate-400 truncate">{key}</p>
                        <p className="text-sm text-slate-800 font-medium truncate mt-0.5">{String(value)}</p>
                      </div>
                    ))}
                    {answerEntries.length > 3 && (
                      <div className="flex items-end">
                        <Link
                          href={`/results/${r.templateId}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          +{answerEntries.length - 3} campos →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedPage>
  );
}
