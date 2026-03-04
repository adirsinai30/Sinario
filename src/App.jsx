import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ["🛒","🚗","💡","🎬","💊","👶","🏠","✈️","🍕","☕","👗","🐶","📚","💪","🎮","🎁","💼","🔧"];
const COLOR_OPTIONS = ["#f87171","#fb923c","#facc15","#4ade80","#34d399","#22d3ee","#60a5fa","#a78bfa","#f472b6","#e879f9"];
const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

const DEFAULT_CATS = [
  { id:"c1", label:"מזון וסופר",   icon:"🛒", color:"#4ade80", budget:3000 },
  { id:"c2", label:"תחבורה",       icon:"🚗", color:"#60a5fa", budget:1200 },
  { id:"c3", label:"חשבונות",      icon:"💡", color:"#fb923c", budget:2500 },
  { id:"c4", label:"בילויים",      icon:"🎬", color:"#a78bfa", budget:800  },
  { id:"c5", label:"בריאות",       icon:"💊", color:"#f472b6", budget:600  },
];

const SEED_EXPENSES = [
  { id:101, desc:"שופרסל",        amount:342, catId:"c1", who:"י", date:"2026-03-05" },
  { id:102, desc:"דלק",           amount:210, catId:"c2", who:"א", date:"2026-03-04" },
  { id:103, desc:"חשמל",          amount:430, catId:"c3", who:"י", date:"2026-03-03" },
  { id:104, desc:"סינמה סיטי",    amount:140, catId:"c4", who:"א", date:"2026-03-02" },
  { id:105, desc:"תרופות",        amount:95,  catId:"c5", who:"א", date:"2026-03-01" },
  { id:106, desc:"רמי לוי",       amount:280, catId:"c1", who:"י", date:"2026-03-01" },
  { id:107, desc:"ביטוח",         amount:380, catId:"c3", who:"י", date:"2026-02-28" },
  { id:108, desc:"קפה ארומה",     amount:48,  catId:"c4", who:"א", date:"2026-02-27" },
  { id:109, desc:"מים",           amount:180, catId:"c3", who:"א", date:"2026-02-25" },
  { id:110, desc:"יין + אוכל",   amount:220, catId:"c4", who:"י", date:"2026-02-20" },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt   = n => "₪" + Math.round(n).toLocaleString("he-IL");
const today = () => new Date().toISOString().slice(0,10);
const uid   = () => Date.now() + Math.random();

function useStorage(key, init) {
  const [val, setVal] = useState(init);
  const ready = useRef(false);
  useEffect(() => {
    (async () => {
      try { const r = await window.storage?.get(key); if (r?.value) setVal(JSON.parse(r.value)); } catch {}
      ready.current = true;
    })();
  }, []);
  const save = useCallback(v => {
    setVal(v);
    if (ready.current) window.storage?.set(key, JSON.stringify(v)).catch(()=>{});
  }, [key]);
  return [val, save];
}

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:"#111823", border:"1px solid #1e2d3d", borderRadius:20, padding:20, ...style }}>
    {children}
  </div>
);

const Pill = ({ active, color, onClick, children }) => (
  <button onClick={onClick} style={{
    padding:"6px 14px", borderRadius:20, border:`1px solid ${active ? color : "#1e2d3d"}`,
    background: active ? color+"22" : "transparent",
    color: active ? color : "#445",
    fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight: active?700:400,
    transition:"all .15s",
  }}>{children}</button>
);

// ─── DONUT CHART ─────────────────────────────────────────────────────────────
function Donut({ slices, size=160 }) {
  const total = slices.reduce((s,sl)=>s+sl.val,0);
  if (!total) return <div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",color:"#334",fontSize:12}}>אין נתונים</div>;
  const R=56, cx=size/2, cy=size/2, SW=18;
  let angle=-90;
  const arcs = slices.filter(sl=>sl.val>0).map(sl=>{
    const pct=sl.val/total, deg=pct*360;
    const r1=(angle*Math.PI)/180, r2=((angle+deg)*Math.PI)/180;
    const laf=deg>180?1:0;
    const d=`M${cx+R*Math.cos(r1)} ${cy+R*Math.sin(r1)} A${R} ${R} 0 ${laf} 1 ${cx+R*Math.cos(r2)} ${cy+R*Math.sin(r2)}`;
    angle+=deg;
    return {...sl,d,pct};
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1a2535" strokeWidth={SW}/>
      {arcs.map((a,i)=>(
        <path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={SW-3} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 5px ${a.color}66)`,transition:"all .6s"}}/>
      ))}
      <text x={cx} y={cy-7} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="800">{fmt(total)}</text>
      <text x={cx} y={cy+11} textAnchor="middle" fill="#445" fontSize="10">הוצאות</text>
    </svg>
  );
}

// ─── BAR CHART (monthly trend) ───────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d=>d.v), 1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80,padding:"0 4px"}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <div style={{width:"100%",background:"#1e2d3d",borderRadius:6,height:70,display:"flex",alignItems:"flex-end",overflow:"hidden"}}>
            <div style={{
              width:"100%", height:`${(d.v/max)*100}%`, borderRadius:6,
              background: d.current ? "linear-gradient(180deg,#22d3ee,#4ade80)" : "#1e3a4a",
              transition:"height .7s ease", boxShadow: d.current?"0 0 12px #22d3ee55":"none",
            }}/>
          </div>
          <span style={{fontSize:9,color:d.current?"#22d3ee":"#334"}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SETTLEMENT PANEL ────────────────────────────────────────────────────────
function Settlement({ expenses, month, year }) {
  const monthExp = expenses.filter(e=>{
    const d=new Date(e.date); return d.getMonth()===month && d.getFullYear()===year;
  });
  const yoav = monthExp.filter(e=>e.who==="י").reduce((s,e)=>s+e.amount,0);
  const wife  = monthExp.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0);
  const total = yoav + wife;
  const fair  = total / 2;
  const diff  = yoav - fair; // positive = yoav paid more

  const from = diff > 0 ? "אשתי" : "יואב";
  const to   = diff > 0 ? "יואב" : "אשתי";
  const amt  = Math.abs(diff);

  return (
    <Card style={{background:"linear-gradient(135deg,#0d1f12,#0d1a2a)"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#fff",marginBottom:16}}>💸 התחשבנות — {MONTHS[month]}</div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        {[["יואב","י",yoav,"#4ade80"],["אשתי","א",wife,"#f472b6"]].map(([name,k,amt,col])=>(
          <div key={k} style={{flex:1,background:"#ffffff08",borderRadius:14,padding:14,textAlign:"center"}}>
            <div style={{fontSize:11,color:col,fontWeight:700,marginBottom:6}}>{name} שילם</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{fmt(amt)}</div>
            <div style={{fontSize:11,color:"#445",marginTop:4}}>{((amt/total||0)*100).toFixed(0)}% מהסה״כ</div>
          </div>
        ))}
      </div>
      {amt > 5 ? (
        <div style={{background:"#22d3ee11",border:"1px solid #22d3ee33",borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{fontSize:12,color:"#22d3ee",marginBottom:4}}>העברה נדרשת</div>
          <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{fmt(amt)}</div>
          <div style={{fontSize:13,color:"#aaa",marginTop:4}}>{from} → {to}</div>
        </div>
      ) : (
        <div style={{background:"#4ade8011",border:"1px solid #4ade8033",borderRadius:14,padding:14,textAlign:"center",color:"#4ade80",fontSize:13,fontWeight:700}}>
          ✓ מאוזן — אין צורך בהעברה
        </div>
      )}
    </Card>
  );
}

// ─── ADD EXPENSE SHEET ────────────────────────────────────────────────────────
function AddSheet({ cats, onAdd, onClose }) {
  const [step, setStep] = useState(0); // 0=amount, 1=details
  const [form, setForm] = useState({ amount:"", desc:"", catId:cats[0]?.id||"", who:"י", date:today() });
  const amtRef = useRef();
  useEffect(()=>{ setTimeout(()=>amtRef.current?.focus(),80); },[]);

  const numPad = ["1","2","3","4","5","6","7","8","9","⌫","0","✓"];

  const pressKey = k => {
    if (k==="⌫") { setForm(f=>({...f,amount:f.amount.slice(0,-1)})); return; }
    if (k==="✓") { if(form.amount) setStep(1); return; }
    if (form.amount.length >= 6) return;
    setForm(f=>({...f, amount: f.amount+k}));
  };

  const submit = () => {
    if (!form.amount || !form.catId) return;
    const cat = cats.find(c=>c.id===form.catId);
    onAdd({ ...form, id:uid(), amount:+form.amount, icon:cat?.icon });
    onClose();
  };

  const inp = { background:"#0d1117", border:"1px solid #1e2d3d", borderRadius:12, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#0d1117",borderTop:"1px solid #1e2d3d",borderRadius:"28px 28px 0 0",
        padding:"24px 20px 36px",width:"100%",maxWidth:500,fontFamily:"inherit",direction:"rtl",
        animation:"su .3s cubic-bezier(.22,1,.36,1)",
      }}>
        <style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div style={{width:40,height:4,borderRadius:2,background:"#1e2d3d",margin:"0 auto 20px"}}/>

        {step===0 ? (
          <>
            {/* Amount entry */}
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:11,color:"#445",letterSpacing:2,marginBottom:8}}>הזן סכום</div>
              <div style={{fontSize:52,fontWeight:900,color: form.amount?"#fff":"#1e2d3d",letterSpacing:2,minHeight:64}}>
                {form.amount ? `₪${form.amount}` : "₪0"}
              </div>
            </div>
            {/* Numpad */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {numPad.map(k=>(
                <button key={k} onClick={()=>pressKey(k)} style={{
                  padding:"18px 0", borderRadius:16,
                  background: k==="✓" ? "linear-gradient(135deg,#4ade80,#22d3ee)" : k==="⌫" ? "#1e2d3d" : "#111823",
                  border:"none", color: k==="✓"?"#000":"#fff",
                  fontSize: k==="✓"||k==="⌫" ? 20 : 22,
                  fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  boxShadow: k==="✓" ? "0 0 20px #4ade8055" : "none",
                  transition:"transform .1s",
                }}>{k}</button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:20,textAlign:"center"}}>
              {fmt(+form.amount)} — פרטים
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <input placeholder="תיאור (שופרסל, דלק…)" value={form.desc}
                onChange={e=>setForm({...form,desc:e.target.value})} style={inp}
                autoFocus/>
              {/* Category picker */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {cats.map(c=>(
                  <button key={c.id} onClick={()=>setForm({...form,catId:c.id})} style={{
                    padding:"8px 12px", borderRadius:14,
                    border:`1px solid ${form.catId===c.id?c.color:"#1e2d3d"}`,
                    background: form.catId===c.id ? c.color+"22":"transparent",
                    color: form.catId===c.id?c.color:"#445",
                    fontSize:13, cursor:"pointer", fontFamily:"inherit",
                  }}>{c.icon} {c.label}</button>
                ))}
              </div>
              {/* Who */}
              <div style={{display:"flex",gap:8}}>
                {[["י","יואב","#4ade80"],["א","אשתי","#f472b6"]].map(([v,l,col])=>(
                  <button key={v} onClick={()=>setForm({...form,who:v})} style={{
                    flex:1,padding:"11px",borderRadius:14,border:`1px solid ${form.who===v?col:"#1e2d3d"}`,
                    background:form.who===v?col+"22":"transparent",color:form.who===v?col:"#445",
                    fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:700,
                  }}>{l}</button>
                ))}
              </div>
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inp}/>
              <button onClick={submit} style={{
                background:"linear-gradient(135deg,#4ade80,#22d3ee)",color:"#000",border:"none",
                borderRadius:16,padding:"15px",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"inherit",
                boxShadow:"0 0 30px #4ade8044",
              }}>✓ שמור הוצאה</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CATEGORY EDITOR ─────────────────────────────────────────────────────────
function CatEditor({ cats, setCats, onClose }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({label:"",icon:"🛒",color:"#4ade80",budget:1000});

  const startEdit = c => { setEditing(c.id); setForm({label:c.label,icon:c.icon,color:c.color,budget:c.budget}); };
  const startNew  = () => { setEditing("__new__"); setForm({label:"",icon:"🛒",color:"#4ade80",budget:1000}); };

  const save = () => {
    if (!form.label.trim()) return;
    if (editing==="__new__") setCats([...cats,{...form,id:"c"+uid()}]);
    else setCats(cats.map(c=>c.id===editing?{...c,...form}:c));
    setEditing(null);
  };

  const del = id => { if(cats.length>1) setCats(cats.filter(c=>c.id!==id)); };

  const inp = {background:"#0d1117",border:"1px solid #1e2d3d",borderRadius:12,padding:"10px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)",zIndex:200,overflowY:"auto",padding:20,direction:"rtl",fontFamily:"inherit"}}>
      <div style={{maxWidth:500,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>✏️ עריכת קטגוריות</div>
          <button onClick={onClose} style={{background:"#1e2d3d",border:"none",color:"#fff",borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>סגור</button>
        </div>

        {editing ? (
          <Card>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:16}}>
              {editing==="__new__" ? "קטגוריה חדשה" : "עריכה"}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <input placeholder="שם קטגוריה" value={form.label} onChange={e=>setForm({...form,label:e.target.value})} style={inp}/>
              <input type="number" placeholder="תקציב ₪" value={form.budget} onChange={e=>setForm({...form,budget:+e.target.value})} style={inp}/>
              <div>
                <div style={{fontSize:11,color:"#445",marginBottom:8}}>אייקון</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {EMOJI_OPTIONS.map(e=>(
                    <button key={e} onClick={()=>setForm({...form,icon:e})} style={{
                      width:40,height:40,borderRadius:10,fontSize:20,cursor:"pointer",border:`2px solid ${form.icon===e?"#22d3ee":"transparent"}`,
                      background:form.icon===e?"#22d3ee22":"#111823",
                    }}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:11,color:"#445",marginBottom:8}}>צבע</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {COLOR_OPTIONS.map(c=>(
                    <button key={c} onClick={()=>setForm({...form,color:c})} style={{
                      width:32,height:32,borderRadius:"50%",background:c,border:`3px solid ${form.color===c?"#fff":"transparent"}`,cursor:"pointer",
                    }}/>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={save} style={{flex:1,background:"linear-gradient(135deg,#4ade80,#22d3ee)",color:"#000",border:"none",borderRadius:12,padding:"12px",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>שמור</button>
                <button onClick={()=>setEditing(null)} style={{flex:1,background:"#1e2d3d",color:"#fff",border:"none",borderRadius:12,padding:"12px",cursor:"pointer",fontFamily:"inherit"}}>ביטול</button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {cats.map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,background:"#111823",border:"1px solid #1e2d3d",borderRadius:16,padding:"14px 16px",marginBottom:10}}>
                <div style={{width:42,height:42,borderRadius:12,background:c.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{c.icon}</div>
                <div style={{flex:1}}>
                  <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{c.label}</div>
                  <div style={{color:c.color,fontSize:12}}>תקציב: {fmt(c.budget)}</div>
                </div>
                <button onClick={()=>startEdit(c)} style={{background:"#1e2d3d",border:"none",color:"#aaa",borderRadius:10,padding:"7px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>עריכה</button>
                <button onClick={()=>del(c.id)} style={{background:"#2d1e1e",border:"none",color:"#f87171",borderRadius:10,padding:"7px 10px",cursor:"pointer",fontSize:14}}>×</button>
              </div>
            ))}
            <button onClick={startNew} style={{width:"100%",background:"linear-gradient(135deg,#4ade80,#22d3ee)",color:"#000",border:"none",borderRadius:16,padding:"14px",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>
              + קטגוריה חדשה
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [cats,     setCatsRaw] = useStorage("kp2-cats",     DEFAULT_CATS);
  const [expenses, setExpRaw]  = useStorage("kp2-expenses", SEED_EXPENSES);
  const [view,     setView]    = useState("dash"); // dash | list | summary | settings
  const [showAdd,  setShowAdd] = useState(false);
  const [showCats, setShowCats]= useState(false);
  const [selMonth, setSelMonth]= useState(new Date().getMonth());
  const selYear = 2026;

  const setCats = v => { setCatsRaw(v); };
  const addExpense = e => setExpRaw([e, ...expenses]);

  const monthExp = expenses.filter(e=>{
    const d=new Date(e.date); return d.getMonth()===selMonth && d.getFullYear()===selYear;
  });

  const totalBudget = cats.reduce((s,c)=>s+c.budget,0);
  const totalSpent  = monthExp.reduce((s,e)=>s+e.amount,0);
  const remaining   = totalBudget - totalSpent;
  const pct         = Math.min(100,(totalSpent/totalBudget)*100);

  const catSpent = id => monthExp.filter(e=>e.catId===id).reduce((s,e)=>s+e.amount,0);

  // Build monthly trend (last 6 months)
  const trend = Array.from({length:6},(_,i)=>{
    const m=(selMonth-5+i+12)%12;
    const v=expenses.filter(e=>new Date(e.date).getMonth()===m).reduce((s,e)=>s+e.amount,0);
    return { label:MONTHS[m].slice(0,3), v, current:m===selMonth };
  });

  // ── DASHBOARD ───────────────────────────────────────────────────────────
  const Dashboard = () => (
    <div style={{padding:"16px 16px 110px",maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>

      {/* Month strip */}
      <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
        {MONTHS.map((m,i)=>(
          <button key={i} onClick={()=>setSelMonth(i)} style={{
            flexShrink:0,padding:"6px 14px",borderRadius:20,border:"none",fontFamily:"inherit",
            background:selMonth===i?"linear-gradient(135deg,#4ade80,#22d3ee)":"#111823",
            color:selMonth===i?"#000":"#445",fontSize:12,cursor:"pointer",fontWeight:selMonth===i?800:400,transition:"all .2s",
          }}>{m.slice(0,3)}</button>
        ))}
      </div>

      {/* Hero */}
      <div style={{
        background:"linear-gradient(135deg,#071a12 0%,#071425 60%,#0d1f2d 100%)",
        border:"1px solid #1e3a2a",borderRadius:24,padding:24,position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:-40,left:-40,width:200,height:200,borderRadius:"50%",background:"#4ade8008"}}/>
        <div style={{position:"absolute",bottom:-30,right:-20,width:140,height:140,borderRadius:"50%",background:"#22d3ee06"}}/>
        <div style={{fontSize:11,color:"#4ade8088",letterSpacing:3,marginBottom:6,fontWeight:700}}>BUDGET TRACKER</div>
        <div style={{fontSize:38,fontWeight:900,color:"#fff",letterSpacing:-1}}>{fmt(totalSpent)}</div>
        <div style={{fontSize:13,color:"#556",marginBottom:16}}>מתוך {fmt(totalBudget)} תקציב {MONTHS[selMonth]}</div>
        {/* Progress */}
        <div style={{background:"#ffffff0a",borderRadius:12,height:10,overflow:"hidden",marginBottom:8}}>
          <div style={{
            width:`${pct}%`,height:"100%",borderRadius:12,
            background: pct>90 ? "linear-gradient(90deg,#f87171,#ef4444)" : "linear-gradient(90deg,#4ade80,#22d3ee)",
            transition:"width 1s cubic-bezier(.22,1,.36,1)",
            boxShadow: pct>90 ? "0 0 12px #f8717188" : "0 0 12px #4ade8066",
          }}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,fontWeight:700,color:remaining<0?"#f87171":"#4ade80"}}>
            {remaining<0 ? `⚠️ חריגה ${fmt(Math.abs(remaining))}` : `✓ נותר ${fmt(remaining)}`}
          </span>
          <span style={{fontSize:12,color:"#334"}}>{pct.toFixed(0)}%</span>
        </div>
      </div>

      {/* Who paid */}
      <div style={{display:"flex",gap:10}}>
        {[["י","יואב","#4ade80"],["א","אשתי","#f472b6"]].map(([k,name,col])=>{
          const amt=monthExp.filter(e=>e.who===k).reduce((s,e)=>s+e.amount,0);
          return (
            <Card key={k} style={{flex:1,padding:16}}>
              <div style={{fontSize:11,color:col,fontWeight:700,marginBottom:4}}>{name}</div>
              <div style={{fontSize:22,fontWeight:900,color:"#fff"}}>{fmt(amt)}</div>
              <div style={{fontSize:11,color:"#334",marginTop:2}}>
                {((amt/(totalSpent||1))*100).toFixed(0)}% מהכלל
              </div>
            </Card>
          );
        })}
      </div>

      {/* Donut + categories */}
      <Card>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <Donut slices={cats.map(c=>({val:catSpent(c.id),color:c.color,label:c.label}))} size={150}/>
          <div style={{flex:1}}>
            {cats.map(c=>{
              const sp=catSpent(c.id);
              const p=Math.min(100,(sp/c.budget)*100);
              return (
                <div key={c.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:"#ccc"}}>{c.icon} {c.label}</span>
                    <span style={{fontSize:11,color:sp>c.budget?"#f87171":"#445"}}>{fmt(sp)}</span>
                  </div>
                  <div style={{background:"#1a2535",borderRadius:6,height:5,overflow:"hidden"}}>
                    <div style={{width:`${p}%`,height:"100%",background:c.color,borderRadius:6,transition:"width .6s",boxShadow:`0 0 6px ${c.color}55`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Trend */}
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:14}}>📈 טרנד 6 חודשים</div>
        <BarChart data={trend}/>
      </Card>

      {/* Recent */}
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:14}}>הוצאות אחרונות</div>
        {monthExp.slice(0,5).map((ex,i)=>{
          const cat=cats.find(c=>c.id===ex.catId);
          return (
            <div key={ex.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<Math.min(monthExp.length,5)-1?"1px solid #1a2535":"none"}}>
              <div style={{width:40,height:40,borderRadius:12,background:(cat?.color||"#445")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                {cat?.icon||"💸"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:"#e2e8f0",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.desc||"הוצאה"}</div>
                <div style={{fontSize:11,color:"#334"}}>{cat?.label} · {ex.who==="י"?"יואב":"אשתי"} · {new Date(ex.date).toLocaleDateString("he-IL")}</div>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:"#fff",flexShrink:0}}>{fmt(ex.amount)}</div>
            </div>
          );
        })}
        {monthExp.length===0 && <div style={{color:"#334",textAlign:"center",padding:20,fontSize:13}}>אין הוצאות — לחץ + כדי להוסיף</div>}
        {monthExp.length>5 && (
          <button onClick={()=>setView("list")} style={{width:"100%",marginTop:12,background:"#1a2535",border:"none",color:"#22d3ee",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>
            כל ההוצאות ({monthExp.length}) →
          </button>
        )}
      </Card>
    </div>
  );

  // ── LIST VIEW ────────────────────────────────────────────────────────────
  const ListView = () => (
    <div style={{padding:"16px 16px 110px",maxWidth:520,margin:"0 auto"}}>
      <div style={{fontSize:16,fontWeight:900,color:"#fff",marginBottom:16}}>{MONTHS[selMonth]} — {monthExp.length} הוצאות</div>
      {monthExp.length===0 && <div style={{color:"#334",textAlign:"center",padding:40,fontSize:14}}>ריק לחלוטין 🎉</div>}
      {monthExp.map((ex,i)=>{
        const cat=cats.find(c=>c.id===ex.catId);
        return (
          <div key={ex.id} style={{display:"flex",alignItems:"center",gap:12,background:"#111823",border:"1px solid #1e2d3d",borderRadius:16,padding:"14px 16px",marginBottom:8}}>
            <div style={{width:42,height:42,borderRadius:12,background:(cat?.color||"#445")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{cat?.icon||"💸"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,color:"#e2e8f0",fontWeight:700}}>{ex.desc||"הוצאה"}</div>
              <div style={{fontSize:11,color:"#334"}}>{new Date(ex.date).toLocaleDateString("he-IL")} · {cat?.label} · {ex.who==="י"?"יואב":"אשתי"}</div>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:"#fff",flexShrink:0}}>{fmt(ex.amount)}</div>
          </div>
        );
      })}
    </div>
  );

  // ── SUMMARY VIEW ─────────────────────────────────────────────────────────
  const SummaryView = () => (
    <div style={{padding:"16px 16px 110px",maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>📊 סיכום — {MONTHS[selMonth]}</div>
      <Settlement expenses={expenses} month={selMonth} year={selYear}/>
      {/* By category breakdown */}
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:16}}>לפי קטגוריה</div>
        {cats.map(c=>{
          const sp=catSpent(c.id);
          const over=sp>c.budget;
          return (
            <div key={c.id} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,color:"#ccc"}}>{c.icon} {c.label}</span>
                <span style={{fontSize:12,color:over?"#f87171":c.color,fontWeight:700}}>
                  {fmt(sp)} / {fmt(c.budget)}
                  {over && <span style={{marginRight:6,fontSize:11}}>⚠️ חריגה {fmt(sp-c.budget)}</span>}
                </span>
              </div>
              <div style={{background:"#1a2535",borderRadius:8,height:8,overflow:"hidden"}}>
                <div style={{width:`${Math.min(100,(sp/c.budget)*100)}%`,height:"100%",background:over?"#f87171":c.color,borderRadius:8,transition:"width .6s",boxShadow:`0 0 8px ${over?"#f8717188":c.color+"88"}`}}/>
              </div>
            </div>
          );
        })}
      </Card>
      {/* Simulated alert */}
      <Card style={{background:"#0d1a2a",border:"1px solid #22d3ee33"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#22d3ee",marginBottom:10}}>📧 סיכום חודשי — מה יישלח</div>
        <div style={{fontSize:12,color:"#aaa",lineHeight:1.8}}>
          בסוף {MONTHS[selMonth]} תישלח התראה עם:<br/>
          • סיכום הוצאות כולל<br/>
          • פירוט לפי קטגוריה<br/>
          • חישוב מי מעביר למי ובכמה<br/>
          • קטגוריות שחרגו מהתקציב
        </div>
      </Card>
    </div>
  );

  // ── SETTINGS VIEW ────────────────────────────────────────────────────────
  const SettingsView = () => (
    <div style={{padding:"16px 16px 110px",maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>⚙️ הגדרות</div>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>קטגוריות</div>
        <div style={{fontSize:12,color:"#445",marginBottom:14}}>{cats.length} קטגוריות מוגדרות · תקציב כולל {fmt(totalBudget)}</div>
        <button onClick={()=>setShowCats(true)} style={{width:"100%",background:"#1a2535",border:"1px solid #1e2d3d",color:"#22d3ee",borderRadius:14,padding:"12px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:700}}>
          ✏️ ערוך קטגוריות
        </button>
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>🔗 Google Sheets</div>
        <div style={{fontSize:12,color:"#445",lineHeight:1.7,marginBottom:14}}>
          חבר את האפליקציה ל-Sheets שלך דרך Apps Script Web App כדי לסנכרן הוצאות אוטומטית.
        </div>
        <div style={{background:"#0d1117",borderRadius:10,padding:14,fontSize:11,color:"#4ade80",fontFamily:"monospace",lineHeight:1.9,marginBottom:14}}>
          {`function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp
    .getActiveSheet()
    .appendRow([d.date,d.desc,d.amount,d.cat,d.who]);
  return ContentService
    .createTextOutput("OK");
}`}
        </div>
        <input placeholder="הדבק כאן את URL ה-Web App…" style={{width:"100%",boxSizing:"border-box",background:"#0d1117",border:"1px solid #1e2d3d",borderRadius:12,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>📧 התראות סוף חודש</div>
        <div style={{fontSize:12,color:"#445",marginBottom:14}}>הגדר כתובות מייל לקבלת סיכום חודשי</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input placeholder="המייל שלך" style={{background:"#0d1117",border:"1px solid #1e2d3d",borderRadius:12,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
          <input placeholder="המייל של אשתך" style={{background:"#0d1117",border:"1px solid #1e2d3d",borderRadius:12,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
          <button style={{background:"linear-gradient(135deg,#4ade80,#22d3ee)",color:"#000",border:"none",borderRadius:14,padding:"12px",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>
            ✓ שמור הגדרות התראה
          </button>
        </div>
      </Card>
    </div>
  );

  const navItems = [
    ["dash","📊","דשבורד"],
    ["list","📋","הוצאות"],
    ["summary","💸","סיכום"],
    ["settings","⚙️","הגדרות"],
  ];

  return (
    <div style={{background:"#080d14",minHeight:"100vh",fontFamily:"'Noto Sans Hebrew','Segoe UI',sans-serif",direction:"rtl",color:"#fff"}}>
      {/* Top bar */}
      <div style={{background:"#0d1117",borderBottom:"1px solid #1a2535",padding:"14px 20px",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:520,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,background:"linear-gradient(135deg,#4ade80,#22d3ee)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-0.5}}>
              KashPal 💸
            </div>
            <div style={{fontSize:10,color:"#223",letterSpacing:1}}>ניהול הוצאות משפחתי</div>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{
            width:44,height:44,borderRadius:14,
            background:"linear-gradient(135deg,#4ade80,#22d3ee)",
            color:"#000",border:"none",fontSize:24,fontWeight:900,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 0 24px #4ade8055",
          }}>+</button>
        </div>
      </div>

      {/* Content */}
      {view==="dash"     && <Dashboard/>}
      {view==="list"     && <ListView/>}
      {view==="summary"  && <SummaryView/>}
      {view==="settings" && <SettingsView/>}

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0d1117",borderTop:"1px solid #1a2535",display:"flex",justifyContent:"space-around",padding:"10px 0 24px",zIndex:50}}>
        {navItems.map(([v,ic,lb])=>(
          <button key={v} onClick={()=>setView(v)} style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            background:"transparent",border:"none",cursor:"pointer",
            color:view===v?"#4ade80":"#334",transition:"color .2s",minWidth:60,
          }}>
            <span style={{fontSize:21}}>{ic}</span>
            <span style={{fontSize:9,fontFamily:"inherit",fontWeight:view===v?800:400,letterSpacing:.5}}>{lb}</span>
          </button>
        ))}
      </div>

      {showAdd  && <AddSheet cats={cats} onAdd={addExpense} onClose={()=>setShowAdd(false)}/>}
      {showCats && <CatEditor cats={cats} setCats={setCats} onClose={()=>setShowCats(false)}/>}
    </div>
  );
}
