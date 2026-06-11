"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTemplate, createResponse, getCompany } from "@/lib/firestore";

type Variable = { name: string; type: string };
type Template = {
  id: string;
  title: string;
  description: string;
  companyId: string;
  variables: Variable[];
};

export default function FormPage() {
  const params = useParams();
  const id = String(params.id);

  const [template, setTemplate] = useState<Template | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTemplate(id);
        if (!data) { setLoading(false); return; }
        const t = data as Template;
        setTemplate(t);
        if (t.companyId) {
          const company = await getCompany(t.companyId) as any;
          if (company?.name) setCompanyName(company.name);
        }
      } catch {
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleChange(name: string, value: string) {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!template) return;
    setSubmitting(true);
    try {
      await createResponse({ templateId: template.id, companyId: template.companyId, answers });
      setSuccess(true);
    } catch {
      alert("Erro ao enviar resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderInput(v: Variable) {
    const base =
      "mt-1.5 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-slate-300";

    switch (v.type) {
      case "numero":
        return (
          <input
            type="number"
            placeholder="0"
            onChange={(e) => handleChange(v.name, e.target.value)}
            className={base}
            required
          />
        );
      case "data":
        return (
          <input
            type="date"
            onChange={(e) => handleChange(v.name, e.target.value)}
            className={base}
            required
          />
        );
      case "moeda":
        return (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-slate-400 text-sm font-semibold">R$</span>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              onChange={(e) => handleChange(v.name, e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-slate-300"
              required
            />
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder={`Digite aqui...`}
            onChange={(e) => handleChange(v.name, e.target.value)}
            className={base}
            required
          />
        );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-800 font-semibold text-lg">Formulário não encontrado</p>
          <p className="text-slate-400 text-sm mt-2">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md w-full max-w-md p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M7 16l7 7 11-11" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Enviado com sucesso!</h2>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Suas respostas foram recebidas. Em breve você receberá um retorno.
          </p>
          {companyName && (
            <p className="text-xs text-slate-300 mt-6">— {companyName}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Company badge */}
        {companyName && (
          <div className="text-center mb-5">
            <span className="inline-block bg-white border border-slate-200 text-slate-500 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
              {companyName}
            </span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{template.title}</h1>
            {template.description && (
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{template.description}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-7 py-6">
            {template.variables.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                Este formulário não possui campos configurados.
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {template.variables.map((v) => (
                  <div key={v.name}>
                    <label className="text-sm font-semibold text-slate-700 block">
                      {v.name}
                      <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    {renderInput(v)}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Enviar respostas"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Powered by <span className="font-semibold text-slate-500">Cadre</span>
        </p>
      </div>
    </div>
  );
}
