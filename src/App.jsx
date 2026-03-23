import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ─── RESPONSIVE HOOK ─────────────────────────────────────────────────────────
const useBreakpoint = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return { isMobile: w < 768, isTablet: w >= 768 && w < 1024 };
};

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: "#0A0D14", surface: "#111520", card: "#161B2E", cardHover: "#1C2340",
  border: "#1E2540", accent: "#4F6EF7", accentDim: "rgba(79,110,247,0.15)",
  green: "#22D3A5", greenDim: "rgba(34,211,165,0.15)",
  red: "#F75959", redDim: "rgba(247,89,89,0.15)",
  amber: "#F7A94F", amberDim: "rgba(247,169,79,0.15)",
  text: "#E8EAF2", muted: "#7A82A8", dim: "#4A5070",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = v => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtDate = d => { if (!d) return "—"; const [y, m, da] = d.split("-"); return `${da}/${m}/${y}`; };
const sColor = s => ({ ativo: C.accent, quitado: C.green, atrasado: C.red, pendente: C.amber, pago: C.green })[s] || C.muted;
const sBg = s => ({ ativo: C.accentDim, quitado: C.greenDim, atrasado: C.redDim, pendente: C.amberDim, pago: C.greenDim })[s] || "transparent";
const today = () => new Date().toISOString().split("T")[0];

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({ status }) => (
  <span style={{ background: sBg(status), color: sColor(status), border: `1px solid ${sColor(status)}40`, padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{status}</span>
);
const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, cursor: onClick ? "pointer" : "default", transition: "all 0.2s", ...style }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = C.cardHover; }} onMouseLeave={e => { if (onClick) e.currentTarget.style.background = C.card; }}>{children}</div>
);
const Btn = ({ children, onClick, variant = "primary", size = "md", style = {}, fullWidth, disabled }) => {
  const base = { border: "none", borderRadius: 10, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "all 0.15s", fontFamily: "inherit", whiteSpace: "nowrap", width: fullWidth ? "100%" : "auto", padding: size === "sm" ? "7px 13px" : size === "lg" ? "13px 22px" : "9px 16px", fontSize: size === "sm" ? 12 : 14 };
  const variants = { primary: { background: C.accent, color: "#fff" }, secondary: { background: C.surface, color: C.text, border: `1px solid ${C.border}` }, danger: { background: C.redDim, color: C.red, border: `1px solid ${C.red}40` }, success: { background: C.greenDim, color: C.green, border: `1px solid ${C.green}40` }, ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` } };
  return <button style={{ ...base, ...variants[variant], ...style }} onClick={disabled ? undefined : onClick}>{children}</button>;
};
const Input = ({ label, value, onChange, type = "text", placeholder = "", required }) => (
  <div style={{ marginBottom: 13 }}>
    {label && <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
  </div>
);
const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 13 }}>
    {label && <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 13px", color: C.text, fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const Modal = ({ title, children, onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
    <style>{`@keyframes su{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 600, maxHeight: "92vh", overflow: "auto", animation: "su 0.22s ease" }}>
      <div style={{ padding: "15px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.card, zIndex: 1 }}>
        <h3 style={{ margin: 0, color: C.text, fontSize: 17, fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: 15, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  </div>
);
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: 340, padding: 28, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <div style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Confirmar exclusão</div>
      <div style={{ color: C.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>{message}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="danger" onClick={onConfirm}>Sim, excluir</Btn>
      </div>
    </div>
  </div>
);
const MCard = ({ children, onClick }) => (
  <div onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 14px", marginBottom: 9, cursor: onClick ? "pointer" : "default" }}>{children}</div>
);
const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);
const Table = ({ columns, data, mobileRender }) => {
  const { isMobile } = useBreakpoint();
  if (isMobile && mobileRender) return data.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 14 }}>Nenhum registro</div> : <div>{data.map((row, i) => <div key={i}>{mobileRender(row)}</div>)}</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
        <thead><tr>{columns.map(c => <th key={c.label} style={{ padding: "9px 13px", textAlign: "left", color: C.dim, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{c.label}</th>)}</tr></thead>
        <tbody>{data.length === 0 ? <tr><td colSpan={columns.length} style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 14 }}>Nenhum registro encontrado</td></tr> : data.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }} onMouseEnter={e => e.currentTarget.style.background = C.cardHover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {columns.map(col => <td key={col.label} style={{ padding: "11px 13px", color: C.text, fontSize: 13 }}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
};

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
const AuthPage = () => {
  const { isMobile } = useBreakpoint();
  const [tab, setTab] = useState("login");
  const [lf, setLf] = useState({ email: "", senha: "" });
  const [rf, setRf] = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const [lErr, setLErr] = useState(""); const [rErr, setRErr] = useState("");
  const [loading, setLoading] = useState(false); const [ok, setOk] = useState(false);

  const login = async () => {
    setLErr(""); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: lf.email, password: lf.senha });
    setLoading(false);
    if (error) setLErr("Email ou senha incorretos.");
  };

  const register = async () => {
    setRErr("");
    if (!rf.nome.trim()) return setRErr("Informe seu nome.");
    if (!rf.email.includes("@")) return setRErr("Email inválido.");
    if (rf.senha.length < 6) return setRErr("Senha mínima: 6 caracteres.");
    if (rf.senha !== rf.confirmar) return setRErr("As senhas não coincidem.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: rf.email, password: rf.senha, options: { data: { nome: rf.nome } } });
    setLoading(false);
    if (error) return setRErr(error.message);
    setOk(true);
    setTimeout(() => { setTab("login"); setLf({ email: rf.email, senha: "" }); setOk(false); }, 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: isMobile ? "column" : "row", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      {!isMobile && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 70px", background: "linear-gradient(135deg,#0D1224,#111B3A)", borderRight: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{ background: C.accent, borderRadius: 14, width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💳</div>
            <span style={{ color: C.text, fontWeight: 900, fontSize: 21, letterSpacing: "-0.03em" }}>CréditoGest</span>
          </div>
          <h1 style={{ color: C.text, fontSize: 32, fontWeight: 900, lineHeight: 1.2, margin: "0 0 14px", letterSpacing: "-0.03em" }}>Gerencie seus<br /><span style={{ color: C.accent }}>empréstimos</span><br />com facilidade</h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 340, marginBottom: 32 }}>Controle completo da sua carteira de crédito pessoal com dados salvos na nuvem.</p>
          {[["✅", "Dados salvos permanentemente"], ["📊", "Dashboard financeiro com gráficos"], ["🔒", "Conta segura com senha criptografada"], ["📱", "Acesse de qualquer dispositivo"]].map(([ic, tx]) => (
            <div key={tx} style={{ display: "flex", alignItems: "center", gap: 11, color: C.muted, fontSize: 14, marginBottom: 11 }}><span style={{ fontSize: 17 }}>{ic}</span>{tx}</div>
          ))}
        </div>
      )}
      <div style={{ width: isMobile ? "100%" : 440, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 20px" : "40px", minHeight: isMobile ? "100vh" : "auto" }}>
        {isMobile && <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ background: C.accent, borderRadius: 14, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>💳</div>
          <div style={{ color: C.text, fontWeight: 900, fontSize: 22 }}>CréditoGest</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>Gestão de Empréstimos</div>
        </div>}
        <div style={{ width: "100%", maxWidth: 390 }}>
          <div style={{ display: "flex", background: C.surface, borderRadius: 12, padding: 4, marginBottom: 22, border: `1px solid ${C.border}` }}>
            {[["login", "Entrar"], ["register", "Criar conta"]].map(([t, lb]) => (
              <button key={t} onClick={() => { setTab(t); setLErr(""); setRErr(""); }} style={{ flex: 1, padding: "11px", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", transition: "all 0.2s", background: tab === t ? C.accent : "transparent", color: tab === t ? "#fff" : C.muted }}>{lb}</button>
            ))}
          </div>
          {tab === "login" ? (
            <div>
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: 20, margin: "0 0 3px" }}>Bem-vindo de volta!</h2>
              <p style={{ color: C.muted, fontSize: 13, margin: "0 0 18px" }}>Entre com sua conta para continuar</p>
              <Input label="Email" value={lf.email} onChange={v => setLf(f => ({ ...f, email: v }))} type="email" placeholder="seu@email.com" />
              <Input label="Senha" value={lf.senha} onChange={v => setLf(f => ({ ...f, senha: v }))} type="password" placeholder="••••••••" />
              {lErr && <div style={{ color: C.red, fontSize: 13, marginBottom: 13, padding: "9px 13px", background: C.redDim, borderRadius: 8 }}>⚠️ {lErr}</div>}
              <Btn onClick={login} size="lg" fullWidth style={{ marginBottom: 13 }} disabled={loading}>{loading ? "Entrando..." : "Entrar na plataforma →"}</Btn>
            </div>
          ) : (
            <div>
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: 20, margin: "0 0 3px" }}>Crie sua conta grátis</h2>
              <p style={{ color: C.muted, fontSize: 13, margin: "0 0 18px" }}>Seus dados ficam salvos na nuvem</p>
              {ok ? <div style={{ textAlign: "center", padding: "36px 20px" }}><div style={{ fontSize: 50, marginBottom: 10 }}>🎉</div><div style={{ color: C.green, fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Conta criada!</div><div style={{ color: C.muted, fontSize: 13 }}>Verifique seu email para confirmar a conta.</div></div> : (
                <>
                  <Input label="Nome completo" value={rf.nome} onChange={v => setRf(f => ({ ...f, nome: v }))} placeholder="João da Silva" required />
                  <Input label="Email" value={rf.email} onChange={v => setRf(f => ({ ...f, email: v }))} type="email" placeholder="seu@email.com" required />
                  <Input label="Senha" value={rf.senha} onChange={v => setRf(f => ({ ...f, senha: v }))} type="password" placeholder="Mínimo 6 caracteres" required />
                  <Input label="Confirmar senha" value={rf.confirmar} onChange={v => setRf(f => ({ ...f, confirmar: v }))} type="password" placeholder="Repita a senha" required />
                  {rErr && <div style={{ color: C.red, fontSize: 13, marginBottom: 13, padding: "9px 13px", background: C.redDim, borderRadius: 8 }}>⚠️ {rErr}</div>}
                  <Btn onClick={register} size="lg" fullWidth style={{ marginBottom: 9 }} disabled={loading}>{loading ? "Criando..." : "Criar minha conta →"}</Btn>
                  <p style={{ color: C.dim, fontSize: 11, textAlign: "center", margin: 0, lineHeight: 1.5 }}>Você receberá um email de confirmação.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const DashboardPage = ({ clients, loans, parcelas, onNavigate }) => {
  const { isMobile, isTablet } = useBreakpoint();
  const totalEmp = loans.reduce((s, l) => s + (l.valor_emprestado || 0), 0);
  const totalRec = parcelas.filter(p => p.status === "pago").reduce((s, p) => s + (p.valor || 0), 0);
  const totalPend = parcelas.filter(p => p.status === "pendente").reduce((s, p) => s + (p.valor || 0), 0);
  const atrasadas = parcelas.filter(p => p.status === "atrasado");
  const cAtivos = new Set(loans.filter(l => l.status === "ativo").map(l => l.cliente_id)).size;

  const mLabels = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); mLabels.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("pt-BR", { month: "short" }).replace(".", "") }); }
  const empChart = mLabels.map(({ key, label }) => ({ mes: label.charAt(0).toUpperCase() + label.slice(1), valor: loans.filter(l => l.data_emprestimo?.startsWith(key)).reduce((s, l) => s + (l.valor_emprestado || 0), 0) }));
  const pagChart = mLabels.map(({ key, label }) => ({ mes: label.charAt(0).toUpperCase() + label.slice(1), recebido: parcelas.filter(p => p.status === "pago" && p.data_pagamento?.startsWith(key)).reduce((s, p) => s + (p.valor || 0), 0), pendente: parcelas.filter(p => p.status === "pendente" && p.data_vencimento?.startsWith(key)).reduce((s, p) => s + (p.valor || 0), 0) }));
  const sc = { ativo: 0, quitado: 0, atrasado: 0 };
  loans.forEach(l => { if (sc[l.status] !== undefined) sc[l.status]++; });
  const pie = [{ name: "Ativo", value: sc.ativo, color: C.accent }, { name: "Quitado", value: sc.quitado, color: C.green }, { name: "Atrasado", value: sc.atrasado, color: C.red }].filter(e => e.value > 0);
  const proxVenc = parcelas.filter(p => p.status === "pendente" || p.status === "atrasado").sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento)).slice(0, 5).map(p => { const loan = loans.find(l => l.id === p.emprestimo_id); return { ...p, clienteNome: clients.find(c => c.id === loan?.cliente_id)?.nome || "—" }; });
  const stats = [{ ic: "💰", lb: "Total Emprestado", val: fmt(totalEmp), col: C.accent }, { ic: "✅", lb: "Total Recebido", val: fmt(totalRec), col: C.green }, { ic: "⏳", lb: "Pendente", val: fmt(totalPend), col: C.amber }, { ic: "🚨", lb: "Atrasadas", val: atrasadas.length, sub: fmt(atrasadas.reduce((s, p) => s + (p.valor || 0), 0)), col: C.red }, { ic: "👥", lb: "Clientes Ativos", val: cAtivos, col: C.accent }];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: C.text, fontSize: isMobile ? 20 : 23, fontWeight: 800 }}>Dashboard</h2>
        <p style={{ color: C.muted, marginTop: 4, marginBottom: 0, fontSize: 13 }}>Visão geral da sua carteira de crédito</p>
      </div>
      {atrasadas.length > 0 && <div style={{ background: C.redDim, border: `1px solid ${C.red}40`, borderRadius: 12, padding: "11px 15px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><span>⚠️</span><span style={{ color: C.red, fontWeight: 600, fontSize: 13 }}>{atrasadas.length} parcela{atrasadas.length > 1 ? "s" : ""} em atraso</span></div>}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(3,1fr)" : "repeat(5,1fr)", gap: 11, marginBottom: 18 }}>
        {stats.map(s => <Card key={s.lb} style={{ padding: 15 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ color: C.muted, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>{s.lb}</div><div style={{ color: C.text, fontSize: isMobile ? 17 : 21, fontWeight: 800 }}>{s.val}</div>{s.sub && <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{s.sub}</div>}</div><div style={{ background: `${s.col}20`, borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, marginLeft: 6 }}>{s.ic}</div></div></Card>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 260px", gap: 13, marginBottom: 18 }}>
        <Card>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 13 }}>Empréstimos por Mês</div>
          {loans.length === 0 ? <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontSize: 13 }}>Sem dados</div> : <ResponsiveContainer width="100%" height={150}><AreaChart data={empChart}><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.accent} stopOpacity={0.3} /><stop offset="95%" stopColor={C.accent} stopOpacity={0} /></linearGradient></defs><XAxis dataKey="mes" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v / 1000}k`} width={42} /><Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12 }} formatter={v => fmt(v)} /><Area type="monotone" dataKey="valor" stroke={C.accent} fill="url(#ag)" strokeWidth={2} /></AreaChart></ResponsiveContainer>}
        </Card>
        <Card>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 13 }}>Recebimentos vs Pendentes</div>
          {parcelas.length === 0 ? <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontSize: 13 }}>Sem dados</div> : <ResponsiveContainer width="100%" height={150}><BarChart data={pagChart} barGap={3}><XAxis dataKey="mes" tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v / 1000}k`} width={42} /><Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12 }} formatter={v => fmt(v)} /><Bar dataKey="recebido" name="Recebido" fill={C.green} radius={[4, 4, 0, 0]} /><Bar dataKey="pendente" name="Pendente" fill={C.amber} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>}
        </Card>
        {!isMobile && <Card>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 13 }}>Status da Carteira</div>
          {pie.length === 0 ? <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontSize: 13 }}>Sem dados</div> : <><ResponsiveContainer width="100%" height={130}><PieChart><Pie data={pie} dataKey="value" innerRadius={38} outerRadius={60} paddingAngle={4}>{pie.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12 }} /></PieChart></ResponsiveContainer><div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>{pie.map(e => <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.muted }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, display: "inline-block" }} />{e.name}: {e.value}</div>)}</div></>}
        </Card>}
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Próximos Vencimentos</div>
          <Btn variant="ghost" size="sm" onClick={() => onNavigate("parcelas")}>Ver todos</Btn>
        </div>
        <Table columns={[{ key: "clienteNome", label: "Cliente" }, { key: "numero_parcela", label: "Parc.", render: v => `#${v}` }, { key: "valor", label: "Valor", render: v => fmt(v) }, { key: "data_vencimento", label: "Vencimento", render: v => fmtDate(v) }, { key: "status", label: "Status", render: v => <Badge status={v} /> }]} data={proxVenc}
          mobileRender={row => <MCard><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}><span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{row.clienteNome}</span><Badge status={row.status} /></div><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.muted, fontSize: 12 }}>Parc. #{row.numero_parcela} · {fmtDate(row.data_vencimento)}</span><span style={{ color: C.text, fontWeight: 700 }}>{fmt(row.valor)}</span></div></MCard>}
        />
      </Card>
    </div>
  );
};

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
const ClientesPage = ({ clients, setClients, loans, userId }) => {
  const { isMobile } = useBreakpoint();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", email: "", endereco: "", observacoes: "" });
  const [detail, setDetail] = useState(null);
  const [del, setDel] = useState(null);
  const [loading, setLoading] = useState(false);
  const filtered = clients.filter(c => c.nome?.toLowerCase().includes(search.toLowerCase()) || c.cpf?.includes(search));

  const save = async () => {
    setLoading(true);
    if (modal === "new") {
      const { data, error } = await supabase.from("clientes").insert({ ...form, user_id: userId }).select().single();
      if (!error) setClients(p => [...p, data]);
    } else {
      const { data, error } = await supabase.from("clientes").update(form).eq("id", form.id).select().single();
      if (!error) setClients(p => p.map(c => c.id === form.id ? data : c));
    }
    setLoading(false); setModal(null);
  };

  const confirmDel = async () => {
    await supabase.from("clientes").delete().eq("id", del);
    setClients(p => p.filter(c => c.id !== del)); setDel(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div><h2 style={{ margin: 0, color: C.text, fontSize: isMobile ? 20 : 23, fontWeight: 800 }}>Clientes</h2><p style={{ color: C.muted, marginTop: 3, marginBottom: 0, fontSize: 13 }}>{clients.length} cadastrados</p></div>
        <Btn onClick={() => { setForm({ nome: "", cpf: "", telefone: "", email: "", endereco: "", observacoes: "" }); setModal("new"); }} size={isMobile ? "sm" : "md"}>+ Novo Cliente</Btn>
      </div>
      <Card style={{ marginBottom: 14, padding: "11px 15px" }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Buscar por nome ou CPF..." style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 15, fontFamily: "inherit" }} /></Card>
      <Card>
        <Table columns={[{ key: "nome", label: "Nome" }, { key: "cpf", label: "CPF/CNPJ" }, { key: "telefone", label: "Telefone" }, { key: "created_at", label: "Cadastro", render: v => fmtDate(v?.split("T")[0]) }, { key: "id", label: "Empr.", render: (_, r) => <span style={{ color: C.accent, fontWeight: 700 }}>{loans.filter(l => l.cliente_id === r.id).length}</span> }, { key: "id", label: "", render: (_, r) => <div style={{ display: "flex", gap: 5 }}><Btn variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setDetail(r); }}>Ver</Btn><Btn variant="secondary" size="sm" onClick={e => { e.stopPropagation(); setForm({ ...r }); setModal("edit"); }}>✏️</Btn><Btn variant="danger" size="sm" onClick={e => { e.stopPropagation(); setDel(r.id); }}>🗑️</Btn></div> }]}
          data={filtered}
          mobileRender={row => <MCard><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}><div><div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{row.nome}</div><div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{row.cpf} · {row.telefone}</div></div><span style={{ color: C.accent, fontWeight: 700, fontSize: 12 }}>{loans.filter(l => l.cliente_id === row.id).length} empr.</span></div><div style={{ display: "flex", gap: 7 }}><Btn variant="ghost" size="sm" onClick={() => setDetail(row)}>Ver</Btn><Btn variant="secondary" size="sm" onClick={() => { setForm({ ...row }); setModal("edit"); }}>✏️</Btn><Btn variant="danger" size="sm" onClick={() => setDel(row.id)}>🗑️</Btn></div></MCard>}
        />
      </Card>
      {del && <ConfirmModal message="Deseja excluir este cliente?" onConfirm={confirmDel} onCancel={() => setDel(null)} />}
      {(modal === "new" || modal === "edit") && (
        <Modal title={modal === "new" ? "Novo Cliente" : "Editar Cliente"} onClose={() => setModal(null)}>
          <Input label="Nome" value={form.nome || ""} onChange={v => setForm(f => ({ ...f, nome: v }))} required />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 13px" }}>
            <Input label="CPF/CNPJ" value={form.cpf || ""} onChange={v => setForm(f => ({ ...f, cpf: v }))} />
            <Input label="Telefone" value={form.telefone || ""} onChange={v => setForm(f => ({ ...f, telefone: v }))} />
            <Input label="Email" value={form.email || ""} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
          </div>
          <Input label="Endereço" value={form.endereco || ""} onChange={v => setForm(f => ({ ...f, endereco: v }))} />
          <Input label="Observações" value={form.observacoes || ""} onChange={v => setForm(f => ({ ...f, observacoes: v }))} />
          <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn><Btn onClick={save} disabled={loading}>{loading ? "Salvando..." : modal === "new" ? "Cadastrar" : "Salvar"}</Btn></div>
        </Modal>
      )}
      {detail && (
        <Modal title={detail.nome} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", marginBottom: 14 }}>
            {[["CPF/CNPJ", detail.cpf], ["Telefone", detail.telefone], ["Email", detail.email]].map(([k, v]) => <div key={k}><div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{k}</div><div style={{ color: C.text, fontSize: 14, marginTop: 2 }}>{v || "—"}</div></div>)}
          </div>
          {detail.endereco && <div style={{ marginBottom: 9 }}><div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Endereço</div><div style={{ color: C.text, fontSize: 14, marginTop: 2 }}>{detail.endereco}</div></div>}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 13, color: C.muted, fontSize: 13 }}><strong style={{ color: C.text }}>{loans.filter(l => l.cliente_id === detail.id).length}</strong> empréstimo(s)</div>
        </Modal>
      )}
    </div>
  );
};

// ─── EMPRÉSTIMOS ──────────────────────────────────────────────────────────────
const EmprestimosPage = ({ clients, loans, setLoans, parcelas, setParcelas, userId }) => {
  const { isMobile } = useBreakpoint();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ valorPago: "", dataPagamento: today(), metodo: "pix", obs: "" });
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ clienteId: "", valorEmprestado: "", taxaJuros: "2", numeroParcelas: "6", dataEmprestimo: today(), dataVencimento: "", observacoes: "" });

  const filtered = loans.filter(l => { const c = clients.find(x => x.id === l.cliente_id); return c?.nome?.toLowerCase().includes(search.toLowerCase()) || String(l.id).includes(search) || l.status?.includes(search.toLowerCase()); });
  const calc = () => { const v = parseFloat(form.valorEmprestado) || 0; const t = parseFloat(form.taxaJuros) || 0; const n = parseInt(form.numeroParcelas) || 1; const total = v * (1 + t / 100); return { total, parcela: total / n }; };

  const saveLoan = async () => {
    setLoading(true);
    const { total, parcela } = calc();
    const loanData = { user_id: userId, cliente_id: form.clienteId, valor_emprestado: parseFloat(form.valorEmprestado), taxa_juros: parseFloat(form.taxaJuros), valor_total: total, numero_parcelas: parseInt(form.numeroParcelas), valor_parcela: parcela, data_emprestimo: form.dataEmprestimo, data_vencimento: form.dataVencimento || form.dataEmprestimo, status: "ativo", observacoes: form.observacoes };
    const { data: nl, error } = await supabase.from("emprestimos").insert(loanData).select().single();
    if (!error) {
      setLoans(p => [...p, nl]);
      const n = parseInt(form.numeroParcelas);
      const base = new Date(form.dataVencimento || form.dataEmprestimo);
      const parcs = [];
      for (let i = 0; i < n; i++) {
        const d = new Date(base); d.setMonth(d.getMonth() + i);
        parcs.push({ emprestimo_id: nl.id, numero_parcela: i + 1, valor: parcela, data_vencimento: d.toISOString().split("T")[0], status: "pendente" });
      }
      const { data: ps } = await supabase.from("parcelas").insert(parcs).select();
      if (ps) setParcelas(p => [...p, ...ps]);
    }
    setLoading(false); setModal(null);
    setForm({ clienteId: "", valorEmprestado: "", taxaJuros: "2", numeroParcelas: "6", dataEmprestimo: today(), dataVencimento: "", observacoes: "" });
  };

  const payParcela = async () => {
    const { data } = await supabase.from("parcelas").update({ status: "pago", data_pagamento: payForm.dataPagamento }).eq("id", payModal.id).select().single();
    if (data) setParcelas(p => p.map(x => x.id === payModal.id ? data : x));
    const remaining = parcelas.filter(p => p.emprestimo_id === payModal.emprestimo_id && p.id !== payModal.id && p.status !== "pago");
    if (!remaining.length) { await supabase.from("emprestimos").update({ status: "quitado" }).eq("id", payModal.emprestimo_id); setLoans(p => p.map(l => l.id === payModal.emprestimo_id ? { ...l, status: "quitado" } : l)); }
    setPayModal(null);
  };

  const confirmDel = async () => {
    await supabase.from("parcelas").delete().eq("emprestimo_id", delId);
    await supabase.from("emprestimos").delete().eq("id", delId);
    setLoans(p => p.filter(l => l.id !== delId)); setParcelas(p => p.filter(x => x.emprestimo_id !== delId));
    setSelected(null); setDelId(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div><h2 style={{ margin: 0, color: C.text, fontSize: isMobile ? 20 : 23, fontWeight: 800 }}>Empréstimos</h2><p style={{ color: C.muted, marginTop: 3, marginBottom: 0, fontSize: 13 }}>{loans.length} registros</p></div>
        <Btn onClick={() => setModal("new")} size={isMobile ? "sm" : "md"}>+ Novo</Btn>
      </div>
      <Card style={{ marginBottom: 14, padding: "11px 15px" }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Buscar..." style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 15, fontFamily: "inherit" }} /></Card>
      <Card>
        <Table columns={[{ key: "id", label: "Cliente", render: (_, r) => clients.find(c => c.id === r.cliente_id)?.nome || "—" }, { key: "valor_emprestado", label: "Valor", render: v => fmt(v) }, { key: "taxa_juros", label: "Juros", render: v => `${v}%` }, { key: "numero_parcelas", label: "Parc.", render: v => `${v}x` }, { key: "status", label: "Status", render: v => <Badge status={v} /> }, { key: "id", label: "", render: (_, r) => <div style={{ display: "flex", gap: 5 }}><Btn variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(r); }}>Ver</Btn><Btn variant="danger" size="sm" onClick={e => { e.stopPropagation(); setDelId(r.id); }}>🗑️</Btn></div> }]}
          data={filtered}
          mobileRender={row => <MCard><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}><div><div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{clients.find(c => c.id === row.cliente_id)?.nome || "—"}</div><div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{row.numero_parcelas}x · Juros {row.taxa_juros}%</div></div><Badge status={row.status} /></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: C.accent, fontWeight: 800, fontSize: 16 }}>{fmt(row.valor_emprestado)}</span><div style={{ display: "flex", gap: 6 }}><Btn variant="ghost" size="sm" onClick={() => setSelected(row)}>Ver</Btn><Btn variant="danger" size="sm" onClick={() => setDelId(row.id)}>🗑️</Btn></div></div></MCard>}
        />
      </Card>
      {delId && <ConfirmModal message="Excluir empréstimo e todas as parcelas?" onConfirm={confirmDel} onCancel={() => setDelId(null)} />}
      {selected && (
        <Modal title={`Empréstimo — ${clients.find(c => c.id === selected.cliente_id)?.nome}`} onClose={() => setSelected(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", marginBottom: 15 }}>
            {[["Valor", fmt(selected.valor_emprestado)], ["Juros", `${selected.taxa_juros}%`], ["Total", fmt(selected.valor_total)], ["Parcelas", `${selected.numero_parcelas}x ${fmt(selected.valor_parcela)}`], ["Data", fmtDate(selected.data_emprestimo)], ["Status", <Badge status={selected.status} />]].map(([k, v]) => <div key={k}><div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{k}</div><div style={{ color: C.text, fontSize: 14, marginTop: 2 }}>{v || "—"}</div></div>)}
          </div>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 9, borderTop: `1px solid ${C.border}`, paddingTop: 13 }}>Cronograma</div>
          {parcelas.filter(p => p.emprestimo_id === selected.id).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 6 }}>
              <div><span style={{ color: C.muted, fontSize: 12 }}>{p.numero_parcela}ª · {fmtDate(p.data_vencimento)}</span>{p.data_pagamento && <span style={{ color: C.green, fontSize: 11, marginLeft: 7 }}>Pago {fmtDate(p.data_pagamento)}</span>}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: C.text, fontWeight: 700 }}>{fmt(p.valor)}</span><Badge status={p.status} />{p.status !== "pago" && <Btn variant="success" size="sm" onClick={() => { setPayModal(p); setPayForm({ valorPago: String(p.valor), dataPagamento: today(), metodo: "pix", obs: "" }); }}>Receber</Btn>}</div>
            </div>
          ))}
        </Modal>
      )}
      {modal === "new" && (
        <Modal title="Novo Empréstimo" onClose={() => setModal(null)}>
          <Select label="Cliente" value={form.clienteId} onChange={v => setForm(f => ({ ...f, clienteId: v }))} required options={[{ value: "", label: "Selecione..." }, ...clients.map(c => ({ value: c.id, label: c.nome }))]} />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 13px" }}>
            <Input label="Valor Emprestado (R$)" value={form.valorEmprestado} onChange={v => setForm(f => ({ ...f, valorEmprestado: v }))} type="number" required />
            <Input label="Taxa de Juros (%)" value={form.taxaJuros} onChange={v => setForm(f => ({ ...f, taxaJuros: v }))} type="number" />
            <Input label="Nº de Parcelas" value={form.numeroParcelas} onChange={v => setForm(f => ({ ...f, numeroParcelas: v }))} type="number" />
            <Input label="Data do Empréstimo" value={form.dataEmprestimo} onChange={v => setForm(f => ({ ...f, dataEmprestimo: v }))} type="date" />
            <Input label="Primeiro Vencimento" value={form.dataVencimento} onChange={v => setForm(f => ({ ...f, dataVencimento: v }))} type="date" />
          </div>
          {form.valorEmprestado && <div style={{ background: C.accentDim, border: `1px solid ${C.accent}30`, borderRadius: 10, padding: 13, marginBottom: 13, display: "flex", gap: 22 }}><div><div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Total</div><div style={{ color: C.accent, fontWeight: 800, fontSize: 16 }}>{fmt(calc().total)}</div></div><div><div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Por Parcela</div><div style={{ color: C.text, fontWeight: 700 }}>{fmt(calc().parcela)}</div></div></div>}
          <Input label="Observações" value={form.observacoes} onChange={v => setForm(f => ({ ...f, observacoes: v }))} />
          <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn><Btn onClick={saveLoan} disabled={loading}>{loading ? "Criando..." : "Criar Empréstimo"}</Btn></div>
        </Modal>
      )}
      {payModal && (
        <Modal title={`Receber — ${payModal.numero_parcela}ª Parcela`} onClose={() => setPayModal(null)}>
          <div style={{ background: C.surface, borderRadius: 10, padding: 13, marginBottom: 13, fontSize: 13, color: C.muted }}>Valor: <strong style={{ color: C.text }}>{fmt(payModal.valor)}</strong> · Venc.: <strong style={{ color: C.text }}>{fmtDate(payModal.data_vencimento)}</strong></div>
          <Input label="Valor Pago (R$)" value={payForm.valorPago} onChange={v => setPayForm(f => ({ ...f, valorPago: v }))} type="number" required />
          <Input label="Data do Pagamento" value={payForm.dataPagamento} onChange={v => setPayForm(f => ({ ...f, dataPagamento: v }))} type="date" required />
          <Select label="Método" value={payForm.metodo} onChange={v => setPayForm(f => ({ ...f, metodo: v }))} options={[{ value: "pix", label: "PIX" }, { value: "dinheiro", label: "Dinheiro" }, { value: "transferencia", label: "Transferência" }, { value: "cartao", label: "Cartão" }]} />
          <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setPayModal(null)}>Cancelar</Btn><Btn variant="success" onClick={payParcela}>✅ Confirmar</Btn></div>
        </Modal>
      )}
    </div>
  );
};

// ─── PARCELAS ─────────────────────────────────────────────────────────────────
const ParcelasPage = ({ parcelas, setParcelas, loans, clients }) => {
  const { isMobile } = useBreakpoint();
  const [search, setSearch] = useState("");
  const [fs, setFs] = useState("todos");
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ valorPago: "", dataPagamento: today(), metodo: "pix" });
  const enriched = parcelas.map(p => { const loan = loans.find(l => l.id === p.emprestimo_id); return { ...p, clienteNome: clients.find(c => c.id === loan?.cliente_id)?.nome || "—" }; });
  const filtered = enriched.filter(p => (fs === "todos" || p.status === fs) && (p.clienteNome.toLowerCase().includes(search.toLowerCase()))).sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));

  const pay = async () => {
    const { data } = await supabase.from("parcelas").update({ status: "pago", data_pagamento: payForm.dataPagamento }).eq("id", payModal.id).select().single();
    if (data) setParcelas(p => p.map(x => x.id === payModal.id ? data : x));
    setPayModal(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, color: C.text, fontSize: isMobile ? 20 : 23, fontWeight: 800 }}>Parcelas</h2><p style={{ color: C.muted, marginTop: 3, marginBottom: 0, fontSize: 13 }}>{parcelas.length} parcelas</p></div>
      <Card style={{ marginBottom: 13, padding: "11px 15px" }}><input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Buscar..." style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 15, fontFamily: "inherit" }} /></Card>
      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>{["todos", "pendente", "pago", "atrasado"].map(s => <Btn key={s} variant={fs === s ? "primary" : "ghost"} size="sm" onClick={() => setFs(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</Btn>)}</div>
      <Card>
        <Table columns={[{ key: "clienteNome", label: "Cliente" }, { key: "numero_parcela", label: "Parc.", render: v => `${v}ª` }, { key: "valor", label: "Valor", render: v => fmt(v) }, { key: "data_vencimento", label: "Vencimento", render: v => fmtDate(v) }, { key: "status", label: "Status", render: v => <Badge status={v} /> }, { key: "id", label: "", render: (_, r) => r.status !== "pago" && <Btn variant="success" size="sm" onClick={() => { setPayModal(r); setPayForm({ valorPago: String(r.valor), dataPagamento: today(), metodo: "pix" }); }}>Receber</Btn> }]}
          data={filtered}
          mobileRender={row => <MCard><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}><div><div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{row.clienteNome}</div><div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{row.numero_parcela}ª · {fmtDate(row.data_vencimento)}</div></div><Badge status={row.status} /></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{fmt(row.valor)}</span>{row.status !== "pago" && <Btn variant="success" size="sm" onClick={() => { setPayModal(row); setPayForm({ valorPago: String(row.valor), dataPagamento: today(), metodo: "pix" }); }}>✅ Receber</Btn>}</div></MCard>}
        />
      </Card>
      {payModal && (
        <Modal title={`Receber — ${payModal.clienteNome}`} onClose={() => setPayModal(null)}>
          <div style={{ background: C.surface, borderRadius: 10, padding: 13, marginBottom: 13, fontSize: 13, color: C.muted }}>Parcela <strong style={{ color: C.text }}>{payModal.numero_parcela}ª</strong> · Valor: <strong style={{ color: C.text }}>{fmt(payModal.valor)}</strong></div>
          <Input label="Valor Pago (R$)" value={payForm.valorPago} onChange={v => setPayForm(f => ({ ...f, valorPago: v }))} type="number" required />
          <Input label="Data do Pagamento" value={payForm.dataPagamento} onChange={v => setPayForm(f => ({ ...f, dataPagamento: v }))} type="date" required />
          <Select label="Método" value={payForm.metodo} onChange={v => setPayForm(f => ({ ...f, metodo: v }))} options={[{ value: "pix", label: "PIX" }, { value: "dinheiro", label: "Dinheiro" }, { value: "transferencia", label: "Transferência" }, { value: "cartao", label: "Cartão" }]} />
          <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}><Btn variant="ghost" onClick={() => setPayModal(null)}>Cancelar</Btn><Btn variant="success" onClick={pay}>✅ Confirmar</Btn></div>
        </Modal>
      )}
    </div>
  );
};

// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
const RelatoriosPage = ({ loans, clients, parcelas }) => {
  const { isMobile } = useBreakpoint();
  const [tab, setTab] = useState("resumo");
  const totalEmp = loans.reduce((s, l) => s + (l.valor_emprestado || 0), 0);
  const totalJuros = loans.reduce((s, l) => s + ((l.valor_total || 0) - (l.valor_emprestado || 0)), 0);
  const totalRec = parcelas.filter(p => p.status === "pago").reduce((s, p) => s + (p.valor || 0), 0);
  const totalPend = parcelas.filter(p => p.status === "pendente").reduce((s, p) => s + (p.valor || 0), 0);
  const totalAtr = parcelas.filter(p => p.status === "atrasado").reduce((s, p) => s + (p.valor || 0), 0);
  const mLabels = []; for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); mLabels.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("pt-BR", { month: "short" }).replace(".", "") }); }
  const pagChart = mLabels.map(({ key, label }) => ({ mes: label.charAt(0).toUpperCase() + label.slice(1), recebido: parcelas.filter(p => p.status === "pago" && p.data_pagamento?.startsWith(key)).reduce((s, p) => s + (p.valor || 0), 0), pendente: parcelas.filter(p => p.status === "pendente" && p.data_vencimento?.startsWith(key)).reduce((s, p) => s + (p.valor || 0), 0) }));
  const perClient = clients.map(c => { const cls = loans.filter(l => l.cliente_id === c.id); if (!cls.length) return null; const total = cls.reduce((s, l) => s + (l.valor_emprestado || 0), 0); const rec = parcelas.filter(p => cls.find(l => l.id === p.emprestimo_id) && p.status === "pago").reduce((s, p) => s + (p.valor || 0), 0); return { ...c, totalEmprestado: total, recebido: rec, pendente: Math.max(0, total - rec), emprestimos: cls.length }; }).filter(Boolean).sort((a, b) => b.totalEmprestado - a.totalEmprestado);
  const atrasadas = parcelas.filter(p => p.status === "atrasado").map(p => { const loan = loans.find(l => l.id === p.emprestimo_id); return { ...p, clienteNome: clients.find(c => c.id === loan?.cliente_id)?.nome || "—" }; });
  return (
    <div>
      <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, color: C.text, fontSize: isMobile ? 20 : 23, fontWeight: 800 }}>Relatórios</h2></div>
      <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>{["resumo", "clientes", "atrasos"].map(t => <Btn key={t} variant={tab === t ? "primary" : "ghost"} size="sm" onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</Btn>)}</div>
      {tab === "resumo" && <div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5,1fr)", gap: 11, marginBottom: 18 }}>
          {[["💰 Capital", fmt(totalEmp), C.accent], ["📈 Juros", fmt(totalJuros), C.green], ["✅ Recebido", fmt(totalRec), C.green], ["⏳ A Receber", fmt(totalPend), C.amber], ["🚨 Em Atraso", fmt(totalAtr), C.red]].map(([l, v, col]) => <Card key={l} style={{ padding: 15 }}><div style={{ color: C.muted, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>{l}</div><div style={{ color: col, fontSize: 16, fontWeight: 800 }}>{v}</div></Card>)}
        </div>
        <Card>{parcelas.length === 0 ? <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim }}>Sem dados</div> : <ResponsiveContainer width="100%" height={160}><LineChart data={pagChart}><XAxis dataKey="mes" tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v / 1000}k`} width={42} /><CartesianGrid stroke={C.border} strokeDasharray="4 4" /><Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12 }} formatter={v => fmt(v)} /><Line type="monotone" dataKey="recebido" name="Recebido" stroke={C.green} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="pendente" name="Pendente" stroke={C.amber} strokeWidth={2} dot={false} strokeDasharray="4 4" /></LineChart></ResponsiveContainer>}</Card>
      </div>}
      {tab === "clientes" && <Card><Table columns={[{ key: "nome", label: "Cliente" }, { key: "emprestimos", label: "Empr." }, { key: "totalEmprestado", label: "Total", render: v => fmt(v) }, { key: "recebido", label: "Recebido", render: v => <span style={{ color: C.green, fontWeight: 700 }}>{fmt(v)}</span> }, { key: "pendente", label: "Pendente", render: v => <span style={{ color: v > 0 ? C.amber : C.green, fontWeight: 700 }}>{fmt(v)}</span> }]} data={perClient}
        mobileRender={row => <MCard><div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{row.nome}</div><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ color: C.muted, fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Total</div><div style={{ color: C.text, fontWeight: 700 }}>{fmt(row.totalEmprestado)}</div></div><div><div style={{ color: C.muted, fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Recebido</div><div style={{ color: C.green, fontWeight: 700 }}>{fmt(row.recebido)}</div></div><div><div style={{ color: C.muted, fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Pendente</div><div style={{ color: row.pendente > 0 ? C.amber : C.green, fontWeight: 700 }}>{fmt(row.pendente)}</div></div></div></MCard>}
      /></Card>}
      {tab === "atrasos" && <div>
        <div style={{ background: C.redDim, border: `1px solid ${C.red}30`, borderRadius: 12, padding: 15, marginBottom: 15 }}><div style={{ color: C.red, fontWeight: 800, fontSize: 17 }}>{atrasadas.length} parcelas atrasadas</div><div style={{ color: C.muted, fontSize: 13 }}>Total: {fmt(totalAtr)}</div></div>
        <Card><Table columns={[{ key: "clienteNome", label: "Cliente" }, { key: "numero_parcela", label: "Parc.", render: v => `${v}ª` }, { key: "valor", label: "Valor", render: v => fmt(v) }, { key: "data_vencimento", label: "Vencimento", render: v => fmtDate(v) }]} data={atrasadas}
          mobileRender={row => <MCard><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{row.clienteNome}</div><div style={{ color: C.muted, fontSize: 12 }}>{row.numero_parcela}ª · {fmtDate(row.data_vencimento)}</div></div><span style={{ color: C.red, fontWeight: 800, fontSize: 15 }}>{fmt(row.valor)}</span></div></MCard>}
        /></Card>
      </div>}
    </div>
  );
};

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ConfigPage = ({ user, onLogout }) => {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, color: C.text, fontSize: 22, fontWeight: 800 }}>Configurações</h2></div>
      <div style={{ maxWidth: 500 }}>
        <Card style={{ marginBottom: 14 }}>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 13 }}>Conta</div>
          <div style={{ marginBottom: 10 }}><div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Email</div><div style={{ color: C.text, fontSize: 15 }}>{user?.email}</div></div>
          <div style={{ marginBottom: 4 }}><div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Nome</div><div style={{ color: C.text, fontSize: 15 }}>{user?.user_metadata?.nome || "—"}</div></div>
        </Card>
        <Card style={{ marginBottom: 18 }}>
          <div style={{ color: C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 13 }}>Dados salvos em</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>☁️</span><div><div style={{ color: C.text, fontWeight: 700 }}>Supabase Cloud</div><div style={{ color: C.green, fontSize: 12 }}>✅ Conectado — dados persistentes</div></div></div>
        </Card>
        <Btn variant="danger" fullWidth onClick={onLogout}>Sair da conta</Btn>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { isMobile } = useBreakpoint();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loans, setLoans] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setClients([]); setLoans([]); setParcelas([]); return; }
    const load = async () => {
      setDataLoading(true);
      const [{ data: cls }, { data: lns }, { data: pars }] = await Promise.all([
        supabase.from("clientes").select("*").order("created_at", { ascending: false }),
        supabase.from("emprestimos").select("*").order("created_at", { ascending: false }),
        supabase.from("parcelas").select("*").order("numero_parcela"),
      ]);
      setClients(cls || []); setLoans(lns || []); setParcelas(pars || []);
      setDataLoading(false);
    };
    load();
  }, [session]);

  const nav = [{ id: "dashboard", ic: "⊞", lb: "Dashboard" }, { id: "clientes", ic: "👥", lb: "Clientes" }, { id: "emprestimos", ic: "💳", lb: "Empréstimos" }, { id: "parcelas", ic: "📋", lb: "Parcelas" }, { id: "relatorios", ic: "📊", lb: "Relatórios" }, { id: "config", ic: "⚙️", lb: "Config" }];
  const alerts = parcelas.filter(p => p.status === "atrasado").length;
  const go = id => { setPage(id); setDrawerOpen(false); };
  const logout = () => { supabase.auth.signOut(); setSession(null); };

  if (loading) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
  if (!session) return <AuthPage />;

  const SidebarContent = () => (
    <>
      <div style={{ padding: "18px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: C.accent, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>💳</div>
          <div><div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>CréditoGest</div><div style={{ color: C.muted, fontSize: 10 }}>Gestão de Crédito</div></div>
        </div>
        {isMobile && <button onClick={() => setDrawerOpen(false)} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", borderRadius: 8, width: 33, height: 33, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✕</button>}
      </div>
      <nav style={{ flex: 1, padding: "12px 9px", overflowY: "auto" }}>
        {nav.map(item => <div key={item.id} onClick={() => go(item.id)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 11px", borderRadius: 10, cursor: "pointer", marginBottom: 2, transition: "all 0.15s", background: page === item.id ? C.accentDim : "transparent", color: page === item.id ? C.accent : C.muted, fontWeight: page === item.id ? 700 : 500, fontSize: 14 }} onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = C.card; }} onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = "transparent"; }}><span style={{ fontSize: 16 }}>{item.ic}</span>{item.lb}{item.id === "parcelas" && alerts > 0 && <span style={{ marginLeft: "auto", background: C.red, color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 800, padding: "2px 6px" }}>{alerts}</span>}</div>)}
      </nav>
      <div style={{ padding: "13px 16px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.accent, fontSize: 13, flexShrink: 0 }}>{session.user?.email?.charAt(0).toUpperCase()}</div>
          <div style={{ overflow: "hidden", flex: 1 }}><div style={{ color: C.text, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.user?.user_metadata?.nome || session.user?.email}</div><div style={{ color: C.green, fontSize: 10 }}>☁️ Conta salva</div></div>
        </div>
        <Btn variant="ghost" size="sm" fullWidth onClick={logout}>Sair</Btn>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; } body { margin: 0; }`}</style>
      {!isMobile && <aside style={{ width: 234, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}><SidebarContent /></aside>}
      {isMobile && drawerOpen && <><div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200 }} /><aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", zIndex: 300 }}><SidebarContent /></aside></>}
      <main style={{ marginLeft: isMobile ? 0 : 234, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {isMobile && <div style={{ position: "sticky", top: 0, zIndex: 50, background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "11px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ background: C.accent, borderRadius: 8, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>💳</div><span style={{ color: C.text, fontWeight: 800, fontSize: 15 }}>CréditoGest</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>{alerts > 0 && <span style={{ background: C.red, color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 800, padding: "2px 8px" }}>{alerts} atraso{alerts > 1 ? "s" : ""}</span>}<button onClick={() => setDrawerOpen(true)} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", borderRadius: 8, width: 35, height: 35, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>☰</button></div>
        </div>}
        <div style={{ padding: isMobile ? "18px 15px 88px" : "30px 34px", flex: 1 }}>
          {dataLoading ? <Spinner /> : <>
            {page === "dashboard" && <DashboardPage clients={clients} loans={loans} parcelas={parcelas} onNavigate={go} />}
            {page === "clientes" && <ClientesPage clients={clients} setClients={setClients} loans={loans} userId={session.user.id} />}
            {page === "emprestimos" && <EmprestimosPage clients={clients} loans={loans} setLoans={setLoans} parcelas={parcelas} setParcelas={setParcelas} userId={session.user.id} />}
            {page === "parcelas" && <ParcelasPage parcelas={parcelas} setParcelas={setParcelas} loans={loans} clients={clients} />}
            {page === "relatorios" && <RelatoriosPage loans={loans} clients={clients} parcelas={parcelas} />}
            {page === "config" && <ConfigPage user={session.user} onLogout={logout} />}
          </>}
        </div>
        {isMobile && <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
          {nav.slice(0, 5).map(item => <button key={item.id} onClick={() => go(item.id)} style={{ flex: 1, padding: "9px 2px 7px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: page === item.id ? C.accent : C.muted, fontFamily: "inherit", position: "relative" }}><span style={{ fontSize: 19 }}>{item.ic}</span><span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.03em" }}>{item.lb.toUpperCase()}</span>{item.id === "parcelas" && alerts > 0 && <span style={{ position: "absolute", top: 4, right: "50%", transform: "translateX(8px)", background: C.red, color: "#fff", borderRadius: 20, fontSize: 8, fontWeight: 800, padding: "1px 4px" }}>{alerts}</span>}</button>)}
        </div>}
      </main>
    </div>
  );
}
