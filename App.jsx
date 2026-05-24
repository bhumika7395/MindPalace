import { useState, useRef, useEffect, useCallback } from "react";

// ——— COLORS ———
const C = {
  bg: "#1E1B28", deep: "#17141F", surface: "#2A2735", surfHov: "#33303F",
  border: "#3D3A4A", borderLt: "#4A4658",
  accent: "#B4A0FF", accentDim: "#9484DB", accentBg: "#2D2845",
  gold: "#FFD166", mint: "#06D6A0", coral: "#FF7E7E", sky: "#7EB8DA", pink: "#FF85A1", cyan: "#5BC0BE",
  text: "#E4E0ED", soft: "#B5B0C4", muted: "#7A7590", dim: "#555068",
  board: "#16141E",
};

const STICKY = {
  feature: { bg: "#1B3D30", color: "#8EECC4", accent: "#06D6A0" },
  problem: { bg: "#3D1B28", color: "#FFB0B0", accent: "#FF7E7E" },
  insight: { bg: "#1B2840", color: "#A8D4F0", accent: "#7EB8DA" },
  decision: { bg: "#3D3418", color: "#FFE4A0", accent: "#FFD166" },
  action: { bg: "#2D2245", color: "#D0C0FF", accent: "#B4A0FF" },
  question: { bg: "#1B3035", color: "#98E0DE", accent: "#5BC0BE" },
};
const GC = [C.accent, C.mint, C.gold, C.coral, C.sky, C.pink, C.cyan];

const FRAMEWORKS = [
  { id: "priority", name: "Priority Matrix", groups: ["Quick wins", "Big bets", "Fill-ins", "Time sinks"] },
  { id: "journey", name: "User Journey", groups: ["Discover", "Onboard", "Engage", "Retain"] },
  { id: "problem", name: "Problem Tree", groups: ["Problem", "Causes", "Effects", "Solutions"] },
  { id: "scamper", name: "SCAMPER", groups: ["Substitute", "Combine", "Adapt", "Modify", "Put to use", "Eliminate", "Reverse"] },
];
const MODES = [
  { id: "freeform", name: "Freeform" }, { id: "sixhats", name: "Six Hats" },
  { id: "scamper", name: "SCAMPER" }, { id: "5whys", name: "5 Whys" },
];

// ——— BRAIN-PALACE LOGO SVG ———
const Logo = ({ size = 28, color = C.accent }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 4C24 4 18 10 18 16c0 3 1 5 3 7-4 2-7 6-7 11 0 4 2 7 5 9-2 2-3 5-3 8 0 6 5 11 11 11h11c6 0 11-5 11-11 0-3-1-6-3-8 3-2 5-5 5-9 0-5-3-9-7-11 2-2 3-4 3-7 0-6-6-12-14-12z"
      fill={color} opacity="0.15"/>
    <path d="M32 8c-5 0-10 4-10 9 0 2.5 1 4.5 2.5 6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M32 8c5 0 10 4 10 9 0 2.5-1 4.5-2.5 6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M20 26c-3 1.5-5 4.5-5 8 0 3.5 2 6.5 5 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M44 26c3 1.5 5 4.5 5 8 0 3.5-2 6.5-5 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M22 44c-1 2-2 4-2 6.5C20 54.5 24 58 29 58h6c5 0 9-3.5 9-7.5 0-2.5-1-4.5-2-6.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M32 12v46" stroke={color} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.4"/>
    <path d="M24 20c2 4 5 7 8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <path d="M40 20c-2 4-5 7-8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <path d="M18 34c3 2 8 4 14 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <path d="M46 34c-3 2-8 4-14 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <circle cx="32" cy="28" r="3" fill={color} opacity="0.3"/>
    <circle cx="25" cy="34" r="2" fill={color} opacity="0.25"/>
    <circle cx="39" cy="34" r="2" fill={color} opacity="0.25"/>
    <circle cx="29" cy="46" r="2" fill={color} opacity="0.2"/>
    <circle cx="35" cy="46" r="2" fill={color} opacity="0.2"/>
  </svg>
);

// ——— AI (GROQ FREE TIER) ———
const GROQ_MODEL = "llama-3.3-70b-versatile";

function sysPr(mode, cards, groups, context) {
  const gl = groups.join(", ");
  return `You are MindPalace AI, a brainstorming co-pilot for PMs. Board groups: [${gl}]. Mode: ${mode}.
${context ? "PROJECT CONTEXT: " + context : ""}
${mode === "sixhats" ? "Guide through Six Thinking Hats. Say which hat." : ""}
${mode === "scamper" ? "Guide through SCAMPER letters." : ""}
${mode === "5whys" ? "Drill root causes with 5 whys." : ""}
BOARD: ${cards.length ? cards.map(c => "[" + c.tag + "] " + c.title + " (" + c.group + ")").join("; ") : "Empty."}
JSON ONLY: {"response":"2-4 sentences. Collaborative, push thinking.","cards":[{"title":"5-8 words","tag":"feature|problem|insight|decision|action|question","group":"from [${gl}]"}]}
Cards can be empty. Add 1-3 for substantive ideas. "Pin that" = extract idea. ONLY JSON. Do not wrap in markdown code fences.`;
}

async function callAI(msgs, sys, apiKey) {
  try {
    const messages = [
      { role: "system", content: sys },
      ...msgs.map(m => ({ role: m.role, content: m.content })),
    ];

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.9,
      }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      const code = err?.error?.code || r.status;
      if (code === 401 || code === "invalid_api_key") return { response: "Invalid API key. Check your Groq key in settings.", cards: [] };
      if (code === 429) return { response: "Rate limited — wait a moment and try again.", cards: [] };
      return { response: `API error (${code}). Try again?`, cards: [] };
    }

    const d = await r.json();
    const t = d.choices?.[0]?.message?.content || "";
    return JSON.parse(t.replace(/```json\s?|```/g, "").trim());
  } catch (e) {
    console.error("AI call failed:", e);
    return { response: "Connection issue — try again?", cards: [] };
  }
}

// ——— MAIN ———
export default function MindPalace() {
  const [screen, setScreen] = useState("home");
  const [apiKey, setApiKey] = useState(() => {
    try { return sessionStorage.getItem("mp_groq_key") || ""; } catch { return ""; }
  });
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [keyTesting, setKeyTesting] = useState(false);
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [projName, setProjName] = useState("Untitled Project");
  const [context, setContext] = useState("");
  const [editCtx, setEditCtx] = useState(false);
  const [mode, setMode] = useState("freeform");
  const [groups, setGroups] = useState(["Ideas", "Insights", "Actions"]);
  const [msgs, setMsgs] = useState([]);
  const [hist, setHist] = useState([]);
  const [cards, setCards] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [tool, setTool] = useState("select");
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fwOpen, setFwOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sc, setSc] = useState(null);
  const [scInput, setScInput] = useState("");
  const [scMsgs, setScMsgs] = useState([]);
  const [scTyping, setScTyping] = useState(false);

  const endRef = useRef(null);
  const scEndRef = useRef(null);
  const inRef = useRef(null);
  const scRef = useRef(null);
  const boardRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);
  useEffect(() => { scEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [scMsgs, scTyping]);
  useEffect(() => { if (sc) setTimeout(() => scRef.current?.focus(), 100); }, [sc]);

  // Validate & save API key
  const testAndSaveKey = async (key) => {
    const k = key.trim();
    if (!k) { setKeyError("Please enter an API key."); return; }
    setKeyTesting(true); setKeyError("");
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${k}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: 'Reply with exactly: {"status":"ok"}' }],
          max_tokens: 50,
        }),
      });
      if (r.ok) {
        setApiKey(k);
        try { sessionStorage.setItem("mp_groq_key", k); } catch {}
        setShowKeySetup(false); setKeyError(""); setKeyInput("");
      } else {
        const err = await r.json().catch(() => ({}));
        setKeyError(err?.error?.message || "Invalid key. Please check and try again.");
      }
    } catch { setKeyError("Network error. Check your connection."); }
    setKeyTesting(false);
  };

  const clearKey = () => {
    setApiKey("");
    try { sessionStorage.removeItem("mp_groq_key"); } catch {}
  };

  const pushC = (ac) => {
    const nc = ac.filter(c => c.title && c.tag).map((c, i) => ({
      id: Date.now() + i + Math.random(), title: c.title,
      tag: STICKY[c.tag] ? c.tag : "insight",
      group: groups.includes(c.group) ? c.group : groups[0], pinned: false,
    }));
    if (nc.length) setCards(p => [...p, ...nc]);
  };

  const aiSend = async (text, isSc = false) => {
    const msg = text.trim();
    if (!msg) return;
    if (!apiKey) { setShowKeySetup(true); return; }
    if (isSc) {
      setScMsgs(p => [...p, { role: "user", text: msg }]); setScTyping(true);
    } else {
      setMsgs(p => [...p, { role: "user", text: msg }]); setTyping(true);
    }
    const nh = [...hist, { role: "user", content: msg }];
    const r = await callAI(nh, sysPr(mode, cards, groups, context), apiKey);
    if (isSc) {
      setScMsgs(p => [...p, { role: "ai", text: r.response }]); setScTyping(false);
    } else {
      setMsgs(p => [...p, { role: "ai", text: r.response }]); setTyping(false);
    }
    setMsgs(p => {
      if (isSc) return [...p, { role: "user", text: msg }, { role: "ai", text: r.response }];
      return p;
    });
    setHist([...nh, { role: "assistant", content: JSON.stringify(r) }]);
    if (r.cards?.length) pushC(r.cards);
  };

  const send = useCallback(() => {
    if (!input.trim() || typing) return;
    aiSend(input); setInput("");
  }, [input, typing, hist, mode, cards, groups, context, apiKey]);

  const scSend = useCallback((txt) => {
    const msg = txt || scInput.trim();
    if (!msg || scTyping) return;
    setScInput(""); aiSend(msg, true);
  }, [scInput, scTyping, hist, mode, cards, groups, context, apiKey]);

  const handleBoardClick = (e) => {
    if (tool === "select" && e.detail === 2) {
      const rect = boardRef.current.getBoundingClientRect();
      setSc({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setScMsgs([]); setScInput("");
    }
  };

  const handleBoardContext = (e) => {
    e.preventDefault();
    const rect = boardRef.current.getBoundingClientRect();
    setSc({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setScMsgs([]); setScInput("");
  };

  const gc = cards.reduce((a, c) => { (a[c.group] = a[c.group] || []).push(c); return a; }, {});
  const dotGrid = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='.7' fill='%23ffffff' opacity='0.04'/%3E%3C/svg%3E")`;

  const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Instrument+Serif&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideL{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes popIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes cardIn{from{opacity:0;transform:scale(.88) rotate(-2deg)}to{opacity:1;transform:scale(1) rotate(0)}}
@keyframes tp{0%,60%{opacity:1}80%{opacity:.3}100%{opacity:1}}
@keyframes pl{0%,100%{opacity:.2}50%{opacity:.4}}
@keyframes gl{0%,100%{box-shadow:0 0 16px rgba(180,160,255,.05)}50%{box-shadow:0 0 32px rgba(180,160,255,.1)}}
.tl-btn{width:40px;height:40px;border:none;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;background:transparent;color:${C.muted};font-size:18px}
.tl-btn:hover{background:${C.surfHov};color:${C.soft}}
.tl-btn.act{background:${C.text};color:${C.deep}}
.mn-item{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:8px;cursor:pointer;transition:all .12s;font-size:13px;color:${C.soft};border:none;background:none;width:100%;text-align:left;font-family:inherit}
.mn-item:hover{background:${C.surfHov};color:${C.text}}
.mn-sep{height:1px;background:${C.border};margin:6px 10px}
.sb:hover:not(:disabled){background:${C.accentDim}!important}
.qc{transition:all .12s;cursor:pointer}.qc:hover{background:${C.accentBg}!important;color:${C.accent}!important;border-color:${C.accent}!important}
.sticky{transition:all .18s;cursor:pointer;position:relative}.sticky:hover{transform:scale(1.03);z-index:10}
.pin-d{width:8px;height:8px;border-radius:50%;position:absolute;top:-4px;left:50%;margin-left:-4px;z-index:2;border:1.5px solid rgba(0,0,0,.3)}
.ai-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:14px;font-size:10px;background:linear-gradient(135deg,#f5520420,#ff6b3520);border:1px solid #f5520430;color:#ff8a65}
`;

  // ——— API KEY SETUP MODAL ———
  const KeySetupModal = () => (
    <>
      <div onClick={() => setShowKeySetup(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 300 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 420, maxWidth: "92vw", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, zIndex: 310, boxShadow: "0 24px 80px rgba(0,0,0,.6)", animation: "popIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Logo size={24} />
          <h3 style={{ fontSize: 17, fontWeight: 600, color: C.text }}>Connect AI</h3>
        </div>
        <p style={{ fontSize: 13, color: C.soft, lineHeight: 1.6, marginBottom: 18 }}>
          MindPalace uses <span className="ai-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="#ff8a65"/></svg>
            Groq + Llama 3.3
          </span> — completely free, no credit card needed.
        </p>

        <div style={{ background: C.bg, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Get your free key in 30 seconds</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { n: "1", t: "Go to Groq Console", sub: "console.groq.com/keys", link: "https://console.groq.com/keys" },
              { n: "2", t: "Sign up or log in (free)" },
              { n: "3", t: 'Click "Create API Key"' },
              { n: "4", t: "Copy and paste it below" },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: C.accentBg, border: `1px solid ${C.accent}40`, color: C.accent, fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</span>
                <div>
                  <span style={{ fontSize: 12, color: C.text }}>{s.t}</span>
                  {s.sub && (s.link ? <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 10, color: C.mint, marginTop: 1, textDecoration: "underline" }}>{s.sub}</a> : <span style={{ display: "block", fontSize: 10, color: C.mint, marginTop: 1 }}>{s.sub}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={keyInput} onChange={e => { setKeyInput(e.target.value); setKeyError(""); }}
            onKeyDown={e => { if (e.key === "Enter") testAndSaveKey(keyInput); }}
            placeholder="Paste your Groq API key (gsk_...)"
            type="password"
            style={{ flex: 1, background: C.bg, border: `1px solid ${keyError ? C.coral : C.border}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color .15s" }}
          />
          <button onClick={() => testAndSaveKey(keyInput)} disabled={keyTesting}
            style={{ background: C.accent, border: "none", borderRadius: 10, padding: "0 20px", color: C.deep, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", opacity: keyTesting ? .6 : 1, minWidth: 80 }}>
            {keyTesting ? "Testing..." : "Connect"}
          </button>
        </div>
        {keyError && <p style={{ fontSize: 11, color: C.coral, marginTop: 2 }}>{keyError}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 00-5 5v2a2 2 0 00-1 1.73V13a2 2 0 002 2h8a2 2 0 002-2V9.73A2 2 0 0013 8V6a5 5 0 00-5-5zm-3 5a3 3 0 016 0v2H5V6z" fill={C.dim}/></svg>
          <span style={{ fontSize: 10, color: C.dim }}>Your key stays in your browser only. Never stored on any server.</span>
        </div>
      </div>
    </>
  );

  // ——— HOME ———
  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: C.deep, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{css}</style>
      <div style={{ position: "fixed", top: 50, right: 80, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(180,160,255,.04) 0%,transparent 70%)", animation: "pl 4s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: 80, left: 60, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(6,214,160,.03) 0%,transparent 70%)", animation: "pl 5s ease-in-out infinite 1.5s" }} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px", position: "relative" }}>
        <div style={{ animation: "fu .6s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <Logo size={36} />
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: C.accent }}>MindPalace</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 50, fontWeight: 400, lineHeight: 1.1, marginBottom: 14 }}>
            Your ideas deserve<br /><span style={{ color: C.accent }}>a place to live.</span>
          </h1>
          <p style={{ fontSize: 16, color: C.soft, lineHeight: 1.65, maxWidth: 440, marginBottom: 36 }}>
            AI-powered brainstorming on a spatial canvas. Grounded in cognitive science.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => {
              if (!apiKey) { setShowKeySetup(true); return; }
              setScreen("canvas"); setCards([]); setMsgs([]); setHist([]); setGroups(["Ideas", "Insights", "Actions"]); setContext(""); setProjName("Untitled Project"); setMode("freeform");
            }}
              style={{ background: C.accent, border: "none", borderRadius: 12, padding: "14px 32px", color: C.deep, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: .5, transition: "all .15s" }}>
              New Project
            </button>
            {apiKey ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="ai-badge">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.mint }} />
                  Groq connected
                </span>
                <button onClick={clearKey}
                  style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 11, fontFamily: "inherit", textDecoration: "underline" }}>Disconnect</button>
              </div>
            ) : (
              <button onClick={() => setShowKeySetup(true)}
                style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 24px", color: C.soft, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                Connect AI key
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "32px 0 48px", animation: "fu .6s ease .1s both" }}>
          {[{ l: "Cognitive load theory", c: C.accent }, { l: "Dual coding", c: C.mint }, { l: "Spatial thinking", c: C.gold }, { l: "KJ method", c: C.sky }].map(r => (
            <span key={r.l} style={{ fontSize: 10, padding: "3px 11px", borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`, color: r.c }}>{r.l}</span>
          ))}
        </div>

        <div style={{ animation: "fu .6s ease .15s both" }}>
          <div style={{ background: `linear-gradient(135deg, ${C.surface}, ${C.bg})`, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="#ff8a65"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Powered by Groq + Llama 3.3 70B</span>
              <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 8, background: C.mint + "20", color: C.mint, fontWeight: 600 }}>FREE</span>
            </div>
            <p style={{ fontSize: 12, color: C.soft, lineHeight: 1.6 }}>
              Get a free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: C.mint, textDecoration: "underline" }}>console.groq.com/keys</a> — no credit card, no charges. Your key stays in your browser.
            </p>
          </div>
        </div>

        <div style={{ animation: "fu .6s ease .25s both" }}>
          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: C.dim, marginBottom: 12, fontWeight: 500 }}>Recent projects</p>
          <div style={{ background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: C.dim, fontSize: 13 }}>No projects yet.</p>
          </div>
        </div>
      </div>

      {showKeySetup && <KeySetupModal />}
    </div>
  );

  // ——— CANVAS ———
  return (
    <div style={{ height: "100vh", background: C.deep, color: C.text, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{css}</style>

      {/* ——— TOP BAR ——— */}
      <div style={{ height: 44, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", flexShrink: 0, background: C.bg, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, padding: "4px 6px", display: "flex", alignItems: "center" }}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
          <input value={projName} onChange={e => setProjName(e.target.value)}
            style={{ background: "none", border: "none", color: C.text, fontSize: 13, fontWeight: 500, fontFamily: "inherit", outline: "none", width: 200 }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* AI status */}
          <span className="ai-badge" style={{ cursor: "pointer" }} onClick={() => setShowKeySetup(true)}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: apiKey ? C.mint : C.coral }} />
            {apiKey ? "Groq" : "No key"}
          </span>
          {/* Mode */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setModeOpen(!modeOpen)}
              style={{ background: mode !== "freeform" ? C.accentBg : C.surface, border: `1px solid ${mode !== "freeform" ? C.accent : C.border}`, color: mode !== "freeform" ? C.accent : C.muted, borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
              {MODES.find(m => m.id === mode)?.name}
            </button>
            {modeOpen && <div style={{ position: "absolute", top: 32, right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, zIndex: 200, width: 150, boxShadow: "0 12px 40px rgba(0,0,0,.5)", animation: "popIn .15s ease" }}>
              {MODES.map(m => (
                <button key={m.id} className="mn-item" onClick={() => { setMode(m.id); setModeOpen(false); }}
                  style={{ color: mode === m.id ? C.accent : C.soft, fontWeight: mode === m.id ? 500 : 400 }}>{m.name}</button>
              ))}
            </div>}
          </div>
          <button onClick={() => setShareOpen(true)}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Share</button>
          <button onClick={() => { setChatOpen(!chatOpen); setSc(null); }} title="Open AI Chat"
            style={{ background: "none", border: `1.5px solid ${chatOpen ? C.accent : C.border}`, borderRadius: 8, padding: 3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Logo size={22} color={chatOpen ? C.accent : C.muted} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* ——— LEFT TOOLBAR ——— */}
        <div style={{ width: 52, background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 4, flexShrink: 0, zIndex: 40 }}>
          {[
            { id: "select", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 1l10 6.5L8.5 9l-1 5L3 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
            { id: "sticky", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/></svg> },
            { id: "text", icon: <span style={{ fontSize: 14, fontWeight: 700 }}>T</span> },
            { id: "pen", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14l1.5-4L12 1.5 14.5 4 6 12.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
            { id: "pan", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v5M8 7l3-3M8 7L5 4M8 14V9M8 9l3 3M8 9l-3 3M2 8h5M7 8L4 5M7 8L4 11M14 8H9M9 8l3-3M9 8l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
            { id: "connector", icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 6l4 4" stroke="currentColor" strokeWidth="1.5"/></svg> },
          ].map(t => (
            <button key={t.id} className={`tl-btn ${tool === t.id ? "act" : ""}`} onClick={() => setTool(t.id)} title={t.id}>{t.icon}</button>
          ))}
          <div style={{ height: 1, width: 24, background: C.border, margin: "4px 0" }} />
          <div style={{ position: "relative" }}>
            <button className="tl-btn" onClick={() => setFwOpen(!fwOpen)} title="Frameworks" style={{ fontSize: 14 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
            </button>
            {fwOpen && <div style={{ position: "absolute", left: 50, top: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 5, zIndex: 200, width: 180, boxShadow: "0 12px 40px rgba(0,0,0,.5)", animation: "slideL .15s ease" }}>
              <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: C.dim, padding: "4px 10px", fontWeight: 500 }}>Apply framework</p>
              {FRAMEWORKS.map(f => (
                <button key={f.id} className="mn-item" onClick={() => { setGroups(f.groups); setFwOpen(false); }}>{f.name}</button>
              ))}
              <button className="mn-item" onClick={() => { setGroups(["Ideas", "Insights", "Actions"]); setFwOpen(false); }}>Freeform</button>
            </div>}
          </div>
        </div>

        {/* ——— CANVAS ——— */}
        <div ref={boardRef} onClick={handleBoardClick} onContextMenu={handleBoardContext}
          style={{ flex: 1, overflow: "auto", background: C.board, backgroundImage: dotGrid, backgroundSize: "20px 20px", position: "relative", padding: "20px 28px", cursor: tool === "pan" ? "grab" : tool === "pen" ? "crosshair" : "default" }}>

          {/* Context block */}
          <div style={{ maxWidth: 600, margin: "0 auto 24px", animation: "fu .3s ease" }}>
            {!editCtx ? (
              <div onClick={() => setEditCtx(true)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", transition: "all .15s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: context ? 6 : 0 }}>
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: C.dim, fontWeight: 500 }}>Project context</span>
                  <span style={{ fontSize: 10, color: C.dim }}>Click to edit</span>
                </div>
                {context ? <p style={{ fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{context}</p>
                  : <p style={{ fontSize: 13, color: C.dim, fontStyle: "italic" }}>Define your goal, target user, constraints...</p>}
              </div>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.accent}`, borderRadius: 10, padding: "12px 16px" }}>
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: C.accent, fontWeight: 500, display: "block", marginBottom: 6 }}>Project context</span>
                <textarea value={context} onChange={e => setContext(e.target.value)} autoFocus rows={3}
                  placeholder="What are you building? Who is it for? What's the goal? Any constraints?"
                  style={{ width: "100%", background: "transparent", border: "none", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.5 }} />
                <button onClick={() => setEditCtx(false)}
                  style={{ marginTop: 6, background: C.accent, border: "none", borderRadius: 6, padding: "4px 14px", color: C.deep, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
              </div>
            )}
          </div>

          {/* Cards */}
          {!cards.length ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "45%", opacity: .3 }}>
              <Logo size={48} color={C.accent} />
              <p style={{ fontSize: 14, color: C.soft, textAlign: "center", maxWidth: 240, lineHeight: 1.5, marginTop: 12 }}>Right-click to chat with AI here, or click the logo to open the chat panel.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: Object.keys(gc).length > 4 ? "repeat(auto-fill,minmax(145px,1fr))" : Object.keys(gc).length > 2 ? "repeat(auto-fill,minmax(180px,1fr))" : "repeat(auto-fill,minmax(220px,1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
              {Object.entries(gc).map(([group, gCards], gi) => (
                <div key={group} style={{ animation: `fu .35s ease ${gi * .06}s both` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, color: GC[gi % GC.length], marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: GC[gi % GC.length], opacity: .6 }} />
                    {group}
                    <span style={{ fontWeight: 400, color: C.dim, fontSize: 10 }}>({gCards.length})</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {gCards.map((card, ci) => {
                      const st = STICKY[card.tag] || STICKY.insight;
                      return (
                        <div key={card.id} className="sticky"
                          style={{ background: st.bg, borderRadius: 3, padding: "14px 12px 10px", animation: `cardIn .3s ease ${ci * .05}s both`,
                            boxShadow: `2px 3px 8px rgba(0,0,0,.2)`, borderTop: `3px solid ${st.accent}` }}>
                          <div className="pin-d" style={{ background: st.accent }} />
                          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.35, color: st.color, marginBottom: 6 }}>{card.title}</div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,.2)", color: st.accent, textTransform: "uppercase", letterSpacing: .5 }}>{card.tag}</span>
                            <button onClick={() => setCards(p => p.filter(c => c.id !== card.id))}
                              style={{ background: "none", border: "none", color: st.accent, cursor: "pointer", fontSize: 11, padding: 0, opacity: .4 }}>x</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ——— SMART CURSOR CHAT ——— */}
          {sc && (
            <div style={{
              position: "absolute", left: Math.min(sc.x, (boardRef.current?.offsetWidth || 600) - 310), top: sc.y,
              width: 300, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
              boxShadow: "0 16px 48px rgba(0,0,0,.5), 0 0 30px rgba(180,160,255,.05)",
              zIndex: 100, animation: "popIn .2s ease", display: "flex", flexDirection: "column", maxHeight: 340,
            }}>
              <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Logo size={16} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: C.accent }}>Smart Cursor</span>
                </div>
                <button onClick={() => setSc(null)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>x</button>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: "8px 10px", maxHeight: 180 }}>
                {!scMsgs.length && <p style={{ fontSize: 11, color: C.dim, textAlign: "center", padding: "8px 0" }}>Ask anything or pick a quick action.</p>}
                {scMsgs.map((m, i) => (
                  <div key={i} style={{ marginBottom: 6, display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", animation: "fu .15s" }}>
                    <div style={{ maxWidth: "85%", padding: "6px 10px", fontSize: 11, lineHeight: 1.5,
                      borderRadius: m.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                      background: m.role === "user" ? C.accent : C.bg,
                      color: m.role === "user" ? C.deep : C.soft,
                      border: m.role === "ai" ? `1px solid ${C.border}` : "none", whiteSpace: "pre-line",
                    }}>{m.text}</div>
                  </div>
                ))}
                {scTyping && <div style={{ display: "flex", gap: 3, padding: "4px 0" }}>{[0,1,2].map(d => <div key={d} style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent, opacity: .5, animation: `tp 1.2s ease-in-out ${d*.2}s infinite` }} />)}</div>}
                <div ref={scEndRef} />
              </div>
              <div style={{ padding: "3px 8px 5px", display: "flex", gap: 3, flexWrap: "wrap" }}>
                {["What's missing?", "Add ideas", "Challenge this", "Summarize"].map(q => (
                  <button key={q} className="qc" onClick={() => scSend(q)}
                    style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 12, padding: "2px 8px", color: C.dim, fontSize: 9, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
                ))}
              </div>
              <div style={{ padding: "5px 8px 8px", display: "flex", gap: 5 }}>
                <input ref={scRef} value={scInput} onChange={e => setScInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); scSend(); } }}
                  placeholder="Ask the board..." disabled={scTyping}
                  style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.text, fontSize: 11, fontFamily: "inherit", outline: "none" }} />
                <button onClick={() => scSend()} disabled={scTyping || !scInput.trim()}
                  style={{ background: C.accent, border: "none", borderRadius: 8, padding: "0 10px", color: C.deep, cursor: "pointer", fontWeight: 600, fontSize: 12, opacity: scTyping || !scInput.trim() ? .4 : 1 }}>{"\u2191"}</button>
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div style={{ position: "fixed", bottom: 16, left: 68, display: "flex", flexDirection: "column", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", zIndex: 40 }}>
            {["+", "\u2212", "\u2b1c"].map((z, i) => (
              <button key={i} style={{ width: 32, height: 32, border: "none", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", background: "transparent", color: C.muted, cursor: "pointer", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>{z}</button>
            ))}
          </div>
        </div>

        {/* ——— CHAT OVERLAY ——— */}
        {chatOpen && (
          <div style={{ width: 360, background: C.bg, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, animation: "slideR .2s ease", zIndex: 45 }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Logo size={20} />
                <span style={{ fontSize: 13, fontWeight: 500, color: C.accent }}>MindPalace Chat</span>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 15 }}>x</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "14px 12px" }}>
              {!msgs.length && <p style={{ fontSize: 12, color: C.dim, textAlign: "center", padding: "20px 0" }}>Start a conversation. The AI knows your board context.</p>}
              {msgs.map((m, i) => (
                <div key={i} style={{ marginBottom: 10, display: "flex", gap: 8, flexDirection: m.role === "user" ? "row-reverse" : "row", animation: "fu .2s" }}>
                  {m.role === "ai" && <div style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2 }}><Logo size={22} /></div>}
                  <div style={{ maxWidth: "82%", padding: "9px 13px", fontSize: 13, lineHeight: 1.6,
                    borderRadius: m.role === "user" ? "13px 13px 3px 13px" : "13px 13px 13px 3px",
                    background: m.role === "user" ? C.accent : C.surface,
                    color: m.role === "user" ? C.deep : C.soft,
                    border: m.role === "ai" ? `1px solid ${C.border}` : "none", whiteSpace: "pre-line",
                  }}>{m.text}</div>
                </div>
              ))}
              {typing && <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 22, height: 22, flexShrink: 0 }}><Logo size={22} /></div>
                <div style={{ padding: "9px 13px", borderRadius: "13px 13px 13px 3px", background: C.surface, border: `1px solid ${C.border}`, display: "flex", gap: 3, alignItems: "center" }}>
                  {[0,1,2].map(d => <div key={d} style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent, opacity: .5, animation: `tp 1.2s ease-in-out ${d*.2}s infinite` }} />)}
                </div>
              </div>}
              <div ref={endRef} />
            </div>
            <div style={{ padding: "8px 12px", borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input ref={inRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Type your thoughts..." disabled={typing}
                  style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                <button className="sb" onClick={send} disabled={typing || !input.trim()}
                  style={{ background: C.accent, border: "none", borderRadius: 10, padding: "0 16px", color: C.deep, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit", opacity: typing || !input.trim() ? .4 : 1 }}>Send</button>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                {["Pin that", "What's missing?", "Prioritize", "Challenge me"].map(q => (
                  <button key={q} className="qc" onClick={() => { setInput(q); setTimeout(() => inRef.current?.focus(), 50); }}
                    style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 14, padding: "2px 9px", color: C.dim, fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ——— HAMBURGER MENU ——— */}
        {menuOpen && <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 150 }} />
          <div style={{ position: "fixed", top: 44, left: 0, width: 240, background: C.surface, border: `1px solid ${C.border}`, borderRadius: "0 12px 12px 0", padding: "6px 4px", zIndex: 200, boxShadow: "0 12px 40px rgba(0,0,0,.5)", animation: "slideL .15s ease" }}>
            <button className="mn-item" onClick={() => { setScreen("home"); setMenuOpen(false); }}>{"\u2190"} All projects</button>
            <button className="mn-item" onClick={() => { setShareOpen(true); setMenuOpen(false); }}>{"\u2197"} Share</button>
            <button className="mn-item" onClick={() => setMenuOpen(false)}>{"\u2913"} Export as PDF</button>
            <button className="mn-item" onClick={() => setMenuOpen(false)}>{"\u29C9"} Duplicate project</button>
            <div className="mn-sep" />
            <button className="mn-item" onClick={() => { setEditCtx(true); setMenuOpen(false); }}>{"\u270E"} Edit context</button>
            <button className="mn-item" onClick={() => { setShowKeySetup(true); setMenuOpen(false); }}>{"\u2699"} AI Settings</button>
            <button className="mn-item" onClick={() => setMenuOpen(false)}>? Help</button>
            <div className="mn-sep" />
            <button className="mn-item" onClick={() => { setScreen("home"); setMenuOpen(false); }} style={{ color: C.coral }}>{"\u2717"} Delete project</button>
          </div>
        </>}

        {/* ——— SHARE MODAL ——— */}
        {shareOpen && <>
          <div onClick={() => setShareOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 150 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 380, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, zIndex: 200, boxShadow: "0 20px 60px rgba(0,0,0,.5)", animation: "popIn .2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Share board</h3>
              <button onClick={() => setShareOpen(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>x</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input placeholder="Enter email to invite..." style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              <button style={{ background: C.accent, border: "none", borderRadius: 8, padding: "0 16px", color: C.deep, fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Invite</button>
            </div>
            <div style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.soft }}>mindpalace.app/b/xk7f2...</span>
              <button style={{ background: C.accentBg, border: `1px solid ${C.accent}40`, borderRadius: 6, padding: "4px 12px", color: C.accent, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Copy link</button>
            </div>
            <p style={{ fontSize: 11, color: C.dim, marginTop: 10 }}>Anyone with the link can view. Invite to give edit access.</p>
          </div>
        </>}
      </div>

      {showKeySetup && <KeySetupModal />}
    </div>
  );
}
