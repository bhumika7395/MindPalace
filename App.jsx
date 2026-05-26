import { useState, useRef, useEffect, useCallback } from "react";

// ——— CONSTANTS ———
const C = {
  bg:"#1E1B28",deep:"#17141F",surface:"#2A2735",surfHov:"#33303F",
  border:"#3D3A4A",borderLt:"#4A4658",
  accent:"#B4A0FF",accentDim:"#9484DB",accentBg:"#2D2845",
  gold:"#FFD166",mint:"#06D6A0",coral:"#FF7E7E",sky:"#7EB8DA",pink:"#FF85A1",cyan:"#5BC0BE",
  text:"#E4E0ED",soft:"#B5B0C4",muted:"#7A7590",dim:"#555068",
  board:"#16141E",
};
const STICKY = {
  feature:{bg:"#1B3D30",color:"#8EECC4",accent:"#06D6A0"},
  problem:{bg:"#3D1B28",color:"#FFB0B0",accent:"#FF7E7E"},
  insight:{bg:"#1B2840",color:"#A8D4F0",accent:"#7EB8DA"},
  decision:{bg:"#3D3418",color:"#FFE4A0",accent:"#FFD166"},
  action:{bg:"#2D2245",color:"#D0C0FF",accent:"#B4A0FF"},
  question:{bg:"#1B3035",color:"#98E0DE",accent:"#5BC0BE"},
};
const GC = [C.accent,C.mint,C.gold,C.coral,C.sky,C.pink,C.cyan];
const FRAMEWORKS = [
  {id:"priority",name:"Priority Matrix",desc:"What to build first — impact vs effort",groups:["Quick wins","Big bets","Fill-ins","Time sinks"],mode:"freeform"},
  {id:"journey",name:"User Journey",desc:"Map how users experience your product",groups:["Discover","Onboard","Engage","Retain"],mode:"freeform"},
  {id:"problem",name:"Problem Tree",desc:"Drill into root causes and solutions",groups:["Problem","Causes","Effects","Solutions"],mode:"5whys"},
  {id:"scamper",name:"SCAMPER",desc:"Improve ideas using 7 creative lenses",groups:["Substitute","Combine","Adapt","Modify","Put to use","Eliminate","Reverse"],mode:"scamper"},
  {id:"sixhats",name:"Six Thinking Hats",desc:"Explore all perspectives systematically",groups:["Facts","Feelings","Risks","Benefits","Ideas","Process"],mode:"sixhats"},
  {id:"5whys",name:"5 Whys",desc:"Drill to root causes step by step",groups:["Problem","Why 1","Why 2","Why 3","Root Cause"],mode:"5whys"},
];

const LOGO_SRC="data:image/png;base64,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";
const Logo = ({size=28,active=false}) => (<img src={LOGO_SRC} width={size} height={size} alt="MindPalace" style={{pointerEvents:"none",filter:active?"invert(72%) sepia(40%) saturate(800%) hue-rotate(215deg) brightness(110%)":"invert(50%) sepia(15%) saturate(400%) hue-rotate(215deg) brightness(85%)"}}/>);

// ——— AI (via Vercel proxy) ———
function sysPr(mode,cards,groups,context) {
  const gl=groups.join(", ");
  return `You are MindPalace AI, a brainstorming co-pilot for PMs. Board groups: [${gl}]. Mode: ${mode}.
${context?"PROJECT CONTEXT: "+context:""}
${mode==="sixhats"?"Guide through Six Thinking Hats. Say which hat.":""}${mode==="scamper"?"Guide through SCAMPER letters.":""}${mode==="5whys"?"Drill root causes with 5 whys.":""}
BOARD: ${cards.length?cards.map(c=>"["+c.tag+"] "+c.title).join("; "):"Empty."}
JSON ONLY: {"response":"2-4 sentences. Collaborative, push thinking.","cards":[{"title":"5-8 words","tag":"feature|problem|insight|decision|action|question","group":"from [${gl}]"}]}
Cards can be empty. Add 1-3 for substantive ideas. "Pin that" = extract idea. ONLY JSON.`;
}
async function callAI(msgs,sys) {
  try {
    const apiKey = localStorage.getItem("groq-api-key");
    if(!apiKey) return {response:"Please set your Groq API key in settings first.",cards:[]};
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
      body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:1000,messages:[{role:"system",content:sys},...msgs]})
    });
    const d = await r.json();
    if(d.error) return {response:"API error: "+d.error.message,cards:[]};
    const t = d.choices?.[0]?.message?.content||"";
    return JSON.parse(t.replace(/```json\s?|```/g,"").trim());
  } catch(e){ return {response:"Connection issue — try again?",cards:[]}; }
}

// ——— STORAGE (localStorage for Vercel) ———
async function saveProject(id,data) {
  try {
    localStorage.setItem(`project:${id}`,JSON.stringify(data));
    let list=[];
    try { list=JSON.parse(localStorage.getItem("projects-list"))||[]; } catch(e){ list=[]; }
    const idx=list.findIndex(p=>p.id===id);
    const entry={id,name:data.projName,updatedAt:Date.now(),cardCount:data.cards?.length||0};
    if(idx>=0)list[idx]=entry; else list.unshift(entry);
    localStorage.setItem("projects-list",JSON.stringify(list));
  } catch(e){ console.error("Save failed:",e); }
}
async function loadProject(id) {
  try { return JSON.parse(localStorage.getItem(`project:${id}`)); } catch(e){ return null; }
}
async function loadProjectList() {
  try { return JSON.parse(localStorage.getItem("projects-list"))||[]; } catch(e){ return []; }
}
async function deleteProject(id) {
  try {
    localStorage.removeItem(`project:${id}`);
    let list=[];
    try { list=JSON.parse(localStorage.getItem("projects-list"))||[]; } catch(e){}
    list=list.filter(p=>p.id!==id);
    localStorage.setItem("projects-list",JSON.stringify(list));
  } catch(e){}
}

// ——— MAIN COMPONENT ———
export default function MindPalace() {
  const [screen,setScreen]=useState("home");
  const [apiKey,setApiKey]=useState(()=>localStorage.getItem("groq-api-key")||"");
  const [showKeySetup,setShowKeySetup]=useState(false);
  const [keyInput,setKeyInput]=useState("");
  const [projId,setProjId]=useState(null);
  const [projName,setProjName]=useState("Untitled Project");
  const [context,setContext]=useState("");
  const [editCtx,setEditCtx]=useState(false);
  const [mode,setMode]=useState("freeform");
  const [groups,setGroups]=useState(["Ideas","Insights","Actions"]);
  const [activeFramework,setActiveFramework]=useState("Freeform");
  const [msgs,setMsgs]=useState([]);
  const [hist,setHist]=useState([]);
  const [cards,setCards]=useState([]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [tool,setTool]=useState("select");
  const [chatOpen,setChatOpen]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [fwOpen,setFwOpen]=useState(false);
  const [shareOpen,setShareOpen]=useState(false);
  const [showOnboard,setShowOnboard]=useState(true);
  const [sc,setSc]=useState(null);
  const [scInput,setScInput]=useState("");
  const [scMsgs,setScMsgs]=useState([]);
  const [scTyping,setScTyping]=useState(false);
  const [dragging,setDragging]=useState(null);
  const [conns,setConns]=useState([]);
  const [connStart,setConnStart]=useState(null);
  const [strokes,setStrokes]=useState([]);
  const [drawing,setDrawing]=useState(false);
  const [texts,setTexts]=useState([]);
  const [editingText,setEditingText]=useState(null);
  const [editingCard,setEditingCard]=useState(null);
  const [projectList,setProjectList]=useState([]);
  const [loadingProjects,setLoadingProjects]=useState(true);

  const endRef=useRef(null);const scEndRef=useRef(null);const inRef=useRef(null);const scRef=useRef(null);const boardRef=useRef(null);
  const nextPos=useRef({x:80,y:160});
  const saveTimer=useRef(null);
  const exchCount=useRef(0);
  const ctxDone=useRef(false);

  const saveApiKey=(key)=>{localStorage.setItem("groq-api-key",key);setApiKey(key);setShowKeySetup(false);setKeyInput("");};

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  useEffect(()=>{scEndRef.current?.scrollIntoView({behavior:"smooth"});},[scMsgs,scTyping]);
  useEffect(()=>{if(sc)setTimeout(()=>scRef.current?.focus(),100);},[sc]);
  useEffect(()=>{loadProjectList().then(l=>{setProjectList(l);setLoadingProjects(false);});},[]);

  // Auto-save
  useEffect(()=>{
    if(screen!=="canvas"||!projId)return;
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{
      saveProject(projId,{projName,context,mode,groups,activeFramework,cards,conns,strokes,texts,msgs,hist});
    },1500);
    return ()=>{if(saveTimer.current)clearTimeout(saveTimer.current);};
  },[cards,conns,strokes,texts,context,projName,msgs,screen,projId]);

  const getPos=()=>{const p={...nextPos.current};nextPos.current.x+=195+Math.random()*30;if(nextPos.current.x>700){nextPos.current.x=80+Math.random()*60;nextPos.current.y+=150;}return p;};
  const pushC=(ac)=>{const nc=ac.filter(c=>c.title&&c.tag).map((c,i)=>{const p=getPos();return{id:Date.now()+i+Math.random(),title:c.title,tag:STICKY[c.tag]?c.tag:"insight",group:groups.includes(c.group)?c.group:groups[0],x:p.x,y:p.y};});if(nc.length)setCards(p=>[...p,...nc]);};

  const aiSend=async(text,isSc=false)=>{
    const msg=text.trim();if(!msg)return;
    if(isSc){setScMsgs(p=>[...p,{role:"user",text:msg}]);setScTyping(true);}
    else{setMsgs(p=>[...p,{role:"user",text:msg}]);setTyping(true);}
    const nh=[...hist,{role:"user",content:msg}];
    const r=await callAI(nh,sysPr(mode,cards,groups,context));
    if(isSc){setScMsgs(p=>[...p,{role:"ai",text:r.response}]);setScTyping(false);}
    else{setMsgs(p=>[...p,{role:"ai",text:r.response}]);setTyping(false);}
    if(isSc)setMsgs(p=>[...p,{role:"user",text:msg},{role:"ai",text:r.response}]);
    const uh=[...nh,{role:"assistant",content:JSON.stringify(r)}];
    setHist(uh);
    if(r.cards?.length)pushC(r.cards);
    exchCount.current+=1;
    if(!context&&exchCount.current>=2&&!ctxDone.current){
      ctxDone.current=true;
      try{const cr=await callAI([{role:"user",content:"Based on this brainstorm, write 1-2 sentence project context. Conversation: "+uh.filter(h=>h.role==="user").map(h=>h.content).join(". ")+"\nJSON ONLY: {\"context\":\"your summary\"}."}],"Extract project context. JSON only: {\"context\":\"1-2 sentence summary\"}. No markdown.");
        if(cr.context)setContext(cr.context);
      }catch(e){}
    }
  };
  const send=useCallback(()=>{if(!input.trim()||typing)return;aiSend(input);setInput("");},[input,typing,hist,mode,cards,groups,context]);
  const scSend=useCallback((txt)=>{const msg=txt||scInput.trim();if(!msg||scTyping)return;setScInput("");aiSend(msg,true);},[scInput,scTyping,hist,mode,cards,groups,context]);

  const getXY=(e)=>{const rect=boardRef.current.getBoundingClientRect();return{x:e.clientX-rect.left+boardRef.current.scrollLeft,y:e.clientY-rect.top+boardRef.current.scrollTop};};

  const handleBoardClick=(e)=>{
    if(e.target.closest("[data-card]")||e.target.closest("[data-ui]"))return;
    const{x,y}=getXY(e);
    if(tool==="sticky"){const id=Date.now();setCards(p=>[...p,{id,title:"",tag:"insight",group:groups[0],x:x-75,y:y-25}]);setEditingCard(id);}
    else if(tool==="text"){const id=Date.now();setTexts(p=>[...p,{id,x,y,text:""}]);setEditingText(id);}
    if(connStart)setConnStart(null);
  };
  const handleBoardContext=(e)=>{e.preventDefault();const{x,y}=getXY(e);setSc({x,y});setScMsgs([]);setScInput("");};
  const handleBoardDblClick=(e)=>{if(e.target.closest("[data-card]")||e.target.closest("[data-ui]"))return;handleBoardContext(e);};
  const handlePenDown=(e)=>{if(tool!=="pen"||e.target.closest("[data-card]")||e.target.closest("[data-ui]"))return;const{x,y}=getXY(e);setDrawing(true);setStrokes(p=>[...p,{points:[{x,y}]}]);};
  const handlePenMove=(e)=>{if(!drawing||tool!=="pen")return;const{x,y}=getXY(e);setStrokes(p=>{const c=[...p];c[c.length-1]={points:[...c[c.length-1].points,{x,y}]};return c;});};

  const startDrag=(e,id)=>{
    e.stopPropagation();
    if(tool==="connector"){if(!connStart)setConnStart(id);else{if(connStart!==id)setConns(p=>[...p,{from:connStart,to:id}]);setConnStart(null);}return;}
    if(tool!=="select")return;const card=cards.find(c=>c.id===id);const{x,y}=getXY(e);setDragging({id,ox:x-card.x,oy:y-card.y});
  };
  const onDrag=(e)=>{if(!dragging)return;const{x,y}=getXY(e);setCards(p=>p.map(c=>c.id===dragging.id?{...c,x:x-dragging.ox,y:y-dragging.oy}:c));};

  const newProject=()=>{const id="p"+Date.now();setProjId(id);setScreen("canvas");setCards([]);setConns([]);setStrokes([]);setTexts([]);setMsgs([]);setHist([]);setGroups(["Ideas","Insights","Actions"]);setContext("");setProjName("Untitled Project");setMode("freeform");setActiveFramework("Freeform");setShowOnboard(true);nextPos.current={x:80,y:160};exchCount.current=0;ctxDone.current=false;};
  const openProject=async(id)=>{const data=await loadProject(id);if(!data)return;setProjId(id);setProjName(data.projName||"Project");setContext(data.context||"");setMode(data.mode||"freeform");setGroups(data.groups||["Ideas","Insights","Actions"]);setActiveFramework(data.activeFramework||"Freeform");setCards(data.cards||[]);setConns(data.conns||[]);setStrokes(data.strokes||[]);setTexts(data.texts||[]);setMsgs(data.msgs||[]);setHist(data.hist||[]);setShowOnboard(false);setScreen("canvas");const my=Math.max(...(data.cards||[]).map(c=>c.y),140);nextPos.current={x:80,y:my+150};};
  const delProject=async(id)=>{await deleteProject(id);setProjectList(p=>p.filter(x=>x.id!==id));};

  const dotGrid=`url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='.7' fill='%23ffffff' opacity='0.04'/%3E%3C/svg%3E")`;
  const css=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=Instrument+Serif&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes sR{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}@keyframes sL{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}@keyframes pop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}@keyframes cI{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}@keyframes tp{0%,60%{opacity:1}80%{opacity:.3}100%{opacity:1}}@keyframes pl{0%,100%{opacity:.2}50%{opacity:.4}}.mi{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:8px;cursor:pointer;transition:all .12s;font-size:13px;color:${C.soft};border:none;background:none;width:100%;text-align:left;font-family:inherit}.mi:hover{background:${C.surfHov};color:${C.text}}.ms{height:1px;background:${C.border};margin:6px 10px}.qc{transition:all .12s;cursor:pointer}.qc:hover{background:${C.accentBg}!important;color:${C.accent}!important;border-color:${C.accent}!important}.sc{cursor:grab;position:absolute;user-select:none;transition:box-shadow .15s}.sc:hover{box-shadow:0 8px 24px rgba(0,0,0,.35)!important;z-index:20}.sc:active{cursor:grabbing}.pj{transition:all .15s;cursor:pointer;border:1px solid ${C.border}}.pj:hover{border-color:${C.accent};transform:translateY(-2px);box-shadow:0 8px 24px rgba(180,160,255,.08)}.tb{width:40px;height:40px;border:none;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;background:transparent;color:${C.muted}}.tb:hover{background:${C.surfHov};color:${C.soft}}.tb.act{background:${C.text};color:${C.deep}}`;

  // ——— HOME ———
  if(screen==="home")return(
    <div style={{minHeight:"100vh",background:C.deep,color:C.text,fontFamily:"'DM Sans',sans-serif"}}><style>{css}</style>
      <div style={{position:"fixed",top:50,right:80,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(180,160,255,.04) 0%,transparent 70%)",animation:"pl 4s ease-in-out infinite"}}/>
      <div style={{maxWidth:720,margin:"0 auto",padding:"56px 24px",position:"relative"}}>
        <div style={{animation:"fu .6s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}><Logo size={36} active/><span style={{fontSize:15,fontWeight:600,letterSpacing:2.5,textTransform:"uppercase",color:C.accent}}>MindPalace</span></div>
          <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:50,fontWeight:400,lineHeight:1.1,marginBottom:14}}>Your ideas deserve<br/><span style={{color:C.accent}}>a place to live.</span></h1>
          <p style={{fontSize:16,color:C.soft,lineHeight:1.65,maxWidth:440,marginBottom:36}}>AI-powered brainstorming on a spatial canvas. Grounded in cognitive science.</p>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button onClick={()=>{if(!apiKey){setShowKeySetup(true);setKeyInput("");}else{newProject();}}} style={{background:C.accent,border:"none",borderRadius:12,padding:"14px 32px",color:C.deep,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>New Project</button>
            {apiKey?<span style={{fontSize:11,color:C.mint,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:C.mint}}/>AI connected</span>
            :<button onClick={()=>{setShowKeySetup(true);setKeyInput("");}} style={{background:C.surface,border:"1px solid "+C.border,borderRadius:12,padding:"14px 20px",color:C.soft,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Set up AI key (free)</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",margin:"32px 0 48px",animation:"fu .6s ease .1s both"}}>
          {[{l:"Cognitive load theory",c:C.accent},{l:"Dual coding",c:C.mint},{l:"Spatial thinking",c:C.gold},{l:"KJ method",c:C.sky}].map(r=><span key={r.l} style={{fontSize:10,padding:"3px 11px",borderRadius:16,background:C.surface,border:`1px solid ${C.border}`,color:r.c}}>{r.l}</span>)}
        </div>
        <div style={{animation:"fu .6s ease .25s both"}}>
          <p style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:C.dim,marginBottom:12,fontWeight:500}}>Recent projects</p>
          {loadingProjects?<p style={{color:C.dim,fontSize:13}}>Loading...</p>
          :projectList.length===0?<div style={{background:C.surface,border:`1px dashed ${C.border}`,borderRadius:12,padding:32,textAlign:"center"}}><p style={{color:C.dim,fontSize:13}}>No projects yet.</p></div>
          :<div style={{display:"flex",flexDirection:"column",gap:8}}>
            {projectList.map((p,i)=><div key={p.id} className="pj" onClick={()=>openProject(p.id)} style={{background:C.surface,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",animation:`fu .3s ease ${i*.05}s both`}}>
              <div><div style={{fontSize:14,fontWeight:500,marginBottom:2}}>{p.name}</div><div style={{fontSize:11,color:C.dim}}>{p.cardCount||0} cards · {new Date(p.updatedAt).toLocaleDateString()}</div></div>
              <button onClick={e=>{e.stopPropagation();delProject(p.id);}} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:13,padding:"4px 8px"}}>×</button>
            </div>)}
          </div>}
        </div>
        {/* API KEY SETUP MODAL */}
        {showKeySetup&&<><div onClick={()=>setShowKeySetup(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:150}}/><div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:420,background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:28,zIndex:200,boxShadow:"0 20px 60px rgba(0,0,0,.5)",animation:"pop .2s"}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:4}}>Connect Groq AI</h3>
          <p style={{fontSize:12,color:C.muted,marginBottom:16,lineHeight:1.5}}>MindPalace uses Groq's free AI API. Get your key in 30 seconds — no credit card needed.</p>
          <div style={{background:C.bg,borderRadius:8,padding:"12px 14px",marginBottom:14,border:`1px solid ${C.border}`}}>
            <p style={{fontSize:11,color:C.soft,marginBottom:8,lineHeight:1.6}}>
              <span style={{color:C.accent,fontWeight:600}}>1.</span> Go to <a href="https://console.groq.com" target="_blank" rel="noopener" style={{color:C.accent,textDecoration:"underline"}}>console.groq.com</a> and sign up (free)<br/>
              <span style={{color:C.accent,fontWeight:600}}>2.</span> Click "API Keys" in the sidebar<br/>
              <span style={{color:C.accent,fontWeight:600}}>3.</span> Click "Create API Key" and copy it
            </p>
          </div>
          <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} placeholder="Paste your Groq API key here (starts with gsk_...)" style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginBottom:12}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowKeySetup(false)} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 0",color:C.soft,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={()=>{if(keyInput.trim())saveApiKey(keyInput.trim());}} disabled={!keyInput.trim()} style={{flex:1,background:C.accent,border:"none",borderRadius:10,padding:"10px 0",color:C.deep,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:keyInput.trim()?1:.4}}>Save key</button>
          </div>
          {apiKey&&<button onClick={()=>{localStorage.removeItem("groq-api-key");setApiKey("");setShowKeySetup(false);}} style={{width:"100%",marginTop:8,background:"none",border:"none",color:C.coral,fontSize:11,cursor:"pointer",fontFamily:"inherit",padding:4}}>Remove saved key</button>}
        </div></>}
      </div>
    </div>
  );

  // ——— CANVAS ———
  return(
    <div style={{height:"100vh",background:C.deep,color:C.text,fontFamily:"'DM Sans',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}} onMouseUp={()=>{setDragging(null);setDrawing(false);}} onMouseLeave={()=>{setDragging(null);setDrawing(false);}}>
      <style>{css}</style>
      {/* TOP BAR */}
      <div style={{height:44,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px",flexShrink:0,background:C.bg,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={e=>{e.stopPropagation();setMenuOpen(!menuOpen);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:"4px 6px",display:"flex"}}><svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></button>
          <input value={projName} onChange={e=>setProjName(e.target.value)} style={{background:"none",border:"none",color:C.text,fontSize:13,fontWeight:500,fontFamily:"inherit",outline:"none",width:180}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:11,padding:"4px 10px",borderRadius:7,background:C.accentBg,color:C.accent,border:`1px solid ${C.accent}40`}}>{activeFramework}</span>
          <button onClick={()=>setShareOpen(true)} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.muted,borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Share</button>
          <button onClick={e=>{e.stopPropagation();setChatOpen(p=>!p);setSc(null);}} style={{background:chatOpen?C.accentBg:"transparent",border:`2px solid ${chatOpen?C.accent:C.border}`,borderRadius:10,padding:4,cursor:"pointer",display:"flex",width:36,height:36,alignItems:"center",justifyContent:"center",zIndex:55}}><Logo size={22} active={chatOpen}/></button>
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden",position:"relative"}}>
        {/* TOOLBAR */}
        <div style={{width:62,background:C.bg,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0",gap:2,flexShrink:0,zIndex:40}}>
          {[{id:"select",label:"Select",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 1l10 6.5L8.5 9l-1 5L3 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>},
            {id:"sticky",label:"Card",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/></svg>},
            {id:"text",label:"Text",icon:<span style={{fontSize:14,fontWeight:700}}>T</span>},
            {id:"pen",label:"Draw",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14l1.5-4L12 1.5 14.5 4 6 12.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>},
            {id:"pan",label:"Pan",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v5M8 7l3-3M8 7L5 4M8 14V9M8 9l3 3M8 9l-3 3M2 8h5M7 8L4 5M7 8L4 11M14 8H9M9 8l3-3M9 8l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>},
            {id:"connector",label:"Link",icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 6l4 4" stroke="currentColor" strokeWidth="1.5"/></svg>},
          ].map(t=><button key={t.id} onClick={()=>{setTool(t.id);setConnStart(null);}} title={t.label} style={{width:52,height:46,border:"none",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,cursor:"pointer",transition:"all .15s",background:tool===t.id?C.text:"transparent",color:tool===t.id?C.deep:C.muted,fontFamily:"inherit"}}>{t.icon}<span style={{fontSize:8,fontWeight:500}}>{t.label}</span></button>)}
          <div style={{height:1,width:24,background:C.border,margin:"4px 0"}}/>
          {strokes.length>0&&<button className="tb" onClick={()=>setStrokes(p=>p.slice(0,-1))} title="Undo stroke"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l-3 3 3 3M1 9h10a4 4 0 000-8H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
          <div style={{position:"relative"}}>
            <button className="tb" onClick={()=>setFwOpen(!fwOpen)} title="Frameworks"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg></button>
            {fwOpen&&<div style={{position:"absolute",left:50,top:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:5,zIndex:200,width:240,boxShadow:"0 12px 40px rgba(0,0,0,.5)",animation:"sL .15s"}}>
              <p style={{fontSize:9,textTransform:"uppercase",letterSpacing:1.5,color:C.dim,padding:"4px 10px",fontWeight:500}}>Apply framework</p>
              {FRAMEWORKS.map(f=><button key={f.id} className="mi" onClick={()=>{setGroups(f.groups);setMode(f.mode);setActiveFramework(f.name);setFwOpen(false);}} style={{flexDirection:"column",alignItems:"flex-start",gap:1,background:activeFramework===f.name?C.accentBg:"transparent"}}><span style={{fontWeight:500,color:activeFramework===f.name?C.accent:C.soft}}>{f.name}</span><span style={{fontSize:10,color:C.dim}}>{f.desc}</span></button>)}
              <button className="mi" onClick={()=>{setGroups(["Ideas","Insights","Actions"]);setMode("freeform");setActiveFramework("Freeform");setFwOpen(false);}} style={{color:activeFramework==="Freeform"?C.accent:C.soft}}>Freeform</button>
            </div>}
          </div>
        </div>

        {/* BOARD */}
        <div ref={boardRef} onClick={handleBoardClick} onContextMenu={handleBoardContext} onDoubleClick={handleBoardDblClick} onMouseDown={handlePenDown} onMouseMove={e=>{onDrag(e);handlePenMove(e);}}
          style={{flex:1,overflow:"auto",background:C.board,backgroundImage:dotGrid,backgroundSize:"20px 20px",position:"relative",cursor:tool==="pan"?"grab":tool==="pen"?"crosshair":tool==="sticky"?"cell":tool==="connector"?"crosshair":tool==="text"?"text":"default"}}>
          <div style={{width:2000,height:1500,position:"absolute",top:0,left:0}}/>

          {/* Context */}
          <div data-ui="true" style={{position:"absolute",top:12,left:80,width:460,zIndex:30,animation:"fu .3s"}}>
            {!editCtx?<div onClick={()=>setEditCtx(true)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",opacity:.9}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:context?4:0}}>
                <span style={{fontSize:9,textTransform:"uppercase",letterSpacing:1.5,color:C.dim,fontWeight:500}}>Project context</span>
                <span style={{fontSize:9,color:C.dim}}>{context?"Click to edit":"Auto-fills as you chat"}</span></div>
              {context?<p style={{fontSize:12,color:C.soft,lineHeight:1.5}}>{context}</p>:<p style={{fontSize:12,color:C.dim}}>Start chatting — AI will summarize your project context here.</p>}
            </div>:<div style={{background:C.surface,border:`1px solid ${C.accent}`,borderRadius:10,padding:"10px 14px"}}>
              <span style={{fontSize:9,textTransform:"uppercase",letterSpacing:1.5,color:C.accent,fontWeight:500,display:"block",marginBottom:4}}>Project context</span>
              <textarea value={context} onChange={e=>setContext(e.target.value)} autoFocus rows={2} placeholder="What are you building? Who for?" style={{width:"100%",background:"transparent",border:"none",color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",lineHeight:1.5}}/>
              <button onClick={()=>setEditCtx(false)} style={{marginTop:4,background:C.accent,border:"none",borderRadius:6,padding:"3px 12px",color:C.deep,fontSize:10,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
            </div>}
          </div>

          {/* Framework groups */}
          {activeFramework!=="Freeform"&&<div data-ui="true" style={{position:"absolute",top:75,left:80,display:"flex",gap:6,zIndex:25,animation:"fu .3s"}}>
            {groups.map((g,i)=><span key={g} style={{fontSize:10,padding:"3px 10px",borderRadius:8,background:C.surface,border:`1px solid ${C.border}`,color:GC[i%GC.length],fontWeight:500,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:GC[i%GC.length],opacity:.6}}/>{g}</span>)}
          </div>}

          {/* SVG layer */}
          <svg style={{position:"absolute",inset:0,width:2000,height:1500,pointerEvents:"none",zIndex:5}}>
            {strokes.map((s,i)=><polyline key={i} points={s.points.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>)}
            {conns.map((cn,i)=>{const f=cards.find(c=>c.id===cn.from);const t=cards.find(c=>c.id===cn.to);if(!f||!t)return null;return<line key={"c"+i} x1={f.x+80} y1={f.y+35} x2={t.x+80} y2={t.y+35} stroke={C.accent} strokeWidth="1.5" opacity="0.4" strokeDasharray="6 4"/>;})}
          </svg>

          {/* Texts */}
          {texts.map(t=><div key={t.id} data-ui="true" style={{position:"absolute",left:t.x,top:t.y,zIndex:12}}>
            {editingText===t.id?<input autoFocus value={t.text} onChange={e=>setTexts(p=>p.map(x=>x.id===t.id?{...x,text:e.target.value}:x))} onBlur={()=>{setEditingText(null);if(!t.text)setTexts(p=>p.filter(x=>x.id!==t.id));}} onKeyDown={e=>{if(e.key==="Enter"){setEditingText(null);if(!t.text)setTexts(p=>p.filter(x=>x.id!==t.id));}}} style={{background:"transparent",border:"none",borderBottom:`1px solid ${C.accent}`,color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",minWidth:100,padding:"2px 0"}}/>
            :<span onDoubleClick={()=>setEditingText(t.id)} style={{color:C.soft,fontSize:14,cursor:"text"}}>{t.text||"..."}</span>}
          </div>)}

          {/* Cards */}
          {cards.map(card=>{const st=STICKY[card.tag]||STICKY.insight;return(
            <div key={card.id} data-card="true" className="sc" onMouseDown={e=>startDrag(e,card.id)} style={{left:card.x,top:card.y,width:165,background:st.bg,borderRadius:4,padding:"14px 12px 10px",boxShadow:"2px 3px 10px rgba(0,0,0,.25)",borderTop:`3px solid ${st.accent}`,zIndex:editingCard===card.id?50:10,animation:"cI .25s",outline:connStart===card.id?`2px solid ${C.accent}`:"none"}}>
              {editingCard===card.id?<input autoFocus placeholder="Type card title..." value={card.title} onChange={e=>{const v=e.target.value;setCards(p=>p.map(c=>c.id===card.id?{...c,title:v}:c));}} onBlur={()=>{setEditingCard(null);if(!card.title)setCards(p=>p.filter(c=>c.id!==card.id));}} onKeyDown={e=>{if(e.key==="Enter"){setEditingCard(null);if(!card.title)setCards(p=>p.filter(c=>c.id!==card.id));}}} style={{width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${st.accent}`,color:st.color,fontSize:13,fontWeight:500,fontFamily:"inherit",outline:"none",padding:"2px 0",marginBottom:6}}/>
              :<div onDoubleClick={()=>setEditingCard(card.id)} style={{fontSize:13,fontWeight:500,lineHeight:1.35,color:st.color,marginBottom:6}}>{card.title}</div>}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:8,padding:"2px 6px",borderRadius:4,background:"rgba(0,0,0,.2)",color:st.accent,textTransform:"uppercase",letterSpacing:.5}}>{card.tag}</span>
                <button onClick={e=>{e.stopPropagation();setCards(p=>p.filter(c=>c.id!==card.id));setConns(p=>p.filter(cn=>cn.from!==card.id&&cn.to!==card.id));}} style={{background:"none",border:"none",color:st.accent,cursor:"pointer",fontSize:11,padding:0,opacity:.4}}>x</button>
              </div>
            </div>);})}

          {!cards.length&&!showOnboard&&!sc&&<div style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",opacity:.3}}><Logo size={48} active/><p style={{fontSize:13,color:C.soft,maxWidth:240,lineHeight:1.5,marginTop:10}}>Right-click to chat with AI. Use toolbar to add cards.</p></div>}

          {/* ONBOARDING */}
          {showOnboard&&<div style={{position:"absolute",inset:0,background:"rgba(10,8,16,.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",animation:"fi .3s"}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 32px",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,.5)",animation:"pop .25s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><Logo size={36} active/><span style={{fontSize:16,fontWeight:600,color:C.accent}}>Welcome to MindPalace</span></div>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
                {[["Right-click","anywhere to summon the Smart Cursor — your AI on the board"],["Click the brain logo","(top-right) for a full chat panel"],["Use the toolbar","to add cards, draw, connect cards, and write text"],["Apply frameworks","from the grid icon — Priority Matrix, Journey Map, etc."],["Drag cards freely","to organize. Your work saves automatically!"]].map(([b,t],i)=><div key={i} style={{display:"flex",gap:4,fontSize:13,color:C.soft,lineHeight:1.5}}><span style={{color:C.accent,fontWeight:600,whiteSpace:"nowrap"}}>{b}</span> {t}</div>)}
              </div>
              <button onClick={()=>setShowOnboard(false)} style={{background:C.accent,border:"none",borderRadius:10,padding:"10px 28px",color:C.deep,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>Start brainstorming</button>
            </div>
          </div>}

          {/* SMART CURSOR */}
          {sc&&<div data-ui="true" style={{position:"absolute",left:Math.min(sc.x,600),top:sc.y,width:300,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,boxShadow:"0 16px 48px rgba(0,0,0,.5),0 0 30px rgba(180,160,255,.05)",zIndex:100,animation:"pop .2s",display:"flex",flexDirection:"column",maxHeight:340}}>
            <div style={{padding:"8px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:6}}><Logo size={16} active/><span style={{fontSize:11,fontWeight:500,color:C.accent}}>Smart Cursor</span></div><button onClick={()=>setSc(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>x</button></div>
            <div style={{flex:1,overflow:"auto",padding:"8px 10px",maxHeight:180}}>
              {!scMsgs.length&&<p style={{fontSize:11,color:C.dim,textAlign:"center",padding:"8px 0"}}>Ask anything or pick a quick action.</p>}
              {scMsgs.map((m,i)=><div key={i} style={{marginBottom:6,display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",animation:"fu .15s"}}><div style={{maxWidth:"85%",padding:"6px 10px",fontSize:11,lineHeight:1.5,borderRadius:m.role==="user"?"10px 10px 2px 10px":"10px 10px 10px 2px",background:m.role==="user"?C.accent:C.bg,color:m.role==="user"?C.deep:C.soft,border:m.role==="ai"?`1px solid ${C.border}`:"none",whiteSpace:"pre-line"}}>{m.text}</div></div>)}
              {scTyping&&<div style={{display:"flex",gap:3,padding:"4px 0"}}>{[0,1,2].map(d=><div key={d} style={{width:4,height:4,borderRadius:"50%",background:C.accent,opacity:.5,animation:`tp 1.2s ease-in-out ${d*.2}s infinite`}}/>)}</div>}
              <div ref={scEndRef}/></div>
            <div style={{padding:"3px 8px 5px",display:"flex",gap:3,flexWrap:"wrap"}}>{["What's missing?","Add ideas","Challenge this","Summarize"].map(q=><button key={q} className="qc" onClick={()=>scSend(q)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:12,padding:"2px 8px",color:C.dim,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>)}</div>
            <div style={{padding:"5px 8px 8px",display:"flex",gap:5}}><input ref={scRef} value={scInput} onChange={e=>setScInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();scSend();}}} placeholder="Ask the board..." disabled={scTyping} style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",color:C.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/><button onClick={()=>scSend()} disabled={scTyping||!scInput.trim()} style={{background:C.accent,border:"none",borderRadius:8,padding:"0 10px",color:C.deep,cursor:"pointer",fontWeight:600,fontSize:12,opacity:scTyping||!scInput.trim()?.4:1}}>{"\u2191"}</button></div>
          </div>}

          {/* Tool indicator + zoom */}
          <div style={{position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 12px",zIndex:40,fontSize:11,color:C.muted}}>{tool==="select"&&"Select & drag cards"}{tool==="sticky"&&"Click to place a card"}{tool==="text"&&"Click to add text"}{tool==="pen"&&"Draw freely — click & drag"}{tool==="pan"&&"Pan the canvas"}{tool==="connector"&&(connStart?"Click second card":"Click a card to connect")}</div>
          <div style={{position:"fixed",bottom:16,left:78,display:"flex",flexDirection:"column",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",zIndex:40}}>{["+","\u2212","\u2b1c"].map((z,i)=><button key={i} style={{width:32,height:32,border:"none",borderBottom:i<2?`1px solid ${C.border}`:"none",background:"transparent",color:C.muted,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>{z}</button>)}</div>
        </div>

        {/* CHAT */}
        {chatOpen&&<div style={{width:360,background:C.bg,borderLeft:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,animation:"sR .2s",zIndex:45}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Logo size={20} active/><span style={{fontSize:13,fontWeight:500,color:C.accent}}>MindPalace Chat</span></div><button onClick={()=>setChatOpen(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:15}}>x</button></div>
          <div style={{flex:1,overflow:"auto",padding:"14px 12px"}}>
            {!msgs.length&&<p style={{fontSize:12,color:C.dim,textAlign:"center",padding:"20px 0"}}>Start a conversation. Context will auto-generate.</p>}
            {msgs.map((m,i)=><div key={i} style={{marginBottom:10,display:"flex",gap:8,flexDirection:m.role==="user"?"row-reverse":"row",animation:"fu .2s"}}>{m.role==="ai"&&<div style={{width:22,height:22,flexShrink:0,marginTop:2}}><Logo size={22} active/></div>}<div style={{maxWidth:"82%",padding:"9px 13px",fontSize:13,lineHeight:1.6,borderRadius:m.role==="user"?"13px 13px 3px 13px":"13px 13px 13px 3px",background:m.role==="user"?C.accent:C.surface,color:m.role==="user"?C.deep:C.soft,border:m.role==="ai"?`1px solid ${C.border}`:"none",whiteSpace:"pre-line"}}>{m.text}</div></div>)}
            {typing&&<div style={{display:"flex",gap:8}}><div style={{width:22,height:22,flexShrink:0}}><Logo size={22} active/></div><div style={{padding:"9px 13px",borderRadius:"13px 13px 13px 3px",background:C.surface,border:`1px solid ${C.border}`,display:"flex",gap:3,alignItems:"center"}}>{[0,1,2].map(d=><div key={d} style={{width:4,height:4,borderRadius:"50%",background:C.accent,opacity:.5,animation:`tp 1.2s ease-in-out ${d*.2}s infinite`}}/>)}</div></div>}
            <div ref={endRef}/></div>
          <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"flex",gap:6}}><input ref={inRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Type your thoughts..." disabled={typing} style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/><button onClick={send} disabled={typing||!input.trim()} style={{background:C.accent,border:"none",borderRadius:10,padding:"0 16px",color:C.deep,cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit",opacity:typing||!input.trim()?.4:1}}>Send</button></div>
            <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>{["Pin that","What's missing?","Prioritize","Challenge me"].map(q=><button key={q} className="qc" onClick={()=>{setInput(q);setTimeout(()=>inRef.current?.focus(),50);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:14,padding:"2px 9px",color:C.dim,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>)}</div>
          </div>
        </div>}

        {/* MENU */}
        {menuOpen&&<><div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:150}}/><div style={{position:"fixed",top:44,left:0,width:240,background:C.surface,border:`1px solid ${C.border}`,borderRadius:"0 12px 12px 0",padding:"6px 4px",zIndex:200,boxShadow:"0 12px 40px rgba(0,0,0,.5)",animation:"sL .15s"}}>
          <button className="mi" onClick={()=>{saveProject(projId,{projName,context,mode,groups,activeFramework,cards,conns,strokes,texts,msgs,hist}).then(()=>loadProjectList().then(setProjectList));setScreen("home");setMenuOpen(false);}}>← All projects</button>
          <button className="mi" onClick={()=>{setShareOpen(true);setMenuOpen(false);}}>↗ Share</button><button className="mi" onClick={()=>{setMenuOpen(false);const w=window.open("","_blank");if(!w)return;const grouped=cards.reduce((a,c)=>{(a[c.group]=a[c.group]||[]).push(c);return a;},{});w.document.write(`<!DOCTYPE html><html><head><title>${projName} - MindPalace</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#333}h1{color:#6B5CE7;margin-bottom:5px}h2{color:#555;margin-top:25px;border-bottom:2px solid #eee;padding-bottom:5px}p.ctx{background:#f5f3ff;padding:12px;border-radius:8px;border-left:3px solid #6B5CE7;margin:15px 0}.card{padding:8px 12px;margin:6px 0;border-radius:6px;border-left:3px solid #6B5CE7}.tag{font-size:10px;text-transform:uppercase;color:#888;margin-left:8px}@media print{body{margin:20px}}</style></head><body><h1>${projName}</h1><p style="color:#888">Exported from MindPalace · ${new Date().toLocaleDateString()}</p>${context?`<p class="ctx"><strong>Context:</strong> ${context}</p>`:""}<p style="color:#888;margin-top:10px">Framework: ${activeFramework} · ${cards.length} cards</p>${Object.entries(grouped).map(([g,cs])=>`<h2>${g}</h2>${cs.map(c=>`<div class="card"><strong>${c.title}</strong><span class="tag">${c.tag}</span></div>`).join("")}`).join("")}${msgs.length?`<h2>Chat History</h2>${msgs.map(m=>`<p><strong>${m.role==="user"?"You":"AI"}:</strong> ${m.text}</p>`).join("")}`:""}</body></html>`);w.document.close();w.print();}}>⤓ Export as PDF</button><button className="mi" onClick={()=>setMenuOpen(false)}>⧉ Duplicate</button>
          <div className="ms"/><button className="mi" onClick={()=>{setEditCtx(true);setMenuOpen(false);}}>✎ Edit context</button><button className="mi" onClick={()=>{setShowKeySetup(true);setKeyInput(apiKey);setMenuOpen(false);}}>🔑 API Key {apiKey?"✓":""}</button><button className="mi" onClick={()=>setMenuOpen(false)}>? Help</button><div className="ms"/><button className="mi" onClick={()=>setMenuOpen(false)}>⚙ Settings</button><div className="ms"/>
          <button className="mi" onClick={()=>{delProject(projId);setScreen("home");setMenuOpen(false);loadProjectList().then(setProjectList);}} style={{color:C.coral}}>✗ Delete project</button>
        </div></>}

        {/* SHARE */}
        {shareOpen&&<><div onClick={()=>setShareOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:150}}/><div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:380,background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,zIndex:200,boxShadow:"0 20px 60px rgba(0,0,0,.5)",animation:"pop .2s"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><h3 style={{fontSize:16,fontWeight:600}}>Share board</h3><button onClick={()=>setShareOpen(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>x</button></div>
          <div style={{display:"flex",gap:8,marginBottom:16}}><input placeholder="Enter email to invite..." style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/><button style={{background:C.accent,border:"none",borderRadius:8,padding:"0 16px",color:C.deep,fontWeight:500,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Invite</button></div>
          <div style={{background:C.bg,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",border:`1px solid ${C.border}`}}><span style={{fontSize:12,color:C.soft}}>mindpalace.app/b/xk7f2...</span><button style={{background:C.accentBg,border:`1px solid ${C.accent}40`,borderRadius:6,padding:"4px 12px",color:C.accent,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Copy link</button></div>
          <p style={{fontSize:11,color:C.dim,marginTop:10}}>Anyone with the link can view. Invite for edit access.</p>
        </div></>}

        {/* API KEY SETUP MODAL (canvas) */}
        {showKeySetup&&<><div onClick={()=>setShowKeySetup(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:250}}/><div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:420,background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:28,zIndex:260,boxShadow:"0 20px 60px rgba(0,0,0,.5)",animation:"pop .2s"}}>
          <h3 style={{fontSize:16,fontWeight:600,marginBottom:4}}>Connect Groq AI</h3>
          <p style={{fontSize:12,color:C.muted,marginBottom:16,lineHeight:1.5}}>Free AI API — no credit card needed.</p>
          <div style={{background:C.bg,borderRadius:8,padding:"12px 14px",marginBottom:14,border:`1px solid ${C.border}`}}>
            <p style={{fontSize:11,color:C.soft,marginBottom:8,lineHeight:1.6}}>
              <span style={{color:C.accent,fontWeight:600}}>1.</span> Go to <a href="https://console.groq.com" target="_blank" rel="noopener" style={{color:C.accent,textDecoration:"underline"}}>console.groq.com</a> and sign up<br/>
              <span style={{color:C.accent,fontWeight:600}}>2.</span> Click "API Keys" in the sidebar<br/>
              <span style={{color:C.accent,fontWeight:600}}>3.</span> Create and copy your key
            </p>
          </div>
          <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} placeholder="Paste key here (starts with gsk_...)" style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",marginBottom:12}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowKeySetup(false)} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 0",color:C.soft,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={()=>{if(keyInput.trim())saveApiKey(keyInput.trim());}} disabled={!keyInput.trim()} style={{flex:1,background:C.accent,border:"none",borderRadius:10,padding:"10px 0",color:C.deep,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:keyInput.trim()?1:.4}}>Save key</button>
          </div>
        </div></>}
      </div>
    </div>
  );
}
