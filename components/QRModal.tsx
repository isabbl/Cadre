"use client";

import QRCode from "react-qr-code";

type Props = {
  url: string;
  title: string;
  onClose: () => void;
};

export default function QRModal({ url, title, onClose }: Props) {
  function handlePrint() {
    const el = document.getElementById("qr-print-area");
    if (!el) return;
    el.style.display = "block";
    window.print();
    el.style.display = "none";
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
  }

  return (
    <>
      {/* Área de impressão oculta */}
      <div id="qr-print-area" style={{ display: "none" }}>
        <div style={{ textAlign: "center", padding: 48, fontFamily: "sans-serif" }}>
          <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</p>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 24 }}>{url}</p>
          <div style={{ display: "inline-block" }}>
            <svg id="qr-svg-print" />
          </div>
        </div>
      </div>

      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">QR Code do formulário</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{title}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
              ×
            </button>
          </div>

          <div className="flex flex-col items-center px-6 py-8 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <QRCode
                value={url}
                size={180}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
              />
            </div>

            <p className="text-xs text-slate-400 text-center break-all px-2">{url}</p>

            <div className="flex gap-2 w-full">
              <button
                onClick={handleCopy}
                className="flex-1 text-sm font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl transition-colors"
              >
                Copiar link
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 text-sm font-semibold bg-slate-900 hover:bg-slate-700 text-white py-2.5 rounded-xl transition-colors"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
