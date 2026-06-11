"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import TemplatePreview from "@/components/TemplatePreview";
import { useAuth } from "@/contexts/AuthContext";
import { createTemplate } from "@/lib/firestore";

const TYPE_LABELS: Record<string, string> = {
  texto: "Texto",
  numero: "Número",
  data: "Data",
  moeda: "Moeda (R$)",
};

export default function NewTemplatePage() {
  const { companyId } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  type Variable = { name: string; type: string; optional?: boolean };

  function detectVariables() {
    const matches = content.match(/{{(.*?)}}/g) || [];
    const extracted = [...new Set(matches.map((m) => m.slice(2, -2).trim()))];
    setVariables(
      extracted.map((name) => variables.find((v) => v.name === name) ?? { name, type: "texto" })
    );
  }

  function updateVariableType(index: number, type: string) {
    setVariables((prev) => prev.map((v, i) => (i === index ? { ...v, type } : v)));
  }

  function toggleOptional(index: number) {
    setVariables((prev) => prev.map((v, i) => (i === index ? { ...v, optional: !v.optional } : v)));
  }

  async function save() {
    if (!title.trim()) { alert("Digite um título."); return; }
    if (!companyId) { alert("Sessão inválida."); return; }
    setSaving(true);
    try {
      await createTemplate(companyId, { title, description, content, variables });
      window.location.href = "/dashboard";
    } catch {
      alert("Erro ao salvar template.");
      setSaving(false);
    }
  }

  return (
    <ProtectedPage>
      {previewing && (
        <TemplatePreview
          title={title}
          description={description}
          variables={variables}
          onClose={() => setPreviewing(false)}
        />
      )}
      <div className="px-8 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm font-medium">
            ← Voltar
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">Novo template</h1>
        </div>

        <div className="flex flex-col gap-4">
          {/* Informações */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Informações básicas</h2>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Título do template
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Proposta Comercial"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Instrução para o cliente
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o que o cliente deve preencher"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Conteúdo do documento</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Use <code className="bg-slate-100 px-1 rounded">{"{{nome_variavel}}"}</code> para campos a preencher
                </p>
              </div>
              <button
                type="button"
                onClick={detectVariables}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Detectar variáveis
              </button>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Olá {{nome}},\n\nSeguem os detalhes da sua proposta no valor de R$ {{valor}}.`}
                rows={10}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              />
            </div>
          </div>

          {/* Variáveis */}
          {variables.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">
                  Variáveis detectadas
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {variables.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Defina o tipo de cada campo do formulário</p>
              </div>
              <div className="divide-y divide-slate-50">
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      <code className="text-sm font-mono text-slate-700">{`{{${v.name}}}`}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleOptional(i)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                          v.optional
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {v.optional ? "Opcional" : "Obrigatório"}
                      </button>
                      <select
                        value={v.type}
                        onChange={(e) => updateVariableType(i, e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {Object.entries(TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewing(true)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Pré-visualizar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                {saving ? "Salvando..." : "Salvar template"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
