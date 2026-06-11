"use client";

import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, deleteUser } from "firebase/auth";
import { secondaryAuth } from "@/lib/firebase";
import {
  getCompanies,
  createCompanyAndUser,
  updateCompany,
  updateCompanyPassword,
  toggleCompanyActive,
  deleteCompanyAndUser,
} from "@/lib/firestore";

const ADMIN_PASSWORD = "cadre@admin2025";

type Company = {
  id: string;
  name: string;
  email: string;
  password?: string;
  active?: boolean;
  createdAt: string;
};

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  const [changingPasswordId, setChangingPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });

  useEffect(() => {
    if (unlocked) loadCompanies();
  }, [unlocked]);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  async function loadCompanies() {
    setLoadingList(true);
    try {
      const data = await getCompanies();
      setCompanies(data as Company[]);
    } catch {
      setCompanies([]);
    } finally {
      setLoadingList(false);
    }
  }

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3500);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      showToast("A senha precisa ter pelo menos 6 caracteres.", "error");
      return;
    }
    setCreating(true);
    try {
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await createCompanyAndUser(credential.user.uid, email, name, password);
      setName("");
      setEmail("");
      setPassword("");
      await loadCompanies();
      showToast(`Empresa "${name}" criada com sucesso!`);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        showToast("Este email já está cadastrado.", "error");
      } else {
        showToast("Erro ao criar empresa. Tente novamente.", "error");
      }
    } finally {
      setCreating(false);
    }
  }

  function startEdit(c: Company) {
    setEditingId(c.id);
    setEditingName(c.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function handleSaveEdit(id: string) {
    if (!editingName.trim()) return;
    setSaving(true);
    try {
      await updateCompany(id, editingName.trim());
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c))
      );
      setEditingId(null);
      showToast("Nome atualizado!");
    } catch {
      showToast("Erro ao atualizar.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(c: Company) {
    if (newPassword.length < 6) {
      showToast("A senha precisa ter pelo menos 6 caracteres.", "error");
      return;
    }
    if (!c.password) {
      showToast("Empresa sem senha cadastrada. Recrie a empresa.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      const credential = await signInWithEmailAndPassword(secondaryAuth, c.email, c.password);
      await updatePassword(credential.user, newPassword);
      await updateCompanyPassword(c.id, newPassword);
      setChangingPasswordId(null);
      setNewPassword("");
      showToast("Senha alterada com sucesso!");
    } catch {
      showToast("Erro ao alterar senha.", "error");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleToggleActive(c: Company) {
    const newActive = c.active === false ? true : false;
    const action = newActive ? "ativar" : "suspender";
    if (!confirm(`Deseja ${action} a empresa "${c.name}"?`)) return;
    try {
      await toggleCompanyActive(c.id, newActive);
      setCompanies((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, active: newActive } : x))
      );
      showToast(`Empresa ${newActive ? "ativada" : "suspensa"}.`);
    } catch {
      showToast("Erro ao atualizar status.", "error");
    }
  }

  async function handleDelete(c: Company) {
    if (!confirm(`Excluir a empresa "${c.name}" permanentemente? Esta ação não pode ser desfeita.`)) return;
    try {
      if (c.password) {
        const credential = await signInWithEmailAndPassword(secondaryAuth, c.email, c.password);
        await deleteUser(credential.user);
      }
      await deleteCompanyAndUser(c.id);
      setCompanies((prev) => prev.filter((x) => x.id !== c.id));
      showToast(`Empresa "${c.name}" excluída.`);
    } catch {
      showToast("Erro ao excluir empresa.", "error");
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-sm p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Painel Admin</h1>
          <p className="text-slate-500 text-sm mb-6">Digite a senha para continuar.</p>
          <form onSubmit={handleUnlock} className="flex flex-col gap-3">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              placeholder="Senha de acesso"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                passwordError ? "border-red-400" : "border-slate-300"
              }`}
              autoFocus
            />
            {passwordError && <p className="text-red-500 text-xs">Senha incorreta.</p>}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const suspended = companies.filter((c) => c.active === false);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {toast.message && (
        <div className={`fixed top-4 right-4 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 transition-all ${
          toast.type === "error" ? "bg-red-600" : "bg-green-700"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel Admin</h1>
          <p className="text-slate-500 text-sm mt-1">
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} cadastrada{companies.length !== 1 ? "s" : ""}
            {suspended.length > 0 && <span className="text-amber-600 ml-2">· {suspended.length} suspensa{suspended.length !== 1 ? "s" : ""}</span>}
          </p>
        </div>
        <button onClick={() => setUnlocked(false)} className="text-sm text-slate-400 hover:text-slate-600">
          Sair do admin
        </button>
      </div>

      {/* Formulário nova empresa */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Cadastrar nova empresa</h2>
        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nome da empresa</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Agência X"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Email de acesso</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="empresa@email.com"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Senha inicial</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mín. 6 caracteres"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
            >
              {creating ? "Criando..." : "Criar empresa"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de empresas */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Empresas</h2>

        {loadingList && <p className="text-slate-400 text-sm text-center py-8">Carregando...</p>}

        {!loadingList && companies.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-400 text-sm">Nenhuma empresa cadastrada ainda.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {companies.map((c) => {
            const isActive = c.active !== false;
            return (
              <div
                key={c.id}
                className={`bg-white border rounded-xl px-5 py-4 shadow-sm ${
                  isActive ? "border-slate-200" : "border-amber-200 bg-amber-50/30"
                }`}
              >
                {editingId === c.id ? (
                  <div className="flex items-center gap-3">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
                    >
                      {saving ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-300 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : changingPasswordId === c.id ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 mr-1">Nova senha para <strong>{c.name}</strong>:</span>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mín. 6 caracteres"
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleChangePassword(c)}
                      disabled={changingPassword}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
                    >
                      {changingPassword ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      onClick={() => { setChangingPasswordId(null); setNewPassword(""); }}
                      className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-300 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                          {!isActive && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                              Suspensa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{c.email}</p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Criada em {c.createdAt ? new Date(c.createdAt).toLocaleDateString("pt-BR") : "—"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-xs text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Renomear
                        </button>
                        <button
                          onClick={() => { setChangingPasswordId(c.id); setNewPassword(""); }}
                          className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Alterar senha
                        </button>
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`text-xs border px-3 py-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                              : "text-green-600 border-green-200 hover:bg-green-50"
                          }`}
                        >
                          {isActive ? "Suspender" : "Ativar"}
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
