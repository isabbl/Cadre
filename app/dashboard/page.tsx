"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import QRModal from "@/components/QRModal";
import { useAuth } from "@/contexts/AuthContext";
import { getTemplates, removeTemplate, getResponses } from "@/lib/firestore";

type Template = {
  id: string;
  title: string;
  description: string;
  content: string;
  variables: { name: string; type: string }[];
  createdAt: string;
};

type QRTarget = { url: string; title: string };

export default function DashboardPage() {
  const { companyId, companyName } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [totalResponses, setTotalResponses] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [qrTarget, setQrTarget] = useState<QRTarget | null>(null);

  useEffect(() => {
    if (!companyId) return;
    async function load() {
      try {
        const [t, r] = await Promise.all([
          getTemplates(companyId!),
          getResponses(companyId!),
        ]);
        const responses = r as any[];
        const counts: Record<string, number> = {};
        for (const res of responses) counts[res.templateId] = (counts[res.templateId] || 0) + 1;
        setTemplates(t as Template[]);
        setResponseCounts(counts);
        setTotalResponses(responses.length);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companyId]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function copyLink(id: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/form/${id}`);
    showToast("Link copiado!");
  }

  function openQR(t: Template) {
    setQrTarget({ url: `${window.location.origin}/form/${t.id}`, title: t.title });
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return;
    try {
      await removeTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showToast("Template excluído.");
    } catch {
      alert("Erro ao excluir template.");
    }
  }

  const filtered = templates.filter((t) => {
    const s = search.toLowerCase();
    return t.title?.toLowerCase().includes(s) || t.id?.toLowerCase().includes(s);
  });

  const lastCreated = templates[0]?.createdAt
    ? new Date(templates[0].createdAt).toLocaleDateString("pt-BR")
    : null;

  return (
    <ProtectedPage>
      {qrTarget && (
        <QRModal url={qrTarget.url} title={qrTarget.title} onClose={() => setQrTarget(null)} />
      )}

      <div className="px-8 py-8 max-w-5xl">
        {toast && (
          <div className="fixed top-5 right-5 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg z-50 border border-white/10">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {companyName ? `Olá, ${companyName}` : "Dashboard"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <Link
            href="/templates/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            Novo template
          </Link>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Templates</p>
              <p className="text-3xl font-bold text-slate-900 mt-2 tabular-nums">{templates.length}</p>
              <p className="text-xs text-slate-400 mt-1">
                {lastCreated ? `Último em ${lastCreated}` : "Nenhum criado ainda"}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Respostas totais</p>
              <p className="text-3xl font-bold text-slate-900 mt-2 tabular-nums">{totalResponses}</p>
              <p className="text-xs text-slate-400 mt-1">
                {templates.length > 0
                  ? `~${Math.round(totalResponses / templates.length)} por template`
                  : "Aguardando respostas"}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Com respostas</p>
              <p className="text-3xl font-bold text-slate-900 mt-2 tabular-nums">
                {Object.keys(responseCounts).length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {templates.length > 0 ? `de ${templates.length} templates` : "Nenhum template"}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Carregando templates...</p>
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 text-center">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-slate-700 font-semibold text-lg">
              {templates.length === 0 ? "Nenhum template ainda" : "Nenhum resultado"}
            </p>
            <p className="text-slate-400 text-sm mt-1 mb-6">
              {templates.length === 0 ? "Crie seu primeiro template para começar a coletar respostas" : "Tente outro termo de busca"}
            </p>
            {templates.length === 0 && (
              <Link href="/templates/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                + Criar primeiro template
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((t) => {
            const count = responseCounts[t.id] || 0;
            const varCount = t.variables?.length || 0;
            return (
              <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-sm font-semibold text-slate-900 truncate">{t.title || "Sem título"}</h2>
                      {count > 0 && (
                        <span className="flex-shrink-0 inline-flex items-center bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {count} {count === 1 ? "resposta" : "respostas"}
                        </span>
                      )}
                    </div>
                    {t.description && <p className="text-xs text-slate-400 truncate mb-2">{t.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {varCount > 0 && <span>{varCount} {varCount === 1 ? "variável" : "variáveis"}</span>}
                      {varCount > 0 && t.createdAt && <span className="text-slate-200">·</span>}
                      {t.createdAt && <span>Criado em {new Date(t.createdAt).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  </div>

                  {/* Ações de compartilhamento */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openQR(t)}
                      className="text-xs border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 font-medium px-3 py-1.5 rounded-lg transition-colors"
                      title="Gerar QR Code"
                    >
                      QR Code
                    </button>
                    <button
                      onClick={() => copyLink(t.id)}
                      className="text-xs border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 text-slate-500 font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Copiar link
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-4 pt-3.5 border-t border-slate-100">
                  <Link href={`/results/${t.id}`} className="text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    Ver respostas
                  </Link>
                  <span className="text-slate-200 text-xs">·</span>
                  <Link href={`/templates/edit/${t.id}`} className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                    Editar
                  </Link>
                  <span className="text-slate-200 text-xs">·</span>
                  <button onClick={() => handleDelete(t.id, t.title)} className="text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedPage>
  );
}
