"use client";

type Variable = { name: string; type: string };

type Props = {
  title: string;
  description: string;
  variables: Variable[];
  onClose: () => void;
};

function renderInput(v: Variable) {
  const base =
    "mt-1 w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white";

  switch (v.type) {
    case "numero":
      return <input type="number" placeholder={`Digite ${v.name}`} className={base} />;
    case "data":
      return <input type="date" className={base} />;
    case "moeda":
      return (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-slate-400 text-sm font-medium">R$</span>
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
          />
        </div>
      );
    default:
      return <input type="text" placeholder={`Digite ${v.name}`} className={base} />;
  }
}

export default function TemplatePreview({ title, description, variables, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview badge */}
        <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Pré-visualização
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto">
          {/* Form header */}
          <div className="px-8 pt-8 pb-5 border-b border-slate-200 bg-white">
            <h1 className="text-xl font-bold text-slate-900">{title || "Sem título"}</h1>
            {description && (
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Fields */}
          <div className="px-8 py-6 bg-white">
            {variables.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                Nenhuma variável detectada. Use{" "}
                <code className="bg-slate-100 px-1 rounded">{"{{nome}}"}</code> no conteúdo.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {variables.map((v) => (
                  <div key={v.name}>
                    <label className="text-sm font-medium text-slate-700 block">{v.name}</label>
                    {renderInput(v)}
                  </div>
                ))}
                <button
                  disabled
                  className="mt-2 w-full bg-blue-600 opacity-60 cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm"
                >
                  Enviar — desabilitado na pré-visualização
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
