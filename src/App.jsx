import { useState, useMemo, useEffect, useCallback } from "react";

// ── FONTS ──

// ── THEME ──
const T = {
  bg: "#0B0E11", card: "#13171C", cardHover: "#191E25", border: "#1E2530",
  accent: "#C8A96E", accentDim: "rgba(200,169,110,0.15)", accentText: "#E8D5A8",
  text: "#E8ECF1", textDim: "#8A94A3", textMuted: "#5A6373",
  green: "#4ADE80", greenBg: "rgba(74,222,128,0.1)",
  red: "#F87171", redBg: "rgba(248,113,113,0.1)",
  blue: "#60A5FA", blueBg: "rgba(96,165,250,0.1)",
  orange: "#FB923C", orangeBg: "rgba(251,146,60,0.1)",
};

// ── DATA ──
const ESTABLISHMENTS = [
  { id: "pablo", name: "Pablo ST", group: "ete", coefLiquide: 0.27, coefSolide: 0.24, loyerAnnuel: 133337, loyerType: "variable", loyerPctCA: 0.05, igAnnuel: 600000, igType: "variable", igPctCA: 0.12, autresChargesAnnuel: 1166844, dateOuv: "2026-04-06", dateFerm: "2026-10-15", nbrJours: 193 },
  { id: "indie_beach", name: "Indie Beach", group: "ete", coefLiquide: 0.19, coefSolide: 0.19, loyerAnnuel: 162279, loyerType: "fixe", igAnnuel: 720000, igType: "variable", igPctCA: 0.10, autresChargesAnnuel: 2405296, dateOuv: "2026-04-18", dateFerm: "2026-10-04", nbrJours: 169 },
  { id: "playamigos", name: "Playamigos", group: "ete", coefLiquide: 0.17, coefSolide: 0.17, loyerAnnuel: 162279, loyerType: "fixe", igAnnuel: 154299, igType: "fixe", autresChargesAnnuel: 571181, dateOuv: "2026-04-10", dateFerm: "2026-10-05", nbrJours: 178 },
  { id: "cherry", name: "Cherry", group: "ete", coefLiquide: 0.24, coefSolide: 0.24, loyerAnnuel: 148000, loyerType: "fixe", igAnnuel: 126840, igType: "fixe", autresChargesAnnuel: 324703, dateOuv: "2026-04-15", dateFerm: "2026-10-12", nbrJours: 180 },
  { id: "sauvageonne", name: "La Sauvageonne", group: "ete", coefLiquide: 0.22, coefSolide: 0.22, loyerAnnuel: 40000, loyerType: "fixe", igAnnuel: 154560, igType: "variable", igPctCA: 0.08, autresChargesAnnuel: 361693, dateOuv: "2026-04-10", dateFerm: "2026-10-05", nbrJours: 178 },
  { id: "ormeau", name: "Ormeau", group: "ete", coefLiquide: 0.23, coefSolide: 0.23, loyerAnnuel: 234315, loyerType: "fixe", igAnnuel: 71329, igType: "fixe", autresChargesAnnuel: 239061, dateOuv: "2026-04-01", dateFerm: "2026-10-31", nbrJours: 213 },
  { id: "cherry_paris", name: "Cherry Paris", group: "ete", coefLiquide: 0.22, coefSolide: 0.22, loyerAnnuel: 85000, loyerType: "fixe", igAnnuel: 90000, igType: "fixe", autresChargesAnnuel: 180000, dateOuv: "2026-05-01", dateFerm: "2026-09-30", nbrJours: 153 },
  { id: "pablo_sbh_resto", name: "Pablo SBH Resto", group: "hiver", coefLiquide: 0.20, coefSolide: 0.20, loyerAnnuel: 0, loyerType: "fixe", igAnnuel: 0, igType: "fixe", autresChargesAnnuel: 450000, dateOuv: "2025-11-01", dateFerm: "2026-04-30", nbrJours: 181 },
  { id: "sauva_megeve", name: "Sauva Mégève", group: "hiver", coefLiquide: 0.25, coefSolide: 0.25, loyerAnnuel: 120000, loyerType: "fixe", igAnnuel: 80000, igType: "fixe", autresChargesAnnuel: 280000, dateOuv: "2025-12-10", dateFerm: "2026-03-30", nbrJours: 110 },
  { id: "cat_club", name: "Cat Club", group: "hiver", coefLiquide: 0.30, coefSolide: 0.30, loyerAnnuel: 95000, loyerType: "fixe", igAnnuel: 60000, igType: "fixe", autresChargesAnnuel: 200000, dateOuv: "2025-12-15", dateFerm: "2026-03-25", nbrJours: 100 },
  { id: "cafe_flora", name: "Café Flora", group: "ete", coefLiquide: 0.22, coefSolide: 0.22, loyerAnnuel: 0, loyerType: "fixe", igAnnuel: 0, igType: "fixe", autresChargesAnnuel: 150000, dateOuv: "2026-04-15", dateFerm: "2026-10-15", nbrJours: 183 },
];

const USERS = [
  { login: "antoine", password: "admin", name: "Antoine Costa", role: "admin", establishments: ESTABLISHMENTS.map(e => e.id) },
  { login: "associe1", password: "demo", name: "Associé Pablo", role: "viewer", establishments: ["pablo", "playamigos", "cherry", "sauvageonne", "ormeau", "indie_beach", "cherry_paris", "cafe_flora"] },
  { login: "associe2", password: "demo", name: "Associé SBH", role: "viewer", establishments: ["pablo_sbh_resto", "cat_club", "sauva_megeve"] },
];

// Generate demo daily data
function generateDailyData(est, year) {
  const data = [];
  const startStr = est.dateOuv.replace("2026", String(year));
  const endStr = est.dateFerm.replace("2026", String(year));
  const start = new Date(startStr); const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return data;
  const d = new Date(start);
  const baseFactor = year === 2025 ? 0.85 : 1;
  while (d <= end) {
    const dow = d.getDay();
    const month = d.getMonth();
    const isHighSeason = month >= 5 && month <= 7;
    const isWeekend = dow === 0 || dow === 5 || dow === 6;
    let baseCA = isHighSeason ? (isWeekend ? 35000 : 18000) : (isWeekend ? 15000 : 7000);
    if (est.id === "indie_beach") baseCA *= 2.5;
    if (est.id === "pablo") baseCA *= 1.8;
    if (est.id === "pablo_sbh_resto") baseCA *= 3;
    if (est.id === "sauva_megeve" || est.id === "cat_club") baseCA *= 1.2;
    if (est.id === "cafe_flora") baseCA *= 0.6;
    const noise = 0.7 + Math.random() * 0.6;
    const ca = Math.round(baseCA * baseFactor * noise);
    const cvtMoyen = 80 + Math.random() * 80;
    const couverts = Math.max(1, Math.round(ca / cvtMoyen));
    const ms = Math.round(ca * (0.18 + Math.random() * 0.08));
    const extra = Math.round(ca * (Math.random() * 0.04));
    const logement = Math.round(50 + Math.random() * 200);
    const dj = (est.id === "indie_beach" || est.id === "cat_club") && isWeekend ? Math.round(1000 + Math.random() * 8000) : 0;
    const secu = dj > 0 ? Math.round(dj * 0.15) : 0;
    const light = (est.id === "cat_club" || est.id === "sauva_megeve") ? Math.round(200 + Math.random() * 300) : 0;
    const hotel = (est.id === "cat_club" || est.id === "sauva_megeve") ? Math.round(100 + Math.random() * 400) : 0;
    const dateStr = d.toISOString().split("T")[0];
    data.push({ date: dateStr, ca, couverts, cvtMoyen: Math.round(cvtMoyen * 100) / 100, ms, extra, logement, dj, secu, light, hotel });
    d.setDate(d.getDate() + 1);
  }
  return data;
}

const DEMO_DATA = {};
ESTABLISHMENTS.forEach(est => {
  DEMO_DATA[est.id] = { n: generateDailyData(est, 2026), n1: generateDailyData(est, 2025) };
});

// Generate budget = N-1 * 1.1
ESTABLISHMENTS.forEach(est => {
  DEMO_DATA[est.id].budget = DEMO_DATA[est.id].n1.map(d => ({
    ...d, ca: Math.round(d.ca * 1.1), ms: Math.round(d.ms * 1.05),
    extra: Math.round(d.extra * 1.05), couverts: Math.round(d.couverts * 1.1),
  }));
  DEMO_DATA[est.id].previCA = DEMO_DATA[est.id].budget.map(d => ({ date: d.date, previ: d.ca }));
});

// ── UTILS ──
const fmt = (n) => n == null ? "–" : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
const fmtPct = (n) => n == null || !isFinite(n) ? "–" : (n * 100).toFixed(1) + "%";
const fmtEur = (n) => n == null ? "–" : fmt(n) + " €";
const pctVar = (n, n1) => (!n1 || n1 === 0) ? null : (n - n1) / n1;
const sumField = (arr, field) => arr.reduce((s, d) => s + (d[field] || 0), 0);
const filterByDateRange = (arr, from, to) => arr.filter(d => d.date >= from && d.date <= to);

function getWeekRange(date) {
  const d = new Date(date); const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d); mon.setDate(diff);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return [mon.toISOString().split("T")[0], sun.toISOString().split("T")[0]];
}
function getMonthRange(date) {
  const d = new Date(date);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return [first.toISOString().split("T")[0], last.toISOString().split("T")[0]];
}
function shiftDateN1(dateStr) {
  const d = new Date(dateStr); d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split("T")[0];
}
// ── COMPONENTS ──
const Badge = ({ value, inverse }) => {
  if (value == null || !isFinite(value)) return <span style={{ color: T.textMuted }}>–</span>;
  const pos = inverse ? value < 0 : value > 0;
  const neg = inverse ? value > 0 : value < 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600,
      background: pos ? T.greenBg : neg ? T.redBg : T.blueBg,
      color: pos ? T.green : neg ? T.red : T.blue,
    }}>
      {pos ? "▲" : neg ? "▼" : "–"} {fmtPct(Math.abs(value))}
    </span>
  );
};

const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "6px 14px", borderRadius: 8, border: `1px solid ${active ? T.accent : T.border}`,
    background: active ? T.accentDim : "transparent", color: active ? T.accent : T.textDim,
    fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
  }}>{label}</button>
);

const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
    <input {...props} style={{
      padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg,
      color: T.text, fontSize: 14, outline: "none", ...(props.style || {}),
    }} />
  </div>
);

const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: 20,
    transition: "all 0.2s", cursor: onClick ? "pointer" : "default",
    ...(onClick ? { ":hover": { background: T.cardHover } } : {}), ...style,
  }} onMouseEnter={e => { if (onClick) e.currentTarget.style.background = T.cardHover; e.currentTarget.style.borderColor = T.accent + "44"; }}
     onMouseLeave={e => { e.currentTarget.style.background = T.card; e.currentTarget.style.borderColor = T.border; }}>
    {children}
  </div>
);

// ── BAR CHART (simple CSS) ──
const MiniBar = ({ data, maxVal }) => {
  if (!data || data.length === 0) return null;
  const mx = maxVal || Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 48 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            width: "100%", maxWidth: 28, borderRadius: "4px 4px 0 0",
            height: Math.max(2, (d.value / mx) * 44),
            background: d.highlight ? T.accent : T.border, transition: "height 0.3s",
          }} title={`${d.label}: ${fmtEur(d.value)}`} />
        </div>
      ))}
    </div>
  );
};

// ── LOGIN ──
function LoginScreen({ onLogin }) {
  const [login, setLogin] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const handleSubmit = () => {
    const u = USERS.find(u => u.login === login && u.password === pw);
    if (u) onLogin(u); else setErr("Identifiants incorrects");
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div className="fade-in" style={{ width: 380, maxWidth: "90vw" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: T.accent, letterSpacing: 2 }}>INDIE GROUP</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 8, letterSpacing: 3, textTransform: "uppercase" }}>Reporting Dashboard</div>
        </div>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Identifiant" value={login} onChange={e => setLogin(e.target.value)} placeholder="antoine" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            <Input label="Mot de passe" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            {err && <div style={{ color: T.red, fontSize: 13 }}>{err}</div>}
            <button onClick={handleSubmit} style={{
              padding: "12px 0", borderRadius: 10, border: "none", background: T.accent, color: T.bg,
              fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: 1, marginTop: 8,
            }}>CONNEXION</button>
            <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center" }}>
              Demo: antoine / admin · associe1 / demo · associe2 / demo
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── DATE FILTERS ──
function DateFilters({ from, to, onRange }) {
  const today = new Date().toISOString().split("T")[0];
  const presets = [
    { label: "Aujourd'hui", fn: () => { onRange(today, today); } },
    { label: "Semaine", fn: () => { const [a, b] = getWeekRange(today); onRange(a, b); } },
    { label: "Mois", fn: () => { const [a, b] = getMonthRange(today); onRange(a, b); } },
    { label: "Saison", fn: () => { onRange("2026-04-01", "2026-10-31"); } },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
      <Input label="Du" type="date" value={from} onChange={e => onRange(e.target.value, to)} style={{ width: 150 }} />
      <Input label="Au" type="date" value={to} onChange={e => onRange(from, e.target.value)} style={{ width: 150 }} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {presets.map(p => <Pill key={p.label} label={p.label} onClick={p.fn} />)}
      </div>
    </div>
  );
}

// ── KPI ROW ──
function KpiRow({ label, n, n1, previ, pctCA_N, pctCA_N1, inverse, isEbitda }) {
  const varN1 = pctVar(n, n1);
  const varPrevi = pctVar(n, previ);
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 70px 1fr 70px 70px 70px", gap: 8, alignItems: "center",
      padding: "10px 0", borderBottom: `1px solid ${T.border}22`, fontSize: 13,
    }}>
      <div style={{ fontWeight: isEbitda ? 700 : 500, color: isEbitda ? T.accent : T.text }}>{label}</div>
      <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtEur(n)}</div>
      <div style={{ textAlign: "right", color: T.textMuted }}>{pctCA_N != null ? fmtPct(pctCA_N) : ""}</div>
      <div style={{ textAlign: "right", color: T.textDim, fontVariantNumeric: "tabular-nums" }}>{fmtEur(n1)}</div>
      <div style={{ textAlign: "right", color: T.textDim }}>{pctCA_N1 != null ? fmtPct(pctCA_N1) : ""}</div>
      <div style={{ textAlign: "right" }}><Badge value={varN1} inverse={inverse} /></div>
      <div style={{ textAlign: "right" }}><Badge value={varPrevi} inverse={inverse} /></div>
    </div>
  );
}

// ── ESTABLISHMENT DETAIL VIEW ──
function EstablishmentDetail({ est, from, to, onBack }) {
  const data = DEMO_DATA[est.id];
  const nData = filterByDateRange(data.n, from, to);
  const fromN1 = shiftDateN1(from); const toN1 = shiftDateN1(to);
  const n1Data = filterByDateRange(data.n1, fromN1, toN1);
  const budgetData = filterByDateRange(data.budget || [], fromN1, toN1);
  const previData = filterByDateRange(data.previCA || [], fromN1, toN1);

  const ca = sumField(nData, "ca");
  const caN1 = sumField(n1Data, "ca");
  const caPrevi = sumField(previData, "previ") || sumField(budgetData, "ca");
  const ms = sumField(nData, "ms"); const msN1 = sumField(n1Data, "ms");
  const extra = sumField(nData, "extra"); const extraN1 = sumField(n1Data, "extra");
  const log = sumField(nData, "logement"); const logN1 = sumField(n1Data, "logement");
  const msTotal = ms + extra + log; const msTotalN1 = msN1 + extraN1 + logN1;
  const dj = sumField(nData, "dj"); const djN1 = sumField(n1Data, "dj");
  const secu = sumField(nData, "secu"); const secuN1 = sumField(n1Data, "secu");
  const light = sumField(nData, "light"); const lightN1 = sumField(n1Data, "light");
  const hotel = sumField(nData, "hotel"); const hotelN1 = sumField(n1Data, "hotel");
  const djSecuTotal = dj + secu + light + hotel;
  const djSecuN1 = djN1 + secuN1 + lightN1 + hotelN1;
  const nbrJours = nData.length || est.nbrJours;
  const achatMP = Math.round(ca * est.coefSolide);
  const achatMPN1 = Math.round(caN1 * est.coefSolide);
  const loyer = est.loyerType === "variable" ? Math.round(ca * (est.loyerPctCA || 0.05)) : Math.round(est.loyerAnnuel / est.nbrJours * nbrJours);
  const loyerN1 = est.loyerType === "variable" ? Math.round(caN1 * (est.loyerPctCA || 0.05)) : Math.round(est.loyerAnnuel / est.nbrJours * nbrJours);
  const ig = est.igType === "variable" ? Math.round(ca * (est.igPctCA || 0.10)) : Math.round(est.igAnnuel / est.nbrJours * nbrJours);
  const igN1 = est.igType === "variable" ? Math.round(caN1 * (est.igPctCA || 0.10)) : Math.round(est.igAnnuel / est.nbrJours * nbrJours);
  const autresCharges = Math.round(est.autresChargesAnnuel / est.nbrJours * nbrJours);
  const autresChargesN1 = autresCharges;
  const ebitda = ca - msTotal - djSecuTotal - achatMP - loyer - ig - autresCharges;
  const ebitdaN1 = caN1 - msTotalN1 - djSecuN1 - achatMPN1 - loyerN1 - igN1 - autresChargesN1;

  const couverts = sumField(nData, "couverts"); const couvertsN1 = sumField(n1Data, "couverts");
  const cvtMoyen = couverts > 0 ? ca / couverts : 0;
  const cvtMoyenN1 = couvertsN1 > 0 ? caN1 / couvertsN1 : 0;

  // Daily CA chart data
  const chartData = nData.slice(-14).map(d => ({ label: d.date.slice(5), value: d.ca, highlight: true }));

  const msBudget = Math.round(caPrevi * 0.22);
  const achatBudget = Math.round(caPrevi * est.coefSolide);

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontWeight: 500,
      }}>← Retour</button>

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: T.accent }}>{est.name}</h2>
        <span style={{ fontSize: 12, color: T.textMuted }}>{from} → {to}</span>
      </div>

      {/* Top KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "CA", val: ca, prev: caN1, previ: caPrevi },
          { label: "Couverts", val: couverts, prev: couvertsN1 },
          { label: "Ticket Moyen", val: Math.round(cvtMoyen), prev: Math.round(cvtMoyenN1) },
          { label: "EBITDA", val: ebitda, prev: ebitdaN1 },
        ].map((k, i) => (
          <Card key={i} style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{k.label === "Couverts" ? fmt(k.val) : fmtEur(k.val)}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              <Badge value={pctVar(k.val, k.prev)} />
              <span style={{ fontSize: 11, color: T.textMuted }}>vs N-1</span>
            </div>
          </Card>
        ))}
      </div>

      {/* CA trend mini chart */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>CA journalier (14 derniers jours)</div>
        <MiniBar data={chartData} />
      </Card>

      {/* P&L Detail */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>P&L Détaillé</div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 640 }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 70px 1fr 70px 70px 70px", gap: 8,
              padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1,
            }}>
              <div>Ligne</div><div style={{ textAlign: "right" }}>N</div><div style={{ textAlign: "right" }}>% CA</div>
              <div style={{ textAlign: "right" }}>N-1</div><div style={{ textAlign: "right" }}>% CA</div>
              <div style={{ textAlign: "right" }}>Var N-1</div><div style={{ textAlign: "right" }}>Var Prévi</div>
            </div>
            <KpiRow label="CA" n={ca} n1={caN1} previ={caPrevi} />
            <KpiRow label="MS (paie)" n={ms} n1={msN1} previ={msBudget * 0.8} pctCA_N={ca ? ms / ca : null} pctCA_N1={caN1 ? msN1 / caN1 : null} inverse />
            <KpiRow label="Extras" n={extra} n1={extraN1} previ={msBudget * 0.05} pctCA_N={ca ? extra / ca : null} pctCA_N1={caN1 ? extraN1 / caN1 : null} inverse />
            <KpiRow label="Logement" n={log} n1={logN1} previ={msBudget * 0.02} pctCA_N={ca ? log / ca : null} pctCA_N1={caN1 ? logN1 / caN1 : null} inverse />
            <KpiRow label="MS + Log Total" n={msTotal} n1={msTotalN1} previ={msBudget} pctCA_N={ca ? msTotal / ca : null} pctCA_N1={caN1 ? msTotalN1 / caN1 : null} inverse />
            <KpiRow label="DJ / Sécu / Light / Hôtel" n={djSecuTotal} n1={djSecuN1} previ={djSecuN1 * 1.1} pctCA_N={ca ? djSecuTotal / ca : null} pctCA_N1={caN1 ? djSecuN1 / caN1 : null} inverse />
            <KpiRow label="Achat MP" n={achatMP} n1={achatMPN1} previ={achatBudget} pctCA_N={ca ? achatMP / ca : null} pctCA_N1={caN1 ? achatMPN1 / caN1 : null} inverse />
            <KpiRow label="Loyer" n={loyer} n1={loyerN1} previ={loyerN1} pctCA_N={ca ? loyer / ca : null} pctCA_N1={caN1 ? loyerN1 / caN1 : null} inverse />
            <KpiRow label="IG" n={ig} n1={igN1} previ={igN1} pctCA_N={ca ? ig / ca : null} pctCA_N1={caN1 ? igN1 / caN1 : null} inverse />
            <KpiRow label="Autres Charges" n={autresCharges} n1={autresChargesN1} previ={autresChargesN1} pctCA_N={ca ? autresCharges / ca : null} pctCA_N1={caN1 ? autresChargesN1 / caN1 : null} inverse />
            <KpiRow label="EBITDA" n={ebitda} n1={ebitdaN1} previ={caPrevi - msBudget - achatBudget - loyerN1 - igN1 - autresChargesN1 - djSecuN1 * 1.1}
              pctCA_N={ca ? ebitda / ca : null} pctCA_N1={caN1 ? ebitdaN1 / caN1 : null} isEbitda />
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── ADMIN CONSOLE ──
function AdminConsole({ onBack }) {
  const [tab, setTab] = useState("users");
  const [editEst, setEditEst] = useState(null);
  const tabs = [
    { id: "users", label: "Utilisateurs" },
    { id: "establishments", label: "Établissements" },
    { id: "imports", label: "Imports" },
    { id: "coefs", label: "Coefs MP" },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.accent, fontSize: 14, cursor: "pointer", marginBottom: 20, fontWeight: 500 }}>← Dashboard</button>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: T.accent, marginBottom: 24 }}>Console Admin</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(t => <Pill key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
      </div>

      {tab === "users" && (
        <Card>
          <div style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Gestion des utilisateurs</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Login</th>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Nom</th>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Rôle</th>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Établissements</th>
                  <th style={{ padding: "8px 12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map(u => (
                  <tr key={u.login} style={{ borderBottom: `1px solid ${T.border}22` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{u.login}</td>
                    <td style={{ padding: "10px 12px" }}>{u.name}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: u.role === "admin" ? T.accentDim : T.blueBg, color: u.role === "admin" ? T.accent : T.blue }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: T.textDim }}>
                      {u.role === "admin" ? "Tous" : u.establishments.length + " étab."}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <button style={{ background: "none", border: `1px solid ${T.border}`, color: T.textDim, padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button style={{ marginTop: 16, padding: "10px 20px", borderRadius: 8, border: `1px solid ${T.accent}`, background: "transparent", color: T.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Ajouter un utilisateur
          </button>
        </Card>
      )}

      {tab === "establishments" && (
        <Card>
          <div style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Paramétrage des établissements</div>
          <div style={{ display: "grid", gap: 8 }}>
            {ESTABLISHMENTS.map(est => (
              <div key={est.id} style={{
                display: "grid", gridTemplateColumns: "1fr 120px 120px 120px 80px", gap: 12, alignItems: "center",
                padding: "12px 16px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, fontSize: 13,
              }}>
                <div style={{ fontWeight: 600 }}>{est.name}</div>
                <div style={{ color: T.textDim }}>Loyer: {est.loyerType === "variable" ? fmtPct(est.loyerPctCA) + " CA" : fmtEur(est.loyerAnnuel)}</div>
                <div style={{ color: T.textDim }}>IG: {est.igType === "variable" ? fmtPct(est.igPctCA) + " CA" : fmtEur(est.igAnnuel)}</div>
                <div style={{ color: T.textDim }}>{est.dateOuv} → {est.dateFerm}</div>
                <button style={{ background: "none", border: `1px solid ${T.border}`, color: T.textDim, padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>Edit</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "imports" && (
        <Card>
          <div style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Import de données</div>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { source: "Mealenium", desc: "Export caisse (CA, couverts, ticket moyen, offerts, remises)", format: "CSV / XLSX", freq: "Automatique (email nuit)" },
              { source: "PayFit", desc: "Masse salariale détaillée par jour", format: "CSV", freq: "Mensuel" },
              { source: "Silae", desc: "Masse salariale (établissements restants)", format: "CSV", freq: "Mensuel" },
              { source: "Google Sheet – Prévi CA", desc: "CA prévisionnel par établissement / jour", format: "Sync API", freq: "Temps réel" },
              { source: "Google Sheet – Extras", desc: "Extras saisis par directeurs / RH", format: "Sync API", freq: "Temps réel" },
              { source: "Google Sheet – Refac MS", desc: "Refacturation masse salariale inter-étab.", format: "Sync API", freq: "Temps réel" },
              { source: "Google Sheet – Logements", desc: "Montant journalier logement par étab.", format: "Sync API", freq: "Temps réel" },
              { source: "Google Sheet – DJ / Sécu", desc: "Dépenses DJ, sécurité, light, hôtel", format: "Sync API", freq: "Temps réel" },
            ].map((s, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "160px 1fr 100px 140px 100px", gap: 12, alignItems: "center",
                padding: "12px 16px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, fontSize: 13,
              }}>
                <div style={{ fontWeight: 600, color: T.accent }}>{s.source}</div>
                <div style={{ color: T.textDim }}>{s.desc}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{s.format}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{s.freq}</div>
                <button style={{ background: T.accentDim, border: "none", color: T.accent, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  Importer
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: T.orangeBg, border: `1px solid ${T.orange}33` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.orange, marginBottom: 6 }}>📧 Import automatique par email</div>
            <div style={{ fontSize: 12, color: T.textDim }}>
              Configurer un email dédié (ex: import@indie-reporting.com) pour recevoir les exports Mealenium chaque nuit.
              Un script CRON parse les pièces jointes et injecte les données automatiquement.
            </div>
          </div>
        </Card>
      )}

      {tab === "coefs" && (
        <Card>
          <div style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Coefficients Achat MP par établissement</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, color: T.textMuted, fontSize: 11, textTransform: "uppercase" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px" }}>Établissement</th>
                  <th style={{ textAlign: "center", padding: "8px 12px" }}>Coef Liquide</th>
                  <th style={{ textAlign: "center", padding: "8px 12px" }}>Coef Solide</th>
                  <th style={{ textAlign: "center", padding: "8px 12px" }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {ESTABLISHMENTS.map(est => (
                  <tr key={est.id} style={{ borderBottom: `1px solid ${T.border}22` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{est.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ padding: "4px 12px", borderRadius: 6, background: T.bg, border: `1px solid ${T.border}`, display: "inline-block", minWidth: 60 }}>
                        {fmtPct(est.coefLiquide)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ padding: "4px 12px", borderRadius: 6, background: T.bg, border: `1px solid ${T.border}`, display: "inline-block", minWidth: 60 }}>
                        {fmtPct(est.coefSolide)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontSize: 11, color: T.textMuted }}>N-1 cumulé</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ──
function Dashboard({ user, from, to, onRange, onSelectEst, onAdmin, onLogout }) {
  const userEstablishments = ESTABLISHMENTS.filter(e => user.establishments.includes(e.id));

  // Aggregate group totals
  const totals = useMemo(() => {
    let totalCA = 0, totalCAN1 = 0, totalPrevi = 0, totalMS = 0, totalEbitda = 0, totalEbitdaN1 = 0;
    userEstablishments.forEach(est => {
      const d = DEMO_DATA[est.id];
      const n = filterByDateRange(d.n, from, to);
      const fromN1 = shiftDateN1(from); const toN1 = shiftDateN1(to);
      const n1 = filterByDateRange(d.n1, fromN1, toN1);
      const previArr = filterByDateRange(d.previCA || [], fromN1, toN1);
      const ca = sumField(n, "ca"); const caN1 = sumField(n1, "ca");
      const previ = sumField(previArr, "previ") || sumField(filterByDateRange(d.budget || [], fromN1, toN1), "ca");
      const msT = sumField(n, "ms") + sumField(n, "extra") + sumField(n, "logement");
      const msTN1 = sumField(n1, "ms") + sumField(n1, "extra") + sumField(n1, "logement");
      const nbrJ = n.length || est.nbrJours;
      const achat = ca * est.coefSolide;
      const achatN1 = caN1 * est.coefSolide;
      const loyer = est.loyerType === "variable" ? ca * (est.loyerPctCA || 0.05) : est.loyerAnnuel / est.nbrJours * nbrJ;
      const loyerN1 = est.loyerType === "variable" ? caN1 * (est.loyerPctCA || 0.05) : est.loyerAnnuel / est.nbrJours * nbrJ;
      const ig = est.igType === "variable" ? ca * (est.igPctCA || 0.10) : est.igAnnuel / est.nbrJours * nbrJ;
      const igN1 = est.igType === "variable" ? caN1 * (est.igPctCA || 0.10) : est.igAnnuel / est.nbrJours * nbrJ;
      const autres = est.autresChargesAnnuel / est.nbrJours * nbrJ;
      const djS = sumField(n, "dj") + sumField(n, "secu") + sumField(n, "light") + sumField(n, "hotel");
      const djSN1 = sumField(n1, "dj") + sumField(n1, "secu") + sumField(n1, "light") + sumField(n1, "hotel");
      totalCA += ca; totalCAN1 += caN1; totalPrevi += previ; totalMS += msT;
      totalEbitda += ca - msT - djS - achat - loyer - ig - autres;
      totalEbitdaN1 += caN1 - msTN1 - djSN1 - achatN1 - loyerN1 - igN1 - autres;
    });
    return { totalCA, totalCAN1, totalPrevi, totalMS, totalEbitda, totalEbitdaN1 };
  }, [from, to, userEstablishments]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: T.accent, letterSpacing: 1 }}>INDIE GROUP</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{user.name} · {user.role === "admin" ? "Admin" : "Associé"}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {user.role === "admin" && (
            <button onClick={onAdmin} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.accent}`, background: "transparent", color: T.accent, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              ⚙ Admin
            </button>
          )}
          <button onClick={onLogout} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textDim, fontSize: 13, cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Date filters */}
      <div style={{ marginBottom: 28 }}>
        <DateFilters from={from} to={to} onRange={onRange} />
      </div>

      {/* Group KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "CA Groupe", val: totals.totalCA, prev: totals.totalCAN1, previ: totals.totalPrevi },
          { label: "MS Groupe", val: totals.totalMS },
          { label: "EBITDA Groupe", val: totals.totalEbitda, prev: totals.totalEbitdaN1 },
          { label: "Marge EBITDA", val: totals.totalCA ? totals.totalEbitda / totals.totalCA : 0, isPct: true },
        ].map((k, i) => (
          <Card key={i}>
            <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: k.label.includes("EBITDA") && k.val < 0 ? T.red : T.text }}>
              {k.isPct ? fmtPct(k.val) : fmtEur(k.val)}
            </div>
            {k.prev != null && (
              <div style={{ marginTop: 6 }}><Badge value={pctVar(k.isPct ? k.val : k.val, k.prev)} /></div>
            )}
          </Card>
        ))}
      </div>

      {/* Establishment cards */}
      <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Établissements</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {userEstablishments.map((est, i) => {
          const d = DEMO_DATA[est.id];
          const n = filterByDateRange(d.n, from, to);
          const fromN1 = shiftDateN1(from); const toN1 = shiftDateN1(to);
          const n1 = filterByDateRange(d.n1, fromN1, toN1);
          const ca = sumField(n, "ca"); const caN1 = sumField(n1, "ca");
          const ms = sumField(n, "ms") + sumField(n, "extra") + sumField(n, "logement");
          const couverts = sumField(n, "couverts");
          const pctMS = ca > 0 ? ms / ca : null;
          const chartD = n.slice(-7).map(dd => ({ value: dd.ca, label: dd.date.slice(5), highlight: true }));

          return (
            <Card key={est.id} onClick={() => onSelectEst(est)} style={{ animationDelay: `${i * 0.03}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{est.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{est.group === "ete" ? "Saison été" : "Saison hiver"}</div>
                </div>
                <Badge value={pctVar(ca, caN1)} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", marginBottom: 4 }}>{fmtEur(ca)}</div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textDim, marginBottom: 12 }}>
                <span>MS: {pctMS != null ? fmtPct(pctMS) : "–"}</span>
                <span>{fmt(couverts)} cvts</span>
              </div>
              <MiniBar data={chartD} />
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: T.accent, fontWeight: 500 }}>Détail →</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── APP ──
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard | detail | admin
  const [selectedEst, setSelectedEst] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const [weekStart, weekEnd] = getWeekRange(today);
  const [from, setFrom] = useState(weekStart);
  const [to, setTo] = useState(weekEnd);

  const handleRange = useCallback((f, t) => { setFrom(f); setTo(t); }, []);

  if (!user) return <LoginScreen onLogin={u => setUser(u)} />;

  if (view === "admin") return (
    <div style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <AdminConsole onBack={() => setView("dashboard")} />
    </div>
  );

  if (view === "detail" && selectedEst) return (
    <div style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <DateFilters from={from} to={to} onRange={handleRange} />
      <div style={{ height: 20 }} />
      <EstablishmentDetail est={selectedEst} from={from} to={to} onBack={() => { setView("dashboard"); setSelectedEst(null); }} />
    </div>
  );

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <Dashboard
        user={user} from={from} to={to} onRange={handleRange}
        onSelectEst={est => { setSelectedEst(est); setView("detail"); }}
        onAdmin={() => setView("admin")}
        onLogout={() => { setUser(null); setView("dashboard"); }}
      />
    </div>
  );
}
