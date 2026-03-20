import { useState, useEffect, useRef, useCallback } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
document.head.appendChild(fontLink);

const T = {
  bg:"#f7f6f3", surface:"#ffffff", border:"#e6e2db", borderHover:"#c8c2b8",
  text:"#1c1917", textMid:"#57534e", textSub:"#a8a29e",
  navy:"#1e3a5f", navyMid:"#2d5282", navyLight:"#ebf0f7", navyBorder:"#c3d4e8",
  danger:"#c0392b", dangerBg:"#fdf2f2", dangerBorder:"#f5c6c2",
  success:"#1a6b3c", successBg:"#f0faf4",
  font:"'system-ui', system-ui", display:"'system-ui', system-ui",
};

const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const YEARS  = [2024,2025,2026,2027,2028,2029,2030];
const CURRENCIES = [
  {code:"ILS",symbol:"₪",name:"שקל"},
  {code:"USD",symbol:"$",name:"דולר"},
  {code:"EUR",symbol:"€",name:"יורו"},
  {code:"JPY",symbol:"¥",name:"ין"},
  {code:"THB",symbol:"฿",name:"באט"},
];
const DEFAULT_CATS = [
  {id:"c1",label:"מזון וסופר",  icon:"basket", color:T.navy,    budget:3000},
  {id:"c2",label:"תחבורה",      icon:"car",    color:"#2563ab", budget:1200},
  {id:"c3",label:"חשבונות",     icon:"bolt",   color:"#6b5c3e", budget:2500},
  {id:"c4",label:"בילויים",     icon:"sparkle",color:"#7c3aed", budget:800 },
  {id:"c5",label:"בריאות",      icon:"heart",  color:"#be185d", budget:600 },
];
const SEED_EXPENSES = [
  {id:101,desc:"שופרסל",    amount:342,catId:"c1",who:"א",date:"2026-03-05"},
  {id:102,desc:"דלק",       amount:210,catId:"c2",who:"ס",date:"2026-03-04"},
  {id:103,desc:"חשמל",      amount:430,catId:"c3",who:"א",date:"2026-03-03"},
  {id:104,desc:"סינמה סיטי",amount:140,catId:"c4",who:"ס",date:"2026-03-02"},
  {id:105,desc:"תרופות",    amount:95, catId:"c5",who:"א",date:"2026-03-01"},
  {id:106,desc:"רמי לוי",   amount:280,catId:"c1",who:"ס",date:"2026-03-01"},
  {id:107,desc:"ביטוח",     amount:380,catId:"c3",who:"א",date:"2026-02-28"},
  {id:108,desc:"קפה ועוגה", amount:48, catId:"c4",who:"ס",date:"2026-02-27"},
];
const DEFAULT_SPECIAL = [
  {id:"sp1",desc:"מחשב נייד",catId:"tech",amount:4200,currency:"ILS",rateUsed:1,   date:"2026-03-10"},
  {id:"sp2",desc:"ספה",      catId:"home",amount:850, currency:"USD",rateUsed:3.65,date:"2026-02-20"},
];
const DEFAULT_SPECIAL_CATS = [
  {id:"home",label:"בית ורהיטים"},{id:"tech",label:"טכנולוגיה"},
  {id:"clothing",label:"ביגוד"},{id:"gift",label:"מתנות"},
  {id:"medical",label:"רפואה"},{id:"other",label:"אחר"},
];
const DEFAULT_GROCERY = [
  {id:"g1",name:"חלב",checked:false,qty:"1",price:7},
  {id:"g2",name:"לחם",checked:false,qty:"1",price:12},
  {id:"g3",name:"ביצים",checked:false,qty:"1",price:18},
];
const DEFAULT_TRIPS = [
  {id:"t1",name:"אילת — קיץ 2026",budget:8000,items:[
    {id:"ti1",cat:"טיסות",label:"EL AL הלוך חזור",amount:2200,currency:"ILS",rateUsed:1},
    {id:"ti2",cat:"מלון", label:"מלון ישרוטל",   amount:3200,currency:"ILS",rateUsed:1},
  ],dateFrom:"2026-07-10",dateTo:"2026-07-17",color:T.navy},
];
const DEFAULT_RECIPES = [
  {id:"r1",type:"recipe",name:"פסטה ברוטב עגבניות",categories:["ארוחות ערב"],servings:4,prepTime:15,cookTime:25,
   ingredients:[{item:"פסטה",qty:"400",unit:"גרם"}],steps:["לבשל פסטה.","לטגן שום.","להוסיף עגבניות."],prepNotes:"",concepts:[]},
  {id:"r2",type:"menu",name:"ארוחת שישי משפחתית",categories:["ארוחות ערב"],servings:8,concepts:["ישראלי","משפחתי"],
   sections:[{id:"s1",title:"מנות ראשונות",dishes:["סלט ירקות","חומוס"]},{id:"s2",title:"עיקריות",dishes:["שניצל"]},{id:"s3",title:"קינוחים",dishes:["עוגת שוקולד"]}],notes:""},
];
const DEFAULT_NOTES = [
  {id:"n1",text:"לזכור לקנות מתנה לאמא השבוע",who:"א",date:"2026-03-05T10:30"},
  {id:"n2",text:"שרברב מגיע ביום שלישי בין 10-12",who:"ס",date:"2026-03-04T19:15"},
];
const DEFAULT_MENU_CONCEPTS = ["אסייתי","ים תיכוני","איטלקי","מקסיקני","ישראלי","חלבי","בשרי","דגים","מהיר","חגיגי"];
const RCATS = ["ארוחות בוקר","ארוחות ערב","ארוחות צהריים","קינוחים","טאפסים","אחר"];
const TCAT  = ["טיסות","מלון","ביטוח","תחבורה מקומית","אוכל","בילויים","כרטיסים","אחר"];

const CORRECT_PIN = "123456";

const fmt    = n   => "₪" + Math.round(n).toLocaleString("he-IL");
const fmtCur = (n,sym) => sym + Number(n).toLocaleString();
const today  = ()  => new Date().toISOString().slice(0,10);
const uid    = ()  => Date.now() + Math.floor(Math.random()*9999);

function highlight(text, query) {
  if (!query || !text) return String(text ?? "");
  const str = String(text);
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return str;
  return <span>{str.slice(0, idx)}<mark style={{background:"#fef08a",color:T.text,borderRadius:2,padding:"0 1px"}}>{str.slice(idx, idx + query.length)}</mark>{str.slice(idx + query.length)}</span>;
}

function SearchBar({ value, onChange, placeholder = "חיפוש…", style = {} }) {
  const ref = useRef();
  return (
    <div style={{ position:"relative", ...style }}>
      <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.textSub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </div>
      <input ref={ref} type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", background:T.surface, border:`1.5px solid ${value ? T.navy : T.border}`, borderRadius:10, padding:"9px 36px", color:T.text, fontSize:13, outline:"none", fontFamily:T.font, direction:"rtl" }}/>
      {value && <button onClick={() => { onChange(""); ref.current?.focus(); }} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:T.textSub, fontSize:16 }}>×</button>}
    </div>
  );
}

const fmtDt  = dt  => { const d=new Date(dt); return d.toLocaleDateString("he-IL")+" "+d.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}); };
const toILS  = item => item.currency==="ILS" ? +item.amount : (+item.amount)*(+item.rateUsed||1);
function fmtNum(n) {
  if (n === null || n === undefined || isNaN(n)) return "0";
  const rounded = Math.round(n * 1000) / 1000;
  if (Number.isInteger(rounded)) return rounded.toLocaleString("he-IL");
  const str = rounded.toFixed(3).replace(/\.?0+$/, "");
  return Number(str).toLocaleString("he-IL");
}

// ─── RATE LIMITER (shared across ALL API calls — prevents 429) ─────────────
const _rlState = { lastCall: 0, queue: Promise.resolve() };
async function rateLimitedFetch(body) {
  _rlState.queue = _rlState.queue.then(async () => {
    const wait = 4000 - (Date.now() - _rlState.lastCall);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    _rlState.lastCall = Date.now();
    const resp = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (resp.status === 429) {
      await new Promise(r => setTimeout(r, 12000));
      _rlState.lastCall = Date.now();
      return fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    return resp;
  });
  return _rlState.queue;
}

function useStorage(key,init){
  const [val,setVal]=useState(init);
  const ready=useRef(false);
  useEffect(()=>{
    (async()=>{
      try{const r=await window.storage?.get(key);if(r?.value)setVal(JSON.parse(r.value));}catch{}
      ready.current=true;
    })();
  },[]);
  const save=useCallback(v=>{
    setVal(v);
    if(ready.current)window.storage?.set(key,JSON.stringify(v)).catch(()=>{});
  },[key]);
  return [val,save];
}

async function fetchRate(code){
  if(code==="ILS")return 1;
  try{const r=await fetch("https://api.exchangerate-api.com/v4/latest/ILS");const d=await r.json();if(d.rates?.[code])return +(1/d.rates[code]).toFixed(4);}catch{}
  return {USD:3.68,EUR:4.02,GBP:4.65,JPY:0.025,AED:1.00}[code]||1;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
function Icon({name,size=16,color="currentColor"}){
  const p={
    basket:"M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
    car:"M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
    bolt:"m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
    sparkle:"M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z",
    heart:"M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
    home:"m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    plane:"M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5",
    chart:"M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
    plus:"M12 4.5v15m7.5-7.5h-15",
    trash:"m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0",
    settings:"M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    note:"M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487zm0 0L19.5 7.125",
    insights:"M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
    currency:"M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    pencil:"m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125",
    calendar:"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
    lock:"M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
    eye:"M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    eyeOff:"M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88",
    check:"M4.5 12.75l6 6 9-13.5",
    download:"M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3",
    trending:"M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941",
    wallet:"M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z",
    photo:"m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
    target:"M12 18.75a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5Z M12 12a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  };
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={p[name]||""}/>
    </svg>
  );
}

const globalCss=`
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-thumb{background:#d6d0c8;border-radius:4px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  @keyframes pinPop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .rte-editor{outline:none;min-height:70px;width:100%;font-family:'system-ui',system-ui;font-size:13px;color:#1c1917;line-height:1.7;direction:rtl;text-align:right;}
  .rte-editor b,.rte-editor strong{font-weight:700;}
  .rte-editor i,.rte-editor em{font-style:italic;}
  .rte-editor u{text-decoration:underline;}
  .rte-editor ul{padding-right:18px;list-style:disc;}
  .rte-editor ol{padding-right:18px;list-style:decimal;}
  .rte-editor li{margin-bottom:2px;}
`;

function Card({children,style={},onClick}){return <div onClick={onClick} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.03)",...style}}>{children}</div>;}
function Btn({children,variant="primary",onClick,style={},disabled=false}){
  const v={primary:{background:T.navy,color:"#fff"},secondary:{background:T.bg,color:T.textMid,border:`1px solid ${T.border}`},danger:{background:T.dangerBg,color:T.danger,border:`1px solid ${T.dangerBorder}`}};
  return <button onClick={onClick} disabled={disabled} style={{fontFamily:T.font,fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",borderRadius:10,padding:"9px 18px",border:"none",transition:"all .15s",opacity:disabled?.5:1,...v[variant],...style}}>{children}</button>;
}
function Inp({value,onChange,placeholder,type="text",style={},onKeyDown}){
  return <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",fontFamily:T.font,width:"100%",...style}}/>;
}
function PBar({value,max,color=T.navy,h=5}){
  const pct=Math.min(100,(value/(max||1))*100);
  return <div style={{background:"#ece8e2",borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:value>max?T.danger:color,transition:"width .7s cubic-bezier(.22,1,.36,1)"}}/></div>;
}
function CatDot({color,size=8}){return <span style={{width:size,height:size,borderRadius:"50%",background:color,display:"inline-block",flexShrink:0}}/>;}
function CatIcon({icon,color,size=36}){return <div style={{width:size,height:size,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={icon} size={size*.42} color={color}/></div>;}
function ActionBtns({onEdit,onDelete}){
  return(
    <div style={{display:"flex",gap:6,flexShrink:0}}>
      {onEdit&&<button onClick={e=>{e.stopPropagation();onEdit();}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="pencil" size={13} color={T.textMid}/></button>}
      <button onClick={e=>{e.stopPropagation();onDelete();}} style={{background:"none",border:`1px solid ${T.dangerBorder}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="trash" size={13} color={T.danger}/></button>
    </div>
  );
}
function ConfirmModal({message,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(28,25,23,.5)",backdropFilter:"blur(4px)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:18,padding:28,maxWidth:320,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.15)",animation:"fadeUp .2s ease",fontFamily:T.font,direction:"rtl"}}>
        <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:8,textAlign:"center"}}>אישור מחיקה</div>
        <div style={{fontSize:13,color:T.textMid,textAlign:"center",lineHeight:1.6,marginBottom:22}}>{message}</div>
        <div style={{display:"flex",gap:10}}><Btn variant="danger" onClick={onConfirm} style={{flex:1,padding:"11px"}}>מחיקה</Btn><Btn variant="secondary" onClick={onCancel} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
      </div>
    </div>
  );
}
function CurrencyField({currency,setCurrency,rate,setRate,amount}){
  const [loading,setLoading]=useState(false);
  useEffect(()=>{if(currency==="ILS"){setRate("1");return;}setLoading(true);fetchRate(currency).then(r=>{setRate(String(r));setLoading(false);});},[currency]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 8px",color:T.text,fontSize:13,fontFamily:T.font,outline:"none",width:"100%"}}>
        {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.name} ({c.code} {c.symbol})</option>)}
      </select>
      {currency!=="ILS"&&(
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{flex:1,position:"relative"}}><Inp type="number" placeholder="שער" value={rate} onChange={e=>setRate(e.target.value)}/>{loading&&<div style={{position:"absolute",top:10,left:12,fontSize:11,color:T.textSub}}>טוען…</div>}</div>
          <div style={{flex:1,background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.navy}}>{amount&&rate?`≈ ${fmt(+amount * +rate)}`:"= ? ₪"}</div>
        </div>
      )}
    </div>
  );
}
function PeriodPicker({month,year,setMonth,setYear}){
  return(
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <select value={year} onChange={e=>setYear(+e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"6px 12px",color:T.text,fontSize:13,fontFamily:T.font,fontWeight:600,outline:"none",cursor:"pointer"}}>
        {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
      </select>
      <div style={{width:1,height:18,background:T.border}}/>
      <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",flex:1}}>
        {MONTHS.map((m,i)=>(
          <button key={i} onClick={()=>setMonth(i)} style={{flexShrink:0,padding:"5px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s",border:`1px solid ${month===i?T.navy:T.border}`,background:month===i?T.navy:"transparent",color:month===i?"#fff":T.textSub}}>{m.slice(0,3)}</button>
        ))}
      </div>
    </div>
  );
}
function Donut({slices,size=140}){
  const total=slices.reduce((s,sl)=>s+sl.val,0);
  if(!total)return <div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,fontSize:12,flexShrink:0}}>אין נתונים</div>;
  const R=52,cx=size/2,cy=size/2,SW=16;let angle=-90;
  const arcs=slices.filter(s=>s.val>0).map(sl=>{
    const deg=(sl.val/total)*360,r1=(angle*Math.PI)/180,r2=((angle+deg)*Math.PI)/180,laf=deg>180?1:0;
    const d=`M${cx+R*Math.cos(r1)} ${cy+R*Math.sin(r1)} A${R} ${R} 0 ${laf} 1 ${cx+R*Math.cos(r2)} ${cy+R*Math.sin(r2)}`;
    angle+=deg;return{...sl,d};
  });
  return(
    <svg width={size} height={size} style={{flexShrink:0}}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#ece8e2" strokeWidth={SW}/>
      {arcs.map((a,i)=><path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={SW-2} strokeLinecap="round" style={{transition:"all .5s"}}/>)}
      <text x={cx} y={cy-6} textAnchor="middle" fill={T.text} fontSize="12" fontWeight="700" fontFamily={T.font}>{fmt(total)}</text>
      <text x={cx} y={cy+9} textAnchor="middle" fill={T.textSub} fontSize="9" fontFamily={T.font}>הוצאות</text>
    </svg>
  );
}

const EMOJIS=["😀","😂","❤️","👍","🙏","✅","⚠️","🎉","🍕","🏠","✈️","🛒","💰","📝","🔑","💡","📅","🎂","🌟","💪"];
function RichTextEditor({value,onChange,placeholder,minHeight=80}){
  const editorRef=useRef(null);
  const [showEmoji,setShowEmoji]=useState(false);
  const initialized=useRef(false);
    const isInternalChange=useRef(false);
    useEffect(()=>{
      if(editorRef.current&&!initialized.current){
        editorRef.current.innerHTML=value||"";
        initialized.current=true;
      }
    },[]);
    useEffect(()=>{
      if(!initialized.current)return;
      if(isInternalChange.current){isInternalChange.current=false;return;}
      if(editorRef.current)editorRef.current.innerHTML=value||"";
    },[value]);
  const exec=cmd=>{document.execCommand(cmd,false,null);editorRef.current?.focus();};
  const execVal=(cmd,val)=>{document.execCommand(cmd,false,val);editorRef.current?.focus();};
  const insertEmoji=e=>{execVal("insertText",e);setShowEmoji(false);};
  const handleInput=()=>{if(editorRef.current){isInternalChange.current=true;onChange(editorRef.current.innerHTML);}};
  const toolBtn=(label,action,title)=>(
    <button onMouseDown={ev=>{ev.preventDefault();action();}} title={title}
      style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:12,fontWeight:600,color:T.textMid,fontFamily:T.font,lineHeight:1}}>
      {label}
    </button>
  );
  return(
    <div style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden",background:T.surface,position:"relative"}}>
      <div style={{display:"flex",gap:4,padding:"6px 8px",borderBottom:`1px solid ${T.border}`,background:T.bg,flexWrap:"wrap",alignItems:"center"}}>
        {toolBtn("B",()=>exec("bold"),"מודגש")}
        {toolBtn("I",()=>exec("italic"),"נטוי")}
        {toolBtn("U",()=>exec("underline"),"קו תחתון")}
        <div style={{width:1,height:18,background:T.border,margin:"0 2px"}}/>
        {toolBtn("● ☰",()=>exec("insertUnorderedList"),"רשימת תבליטים")}
        {toolBtn("1. ☰",()=>exec("insertOrderedList"),"רשימה ממוספרת")}
        <div style={{width:1,height:18,background:T.border,margin:"0 2px"}}/>
        <div style={{position:"relative"}}>
          <button onMouseDown={ev=>{ev.preventDefault();setShowEmoji(v=>!v);}}
            style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:13,lineHeight:1}}>😊</button>
          {showEmoji&&(
            <div style={{position:"absolute",top:"110%",right:0,zIndex:200,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:8,display:"flex",flexWrap:"wrap",gap:4,width:200,boxShadow:"0 4px 16px rgba(0,0,0,.1)"}}>
              {EMOJIS.map(e=><button key={e} onMouseDown={ev=>{ev.preventDefault();insertEmoji(e);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,lineHeight:1,padding:2}}>{e}</button>)}
            </div>
          )}
        </div>
      </div>
      <div ref={editorRef} contentEditable suppressContentEditableWarning className="rte-editor" onInput={handleInput} data-placeholder={placeholder||""} style={{padding:"10px 14px",minHeight,background:T.surface,outline:"none",direction:"rtl",textAlign:"right"}}/>
      <style>{`.rte-editor:empty:before{content:attr(data-placeholder);color:#a8a29e;pointer-events:none;}`}</style>
    </div>
  );
}

function AddExpenseDrawer({cats,onAdd,onClose,initData=null}){
  const [step,setStep]=useState(initData?1:0);
  const [form,setForm]=useState(initData||{amount:"",desc:"",catId:cats[0]?.id||"",who:"א",date:today()});
  const np=[["1","2","3"],["4","5","6"],["7","8","9"],["⌫","0","✓"]];
  const press=k=>{
    if(k==="⌫"){setForm(f=>({...f,amount:f.amount.slice(0,-1)}));return;}
    if(k==="✓"){if(form.amount)setStep(1);return;}
    if(form.amount.length>=6)return;
    setForm(f=>({...f,amount:f.amount+k}));
  };
  const submit=()=>{if(!form.amount||!form.catId)return;onAdd({...form,id:form.id||uid(),amount:+form.amount});onClose();};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(28,25,23,.45)",backdropFilter:"blur(6px)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderTop:`1px solid ${T.border}`,borderRadius:"22px 22px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:480,fontFamily:T.font,direction:"rtl",animation:"slideUp .28s cubic-bezier(.22,1,.36,1)"}}>
        <div style={{width:32,height:3,borderRadius:2,background:T.border,margin:"0 auto 20px"}}/>
        {step===0?(
          <>
            <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:44,fontWeight:300,color:form.amount?T.text:T.border,fontFamily:T.display,letterSpacing:-1,minHeight:56}}>{form.amount?`₪${form.amount}`:"₪0"}</div></div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {np.map((row,ri)=>(
                <div key={ri} style={{display:"flex",gap:6,flexDirection:"row-reverse"}}>
                  {row.map(k=><button key={k} onClick={()=>press(k)} style={{flex:1,padding:"14px 0",borderRadius:12,fontFamily:T.font,border:`1px solid ${k==="✓"?T.navy:T.border}`,background:k==="✓"?T.navy:T.surface,color:k==="✓"?"#fff":T.text,fontSize:k==="✓"||k==="⌫"?17:19,fontWeight:500,cursor:"pointer"}}>{k}</button>)}
                </div>
              ))}
            </div>
          </>
        ):(
          <>
            <div style={{fontSize:26,fontWeight:300,color:T.text,fontFamily:T.display,textAlign:"center",marginBottom:20}}>{fmt(+form.amount)}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Inp placeholder="תיאור" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{cats.map(c=><button key={c.id} onClick={()=>setForm({...form,catId:c.id})} style={{padding:"7px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${form.catId===c.id?c.color:T.border}`,background:form.catId===c.id?c.color+"15":"transparent",color:form.catId===c.id?c.color:T.textMid}}>{c.label}</button>)}</div>
              <div style={{display:"flex",gap:8}}>{[["א","אדיר"],["ס","ספיר"]].map(([v,l])=><button key={v} onClick={()=>setForm({...form,who:v})} style={{flex:1,padding:"10px",borderRadius:10,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",border:`1px solid ${form.who===v?T.navy:T.border}`,background:form.who===v?T.navyLight:"transparent",color:form.who===v?T.navy:T.textMid}}>{l}</button>)}</div>
              <Inp type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              <Btn onClick={submit} style={{padding:"13px",borderRadius:12,fontSize:14}}>שמירה</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PinScreen({onUnlock}){
  const [pin,setPin]=useState("");
  const [showPin,setShowPin]=useState(false);
  const [shaking,setShaking]=useState(false);
  const [attempts,setAttempts]=useState(0);
  const [locked,setLocked]=useState(false);
  const np=[["1","2","3"],["4","5","6"],["7","8","9"],["⌫","0","✓"]];
  const submit=useCallback((pinVal)=>{
    if(locked||shaking)return;
    if(pinVal===CORRECT_PIN){try{sessionStorage.setItem("sinario_auth","1");}catch{}onUnlock();}
    else{
      const att=attempts+1;setAttempts(att);
      if(att>=5){setLocked(true);setTimeout(()=>{setLocked(false);setAttempts(0);setPin("");},30000);return;}
      setShaking(true);setTimeout(()=>{setShaking(false);setPin("");},500);
    }
  },[locked,shaking,attempts,onUnlock]);
  const press=k=>{
    if(locked||shaking)return;
    if(k==="⌫"){setPin(p=>p.slice(0,-1));return;}
    if(k==="✓"){if(pin)submit(pin);return;}
    setPin(p=>p+k);
  };
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,#0d1f35 0%,#1e3a5f 55%,#2d5282 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,direction:"rtl",padding:20,position:"relative",overflow:"hidden"}}>
      <style>{globalCss}</style>
      <div style={{position:"absolute",top:-100,left:-100,width:400,height:400,borderRadius:"50%",background:"rgba(255,255,255,.03)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-150,right:-80,width:500,height:500,borderRadius:"50%",background:"rgba(255,255,255,.02)",pointerEvents:"none"}}/>
      <div style={{display:"flex",flexDirection:"row-reverse",alignItems:"center",gap:10,marginBottom:44,animation:"pinPop .5s ease"}}>
        <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,.15)"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="19" cy="6" r="3" fill="#f0c040" stroke="#fff" strokeWidth="1.2"/></svg>
        </div>
        <div style={{fontSize:26,fontWeight:700,color:"#fff",fontFamily:T.display,letterSpacing:-.5}}>Sinario</div>
      </div>
      <div style={{background:"rgba(255,255,255,.06)",backdropFilter:"blur(24px)",border:"1px solid rgba(255,255,255,.1)",borderRadius:28,padding:"32px 28px 36px",width:"100%",maxWidth:320,boxShadow:"0 40px 80px rgba(0,0,0,.5)",animation:"pinPop .5s ease .08s both"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:44,height:44,borderRadius:13,background:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Icon name="lock" size={20} color="rgba(255,255,255,.75)"/></div>
          <div style={{fontSize:16,fontWeight:600,color:"#fff",letterSpacing:-.2}}>{locked?"חשבון נעול זמנית":"יש להזין קוד PIN"}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:28,animation:shaking?"shake .45s ease":"none"}}>
          <div style={{flex:1,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,padding:"10px 14px",textAlign:"center",letterSpacing:6,fontSize:20,color:"#fff",fontFamily:"monospace",minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {pin.length===0?<span style={{color:"rgba(255,255,255,.25)",fontSize:13,letterSpacing:0}}>PIN</span>:showPin?pin:"•".repeat(pin.length)}
          </div>
          <button onClick={()=>setShowPin(v=>!v)} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"10px",cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0}}>
            <Icon name={showPin?"eyeOff":"eye"} size={18} color="rgba(255,255,255,.6)"/>
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {np.map((row,ri)=>(
            <div key={ri} style={{display:"flex",gap:10,flexDirection:"row-reverse"}}>
              {row.map(k=>(
                <button key={k} onClick={()=>press(k)} disabled={locked}
                  style={{flex:1,padding:"15px 0",borderRadius:14,fontFamily:T.font,fontSize:k==="✓"||k==="⌫"?15:20,fontWeight:500,cursor:!locked?"pointer":"default",border:`1px solid ${k==="✓"?"rgba(255,255,255,.3)":"rgba(255,255,255,.1)"}`,background:k==="✓"?"rgba(255,255,255,.18)":"rgba(255,255,255,.08)",color:"#fff",opacity:locked?.4:1,lineHeight:1}}>
                  {k==="✓"?<span style={{display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="check" size={18} color="#fff"/></span>:k}
                </button>
              ))}
            </div>
          ))}
        </div>
        {attempts>0&&!locked&&<div style={{marginTop:14,textAlign:"center",fontSize:12,color:"#fca5a5",fontWeight:500}}>{attempts>=4?"עוד ניסיון אחד לנעילה":"קוד שגוי, נסה שוב"}</div>}
        {locked&&<div style={{marginTop:14,textAlign:"center",fontSize:12,color:"#fca5a5",fontWeight:500}}>נסה שוב עוד כמה שניות</div>}
      </div>
      <div style={{marginTop:24,fontSize:11,color:"rgba(255,255,255,.2)"}}>Sinario © {new Date().getFullYear()}</div>
    </div>
  );
}

function ExpensesTab({expenses,setExpenses,cats,month,year,specialItems,setSpecialItems,specialCatsList,monthSpecialTotal=0}){
  const [expMode,setExpMode]=useState("regular");
  const [showAdd,setShowAdd]=useState(false);
  const [editExp,setEditExp]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  const [showSpecialForm,setShowSpecialForm]=useState(false);
  const [editSpecialId,setEditSpecialId]=useState(null);
  const [confirmSpecialId,setConfirmSpecialId]=useState(null);
  const [showAll,setShowAll]=useState(false);
  const [searchQ,setSearchQ]=useState("");
  const blankSp={desc:"",catId:"home",amount:"",currency:"ILS",rateUsed:"1",date:today()};
  const [spForm,setSpForm]=useState(blankSp);
  const totalBudget=cats.reduce((s,c)=>s+c.budget,0);
  const regularTotal=expenses.reduce((s,e)=>s+e.amount,0);
  // Compute fresh from specialItems so new additions reflect immediately
  const liveSpecialTotal=specialItems.filter(i=>{const d=new Date(i.date);return d.getMonth()===month&&d.getFullYear()===year;}).reduce((s,i)=>s+toILS(i),0);
  const combinedTotal=regularTotal+liveSpecialTotal;
  const catSpent=id=>expenses.filter(e=>e.catId===id).reduce((s,e)=>s+e.amount,0);
  const adir=expenses.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0);
  const sapir=expenses.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0);
  const diff=Math.abs(adir-sapir)/2;
  const from=adir>sapir?"ספיר":"אדיר";
  const doDelete=id=>{setExpenses(expenses.filter(e=>e.id!==id));setConfirmId(null);};
  const filteredExp = searchQ
    ? expenses.filter(e => {
        const cat = cats.find(c => c.id === e.catId);
        return (e.desc||"").toLowerCase().includes(searchQ.toLowerCase())
            || (cat?.label||"").toLowerCase().includes(searchQ.toLowerCase())
            || String(e.amount).includes(searchQ);
      })
    : expenses.slice(0, 8);
  const doEdit=u=>setExpenses(expenses.map(e=>e.id===u.id?{...u,amount:+u.amount}:e));
  const periodSpecial=showAll?[...specialItems].sort((a,b)=>new Date(b.date)-new Date(a.date)):specialItems.filter(i=>{const d=new Date(i.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const specialTotal=periodSpecial.reduce((s,i)=>s+toILS(i),0);
  const openAddSp=()=>{setEditSpecialId(null);setSpForm(blankSp);setShowSpecialForm(true);};
  const openEditSp=item=>{setEditSpecialId(item.id);setSpForm({...item,amount:String(item.amount),rateUsed:String(item.rateUsed||1)});setShowSpecialForm(true);};
  const saveSp=()=>{
    if(!spForm.desc||!spForm.amount)return;
    if(editSpecialId)setSpecialItems(specialItems.map(x=>x.id===editSpecialId?{...spForm,id:editSpecialId,amount:+spForm.amount,rateUsed:+spForm.rateUsed||1}:x));
    else setSpecialItems([...specialItems,{...spForm,id:uid(),amount:+spForm.amount,rateUsed:+spForm.rateUsed||1}]);
    setSpForm(blankSp);setShowSpecialForm(false);setEditSpecialId(null);
  };
  const doDeleteSp=id=>{setSpecialItems(specialItems.filter(x=>x.id!==id));setConfirmSpecialId(null);};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {confirmId&&<ConfirmModal message="למחוק הוצאה זו?" onConfirm={()=>doDelete(confirmId)} onCancel={()=>setConfirmId(null)}/>}
      {confirmSpecialId&&<ConfirmModal message="למחוק הוצאה מיוחדת זו?" onConfirm={()=>doDeleteSp(confirmSpecialId)} onCancel={()=>setConfirmSpecialId(null)}/>}
      {editExp&&<AddExpenseDrawer cats={cats} initData={editExp} onAdd={doEdit} onClose={()=>setEditExp(null)}/>}
      <div style={{display:"flex",background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:3,gap:3}}>
        {[["regular","הוצאות שוטפות"],["special","הוצאות מיוחדות"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setExpMode(v);setSearchQ("");}} style={{flex:1,padding:"9px",borderRadius:9,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",border:"none",background:expMode===v?T.surface:"transparent",color:expMode===v?T.navy:T.textSub,boxShadow:expMode===v?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .15s"}}>{l}</button>
        ))}
      </div>
      <SearchBar
        value={searchQ}
        onChange={setSearchQ}
        placeholder={expMode==="regular" ? "חיפוש הוצאה, קטגוריה, סכום…" : "חיפוש הוצאה מיוחדת…"}
      />
      {expMode==="regular"&&(<>
        <div style={{display:"flex",justifyContent:"end",alignItems:"center"}}>
          <Btn onClick={()=>setShowAdd(true)} style={{padding:"8px 16px",fontSize:13,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn>
        </div>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>סה"כ הוצאות</div>
              <div style={{fontSize:34,fontWeight:400,color:T.text,fontFamily:T.display,letterSpacing:-1}}>{fmt(combinedTotal)}</div>
              <div style={{fontSize:12,color:T.textSub,marginTop:4}}>מתוך {fmt(totalBudget)} תקציב</div>
              {liveSpecialTotal>0&&<div style={{fontSize:11,color:T.navyMid,marginTop:3}}>כולל {fmt(liveSpecialTotal)} הוצאות מיוחדות</div>}
            </div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:28,fontWeight:600,color:combinedTotal>totalBudget?T.danger:T.navy,fontFamily:T.display}}>{Math.round((combinedTotal/(totalBudget||1))*100)}%</div>
              <div style={{fontSize:11,color:T.textSub}}>נוצל</div>
            </div>
          </div>
          <PBar value={combinedTotal} max={totalBudget} color={combinedTotal>totalBudget?T.danger:T.navy} h={6}/>
          <div style={{marginTop:8,fontSize:12,fontWeight:600,color:combinedTotal>totalBudget?T.danger:T.success}}>
            {combinedTotal>totalBudget?`חריגה של ${fmt(combinedTotal-totalBudget)}`:`נותר ${fmt(totalBudget-combinedTotal)}`}
          </div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["אדיר",adir],["ספיר",sapir]].map(([name,amt])=>(
            <Card key={name} style={{padding:16}}>
              <div style={{fontSize:11,color:T.textSub,fontWeight:600,marginBottom:4}}>{name}</div>
              <div style={{fontSize:22,fontWeight:600,color:T.text,fontFamily:T.display}}>{fmt(amt)}</div>
              <div style={{fontSize:11,color:T.textSub,marginTop:2}}>{((amt/(regularTotal||1))*100).toFixed(0)}%</div>
            </Card>
          ))}
        </div>
        {diff>5&&<Card style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,padding:16}}><div style={{fontSize:11,color:T.navyMid,fontWeight:700,marginBottom:4}}>סוגרים חשבון</div><div style={{fontSize:17,fontWeight:600,color:T.navy}}>{from}: {fmt(diff)}</div></Card>}
        <Card style={{padding:16}}>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>חלוקה לקטגוריות</div>
              {cats.map(c=>{const sp=catSpent(c.id);return(
                <div key={c.id} style={{marginBottom:11}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}><CatIcon icon={c.icon} color={c.color} size={28}/><span style={{fontSize:12,color:T.textMid,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.label}</span></div>
                    <span style={{fontSize:12,color:sp>c.budget?T.danger:T.textSub,flexShrink:0,fontWeight:sp>c.budget?600:400}}>{fmt(sp)}</span>
                  </div>
                  <PBar value={sp} max={c.budget} color={c.color} h={4}/>
                </div>
              );})}
            </div>
            <Donut slices={cats.map(c=>({val:catSpent(c.id),color:c.color}))} size={140}/>
          </div>
        </Card>
        <Card>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>{searchQ?`תוצאות (${filteredExp.length})`:"הוצאות אחרונות"}</div>
          {filteredExp.map((ex,i)=>{const cat=cats.find(c=>c.id===ex.catId);return(
            <div key={ex.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<filteredExp.length-1?`1px solid ${T.border}`:"none"}}>
              <CatIcon icon={cat?.icon||"basket"} color={cat?.color||T.navy}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:T.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{highlight(ex.desc||"הוצאה",searchQ)}</div>
                <div style={{fontSize:11,color:T.textSub}}>{highlight(cat?.label,searchQ)} · {ex.who==="א"?"אדיר":"ספיר"} · {new Date(ex.date).toLocaleDateString("he-IL")}</div>
              </div>
              <div style={{fontSize:14,fontWeight:600,color:T.text,flexShrink:0}}>{fmt(ex.amount)}</div>
                <ActionBtns onEdit={()=>setEditExp({...ex,amount:String(ex.amount)})} onDelete={()=>setConfirmId(ex.id)}/>
            </div>
          );})}
          {expenses.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:24,fontSize:13}}>אין הוצאות עדיין</div>}
        </Card>
        {showAdd&&<AddExpenseDrawer cats={cats} onAdd={e=>setExpenses([e,...expenses])} onClose={()=>setShowAdd(false)}/>}
      </>)}
      {expMode==="special"&&(<>
        <div style={{display:"flex",justifyContent:"end",alignItems:"center"}}>
          <Btn onClick={openAddSp} style={{padding:"8px 16px",display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn>
        </div>
        <Card style={{background:"rgb(235, 240, 247)",border:"1px solid rgb(195, 212, 232)",padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:11,color:"#0369a1",fontWeight:700,letterSpacing:1,marginBottom:4}}>{showAll?"סה\"כ הוצאות מיוחדות":"סה\"כ הוצאות מיוחדות החודש"}</div>
              <div style={{fontSize:34,fontWeight:400,fontFamily:T.display,color:"#0c4a6e",letterSpacing:-1}}>{fmt(specialTotal)}</div>
              {periodSpecial.length>0&&<div style={{fontSize:11,color:"#0369a1",marginTop:3}}>{periodSpecial.length} הוצאות</div>}
              <button onClick={()=>setShowAll(v=>!v)} style={{marginTop:8,fontSize:11,color:"rgb(30, 58, 95)",fontFamily:T.font,background:"rgba(255,255,255,0.5)",border:"1px solid rgb(30, 58, 95)",borderRadius:99,padding:"4px 12px",cursor:"pointer",fontWeight:600}}>{showAll?"חזרה לתקופה":"צפייה בהכל"}</button>
            </div>
          </div>
        </Card>
        {showSpecialForm&&(
          <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
            <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>{editSpecialId?"עריכת הוצאה":"הוצאה מיוחדת חדשה"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Inp placeholder="תיאור" value={spForm.desc} onChange={e=>setSpForm({...spForm,desc:e.target.value})}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{specialCatsList.map(c=><button key={c.id} onClick={()=>setSpForm({...spForm,catId:c.id})} style={{padding:"6px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${spForm.catId===c.id?T.navy:T.border}`,background:spForm.catId===c.id?T.navyLight:"transparent",color:spForm.catId===c.id?T.navy:T.textMid}}>{c.label}</button>)}</div>
              <Inp type="number" placeholder="סכום" value={spForm.amount} onChange={e=>setSpForm({...spForm,amount:e.target.value})}/>
              <CurrencyField currency={spForm.currency} setCurrency={c=>setSpForm({...spForm,currency:c})} rate={spForm.rateUsed} setRate={r=>setSpForm({...spForm,rateUsed:r})} amount={spForm.amount}/>
              <Inp type="date" value={spForm.date} onChange={e=>setSpForm({...spForm,date:e.target.value})}/>
              <div style={{display:"flex",gap:8}}><Btn onClick={saveSp} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowSpecialForm(false);setEditSpecialId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
            </div>
          </Card>
        )}
        {(searchQ ? periodSpecial.filter(i=>(i.desc||"").toLowerCase().includes(searchQ.toLowerCase())) : periodSpecial).map(item=>{const cat=specialCatsList.find(c=>c.id===item.catId);const cur=CURRENCIES.find(c=>c.code===item.currency)||CURRENCIES[0];return(
          <Card key={item.id} style={{padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:3}}>{highlight(item.desc,searchQ)}</div>
                <div style={{fontSize:11,color:T.textSub,marginBottom:4}}>{cat?.label} · {new Date(item.date).toLocaleDateString("he-IL")}</div>
                {item.currency!=="ILS"&&<div style={{fontSize:12,color:T.textSub}}>{fmtCur(item.amount,cur.symbol)} × שער {item.rateUsed}</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <div style={{fontSize:18,fontWeight:600,color:T.text,fontFamily:T.display}}>{fmt(toILS(item))}</div>
                <ActionBtns onEdit={()=>openEditSp(item)} onDelete={()=>setConfirmSpecialId(item.id)}/>
              </div>
            </div>
          </Card>
        );})}
        {periodSpecial.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>{showAll?"אין הוצאות מיוחדות":`אין הוצאות מיוחדות ב${MONTHS[month]} ${year}`}</div>}
      </>)}
    </div>
  );
}

// ── Pre-processing: שפר את התמונה לפני OCR ──
async function preprocessImage(file){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    const url=URL.createObjectURL(file);
    img.onload=()=>{
      const canvas=document.createElement("canvas");
      // הגדל פי 2 לדיוק טוב יותר
      const scale=Math.min(2, 3000/Math.max(img.width,img.height));
      canvas.width=img.width*scale;
      canvas.height=img.height*scale;
      const ctx=canvas.getContext("2d");

      // רקע לבן
      ctx.fillStyle="#ffffff";
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // צייר תמונה מוגדלת
      ctx.drawImage(img,0,0,canvas.width,canvas.height);

      // שפר ניגודיות
      const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
      const data=imageData.data;
      for(let i=0;i<data.length;i+=4){
        // המר לגווני אפור
        const gray=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];
        // threshold — הפוך לשחור/לבן
        const bw=gray>128?255:0;
        data[i]=data[i+1]=data[i+2]=bw;
      }
      ctx.putImageData(imageData,0,0);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror=reject;
    img.src=url;
  });
}

// ── פרסור חכם של טקסט קבלה ──
function parseReceiptText(rawText){
  const lines=rawText
    .split("\n")
    .map(l=>l.trim())
    .filter(l=>l.length>1);

  // מילים לדילוג
  const skipPatterns=[
    /סה.?כ/,/total/i,/מע.?מ/,/vat/i,/שלם/,/cash/i,/change/i,
    /תודה/,/thank/i,/חשבונית/,/קבלה/,/תאריך/,/date/i,
    /מספר/,/טלפון/,/phone/i,/קופה/,/פקיד/,
    /^\d{1,2}[/.]\d{1,2}[/.]\d{2,4}$/,  // תאריך
    /^\d{2,4}$/,                           // מספר קצר בלבד
    /^[*\-=_]{2,}$/,                       // קווים מפרידים
  ];

  const pricePattern=/(\d+[.,]\d{2})\s*$/;  // מחיר בסוף שורה
  const qtyPattern=/^(\d+)\s*[×xX*]\s*/;    // כמות בתחילה

  const items=[];

  for(const line of lines){
    // דלג על שורות שלא רלוונטיות
    if(skipPatterns.some(p=>p.test(line)))continue;

    // חלץ כמות
    const qtyMatch=line.match(qtyPattern);
    const qty=qtyMatch?qtyMatch[1]:"1";

    // חלץ מחיר
    const priceMatch=line.match(pricePattern);
    const price=priceMatch?parseFloat(priceMatch[1].replace(",",".")):0;

    // נקה את שם המוצר
    let name=line
      .replace(qtyPattern,"")
      .replace(pricePattern,"")
      .replace(/[\d.,₪$%]+/g," ")
      .replace(/[×xX*]/g," ")
      .trim()
      .replace(/\s+/g," ");

    // וידוא שם תקין
    if(name.length<2||name.length>60)continue;
    // דלג אם נשאר רק מספרים/סימנים
    if(/^[\d\s.,*×%₪$-]+$/.test(name))continue;

    items.push({id:uid(),name,qty,checked:false,price});
  }

  return items;
}

function GroceryTab(){
  const LISTS_KEY="kp-grocery-lists";
  const [lists,setLists]=useStorage(LISTS_KEY,[{id:"default",name:"רשימה ראשית",items:DEFAULT_GROCERY}]);
  const [activeListId,setActiveListId]=useStorage("kp-grocery-active","default");
  const [newItem,setNewItem]=useState({name:"",qty:"1"});
  const [scanMsg,setScanMsg]=useState("");
  const [confirmClear,setConfirmClear]=useState(false);
  const [previewItems,setPreviewItems]=useState(null); // null = no preview
  const [editingListName,setEditingListName]=useState(false);
  const [newListName,setNewListName]=useState("");
  const [showNewList,setShowNewList]=useState(false);
  const [searchQ,setSearchQ]=useState("");
  const fileRef=useRef();

  const activeList=lists.find(l=>l.id===activeListId)||lists[0]||{id:"default",name:"רשימה",items:[]};
  const grocery=activeList.items||[];
  const setGrocery=items=>setLists(lists.map(l=>l.id===activeList.id?{...l,items}:l));

  const add=()=>{
    if(!newItem.name.trim())return;
    setGrocery([...grocery,{id:uid(),name:newItem.name.trim(),qty:newItem.qty||"1",checked:false}]);
    setNewItem({name:"",qty:"1"});
  };
  const toggle=id=>setGrocery(grocery.map(g=>g.id===id?{...g,checked:!g.checked}:g));
  const remove=id=>setGrocery(grocery.filter(g=>g.id!==id));
  const uncheckAll=()=>setGrocery(grocery.map(g=>({...g,checked:false})));
  const clearDone=()=>{setGrocery(grocery.filter(g=>!g.checked));setConfirmClear(false);};
  const active=grocery.filter(g=>!g.checked && (!searchQ || g.name.toLowerCase().includes(searchQ.toLowerCase())));
  const done=grocery.filter(g=>g.checked && (!searchQ || g.name.toLowerCase().includes(searchQ.toLowerCase())));
  const activeAll=grocery.filter(g=>!g.checked);
  const doneAll=grocery.filter(g=>g.checked);
  const COL_QTY=60;

const handleReceiptUpload=async e=>{
  const file=e.target.files?.[0];
  if(!file)return;

  // וידוא שזו תמונה בלבד
  if(!file.type.startsWith("image/")){
    setScanMsg("יש להעלות תמונה בלבד (JPG, PNG)");
    setTimeout(()=>setScanMsg(""),3000);
    e.target.value="";return;
  }

  setScanMsg("מכין תמונה…");

  try{
    // ── שלב 1: Pre-processing — שפר ניגודיות וחדד ──
    const processedBase64=await preprocessImage(file);

    setScanMsg("מזהה טקסט…");

    // ── שלב 2: טען Tesseract ──
    if(!window.Tesseract){
      await new Promise((res,rej)=>{
        const s=document.createElement("script");
        s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
        s.onload=res;s.onerror=rej;
        document.head.appendChild(s);
      });
    }

    // ── שלב 3: הרץ OCR עם עברית + אנגלית ──
    const {data:{text}}=await window.Tesseract.recognize(
      processedBase64,
      "heb+eng",
      {
        logger:m=>{
          if(m.status==="recognizing text")
            setScanMsg(`מזהה… ${Math.round(m.progress*100)}%`);
        }
      }
    );

    setScanMsg("מפרסר פריטים…");

    // ── שלב 4: עיבוד חכם של הטקסט ──
    const parsed=parseReceiptText(text);

    if(parsed.length){
      setPreviewItems(parsed);
      setScanMsg("");
    } else {
      setScanMsg("לא זוהו פריטים — נסה תמונה ברורה יותר");
      setTimeout(()=>setScanMsg(""),4000);
    }
  }catch(err){
    console.error(err);
    setScanMsg("שגיאה — נסה שוב");
    setTimeout(()=>setScanMsg(""),4000);
  }
  e.target.value="";
};

  const confirmPreview=()=>{
    if(!previewItems)return;
    setGrocery([...grocery,...previewItems]);
    setPreviewItems(null);
  };

  const createList=()=>{
    if(!newListName.trim())return;
    const id=uid();
    setLists([...lists,{id,name:newListName.trim(),items:[]}]);
    setActiveListId(id);
    setNewListName("");
    setShowNewList(false);
  };

  const deleteList=id=>{
    if(lists.length<=1)return;
    const remaining=lists.filter(l=>l.id!==id);
    setLists(remaining);
    if(activeListId===id)setActiveListId(remaining[0].id);
  };

  // ── Preview modal ──
  if(previewItems){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1}}>תצוגה מקדימה</div>
            <div style={{fontSize:22,fontWeight:300,fontFamily:T.display,color:T.text}}>{previewItems.length} פריטים זוהו</div>
          </div>
          <button onClick={()=>setPreviewItems(null)} style={{background:"none",border:"none",fontSize:20,color:T.textSub,cursor:"pointer"}}>✕</button>
        </div>
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",padding:"9px 14px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
            <div style={{flex:1,fontSize:10,color:T.textSub,fontWeight:700,textAlign:"right"}}>שם פריט</div>
            <div style={{width:COL_QTY,fontSize:10,color:T.textSub,fontWeight:700,textAlign:"center"}}>כמות</div>
            <div style={{width:22}}/>
          </div>
          {previewItems.map((item,i)=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",padding:"9px 14px",borderBottom:i<previewItems.length-1?`1px solid ${T.border}`:"none"}}>
              <input
                value={item.name}
                onChange={e=>setPreviewItems(previewItems.map(x=>x.id===item.id?{...x,name:e.target.value}:x))}
                style={{flex:1,background:"transparent",border:"none",borderBottom:`1px dashed ${T.border}`,padding:"3px 4px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,textAlign:"right"}}
              />
              <input
                type="number"
                value={item.qty}
                onChange={e=>setPreviewItems(previewItems.map(x=>x.id===item.id?{...x,qty:e.target.value}:x))}
                style={{width:COL_QTY,background:"transparent",border:"none",padding:"4px",color:T.textMid,fontSize:12,outline:"none",fontFamily:T.font,textAlign:"center"}}
              />
              <button onClick={()=>setPreviewItems(previewItems.filter(x=>x.id!==item.id))} style={{background:"none",border:"none",color:T.border,cursor:"pointer",fontSize:17,lineHeight:1,width:22,textAlign:"center"}}>×</button>
            </div>
          ))}
        </Card>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setPreviewItems(null)} style={{flex:1,padding:"11px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textMid,fontSize:13,fontFamily:T.font,fontWeight:600,cursor:"pointer"}}>ביטול</button>
          <Btn onClick={confirmPreview} style={{flex:2,padding:"11px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <Icon name="plus" size={13} color="#fff"/>הוספת {previewItems.length} פריטים לרשימה
          </Btn>
        </div>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {confirmClear&&<ConfirmModal message={`למחוק ${doneAll.length} פריטים שנרכשו?`} onConfirm={clearDone} onCancel={()=>setConfirmClear(false)}/>}

      {/* List selector */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {lists.map(l=>(
          <div key={l.id} style={{display:"flex",alignItems:"center",gap:0,borderRadius:99,border:`1.5px solid ${activeList.id===l.id?T.navy:T.border}`,background:activeList.id===l.id?T.navyLight:"transparent",overflow:"hidden"}}>
            <button onClick={()=>setActiveListId(l.id)} style={{padding:"5px 12px",background:"transparent",border:"none",fontFamily:T.font,fontSize:12,fontWeight:600,color:activeList.id===l.id?T.navy:T.textSub,cursor:"pointer"}}>{l.name}</button>
            {lists.length>1&&<button onClick={()=>deleteList(l.id)} style={{padding:"5px 7px 5px 2px",background:"transparent",border:"none",color:T.textSub,cursor:"pointer",fontSize:13,lineHeight:1}}>×</button>}
          </div>
        ))}
        {showNewList
          ? <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <Inp placeholder="שם הרשימה" value={newListName} onChange={e=>setNewListName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")createList();if(e.key==="Escape")setShowNewList(false);}} style={{width:130,fontSize:12,padding:"6px 10px"}} autoFocus/>
              <Btn onClick={createList} style={{padding:"6px 10px",fontSize:12}}>שמירה</Btn>
              <button onClick={()=>setShowNewList(false)} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          : <button onClick={()=>setShowNewList(true)} style={{padding:"5px 10px",borderRadius:99,border:`1.5px dashed ${T.border}`,background:"transparent",fontFamily:T.font,fontSize:12,color:T.textSub,cursor:"pointer"}}>+ רשימה חדשה</button>
        }
      </div>

      {/* Search bar */}
      <SearchBar value={searchQ} onChange={setSearchQ} placeholder="חיפוש פריט…" />

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1}}>פריטים שנותרו</div>
          <div style={{fontSize:26,fontWeight:300,fontFamily:T.display,color:T.text}}>{searchQ?`${active.length} מתוך ${activeAll.length}`:`${activeAll.length} פריטים`}</div>
        </div>
        {doneAll.length>0&&(
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={uncheckAll} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bg,color:T.textMid,fontSize:12,fontFamily:T.font,fontWeight:600,cursor:"pointer"}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ביטול בחירה
            </button>
            <button onClick={()=>setConfirmClear(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,border:`1px solid ${T.dangerBorder}`,background:T.dangerBg,color:T.danger,fontSize:12,fontFamily:T.font,fontWeight:600,cursor:"pointer"}}>
              <Icon name="trash" size={13} color={T.danger}/>מחיקה
            </button>
          </div>
        )}
      </div>

      {/* Add item */}
      <Card style={{padding:12}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <Inp placeholder="שם פריט" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&add()} style={{flex:1}}/>
          <input type="number" placeholder="כמות" value={newItem.qty} onChange={e=>setNewItem({...newItem,qty:e.target.value})} style={{width:COL_QTY,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 4px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,textAlign:"center"}}/>
          <Btn onClick={add} style={{padding:"10px 12px",flexShrink:0}}><Icon name="plus" size={13} color="#fff"/></Btn>
        </div>
      </Card>

      {/* Receipt upload */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleReceiptUpload} style={{display:"none"}}/>
      <Card style={{border:`1.5px dashed ${T.border}`,background:T.bg,padding:14,cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <Icon name="photo" size={16} color={T.textSub}/>
          <span style={{fontSize:13,fontWeight:500,color:T.textSub}}>{scanMsg||"העלאת קבלה — תמונה או PDF"}</span>
          {scanMsg&&!scanMsg.startsWith("✓")&&!scanMsg.startsWith("לא")&&<div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${T.navy}`,borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>}
        </div>
        {!scanMsg&&<div style={{fontSize:11,color:T.textSub,marginTop:3,textAlign:"center"}}>חילוץ פריטים אוטומטי + תצוגה מקדימה לפני שמירה</div>}
      </Card>

      {/* Items list */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",padding:"9px 14px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
          <div style={{width:24,flexShrink:0}}/>
          <div style={{flex:1,fontSize:10,color:T.textSub,fontWeight:700,letterSpacing:.5,textAlign:"right",paddingRight:10}}>פריט</div>
          <div style={{width:1,height:14,background:T.border,marginLeft:8,flexShrink:0}}/>
          <div style={{width:COL_QTY+4,fontSize:10,color:T.textSub,fontWeight:700,textAlign:"center",flexShrink:0}}>כמות</div>
          <div style={{width:22,flexShrink:0}}/>
        </div>
        {active.map((g,i)=>(
          <div key={g.id} style={{display:"flex",alignItems:"center",padding:"9px 14px",borderBottom:i<active.length-1||done.length>0?`1px solid ${T.border}`:"none"}}>
            <button onClick={()=>toggle(g.id)} style={{width:20,height:20,borderRadius:6,border:`1.5px solid ${T.borderHover}`,background:"transparent",cursor:"pointer",flexShrink:0}}/>
            <div style={{flex:1,fontSize:13,color:T.text,fontWeight:500,textAlign:"right",paddingRight:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{highlight(g.name,searchQ)}</div>
            <div style={{width:1,alignSelf:"stretch",background:T.border,marginLeft:8,flexShrink:0}}/>
            <input type="number" value={g.qty||""} onChange={e=>setGrocery(grocery.map(x=>x.id===g.id?{...x,qty:e.target.value}:x))} style={{width:COL_QTY+4,background:"transparent",border:"none",padding:"4px",color:T.textMid,fontSize:12,outline:"none",fontFamily:T.font,textAlign:"center",flexShrink:0}}/>
            <button onClick={()=>remove(g.id)} style={{background:"none",border:"none",color:T.border,cursor:"pointer",fontSize:17,lineHeight:1,width:22,textAlign:"center",flexShrink:0}}>×</button>
          </div>
        ))}
        {done.length>0&&(<>
          <div style={{padding: "8px 14px 4px",fontSize:10,color:T.textSub,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:T.bg}}>נרכשו</div>
          {done.map((g,i)=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",padding:"8px 14px",opacity:.4,borderBottom:i<done.length-1?`1px solid ${T.border}`:"none"}}>
              <button onClick={()=>toggle(g.id)} style={{width:20,height:20,borderRadius:6,border:`1.5px solid ${T.navy}`,background:T.navy,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:10}}>✓</span></button>
              <div style={{flex:1,fontSize:13,color:T.textSub,textDecoration:"line-through",textAlign:"right",paddingRight:10}}>{highlight(g.name,searchQ)}</div>
              <div style={{width:1,alignSelf:"stretch",background:T.border,marginLeft:8,flexShrink:0}}/>
              <span style={{width:COL_QTY+4,fontSize:12,color:T.textSub,textAlign:"center",flexShrink:0}}>{g.qty}</span>
              <div style={{width:22,flexShrink:0}}/>
            </div>
          ))}
        </>)}
        {active.length===0&&done.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:24,fontSize:13}}>{searchQ?"לא נמצאו פריטים":"הרשימה ריקה"}</div>}
      </Card>
    </div>
  );
}

function DividendPreview({amount, rateUsed, taxRate}){
  const a=+amount||0;
  const r=+rateUsed||1;
  const t=+taxRate||0;
  const gross=a*r;
  const tax=gross*t/100;
  return(
    <div style={{background:"#fff",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",display:"flex",flexDirection:"column",gap:4}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:11,color:T.textMid}}>ברוטו</span>
        <span style={{fontSize:12,fontWeight:600,color:T.success}}>₪{fmtNum(gross)}</span>
      </div>
      {t>0&&<div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:11,color:T.danger}}>מס ({t}%)</span>
        <span style={{fontSize:12,color:T.danger}}>-₪{fmtNum(tax)}</span>
      </div>}
      <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #bbf7d0",paddingTop:4,marginTop:2}}>
        <span style={{fontSize:12,fontWeight:700,color:T.textMid}}>נטו</span>
        <span style={{fontSize:13,fontWeight:700,color:T.success}}>₪{fmtNum(gross-tax)}</span>
      </div>
    </div>
  );
}

function TradeForm({mode,form,setForm,onSave,onCancel,currency}){
  const isBuy=mode==="buy";
  const curSym=CURRENCIES.find(c=>c.code===currency)?.symbol||currency;
  const r=currency!=="ILS"?(+form.rateUsed||3.68):1;
  const shares=+form.shares||0;
  const price=+form.price||0;
  const commission=+form.commission||0;
  const taxPct=+form.taxRate||0;
  const subtotal=shares*price;
  const totalForeign=subtotal-commission;
  const totalILS=totalForeign*r;
  const taxAmount=!isBuy&&totalForeign>0?Math.max(0,totalILS*(taxPct/100)):0;
  const netILS=totalILS-taxAmount;
  const effectivePrice=shares>0?subtotal/shares:0;

  return(
    <div style={{background:isBuy?T.navyLight:T.dangerBg,border:`1px solid ${isBuy?T.navyBorder:T.dangerBorder}`,borderRadius:12,padding:14,marginTop:8}}>
      <div style={{fontSize:12,fontWeight:700,color:isBuy?T.navy:T.danger,marginBottom:12}}>
        {isBuy?"קנייה נוספת":"מכירה"}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {/* שורה 1: כמות + שער */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 120px"}}>
            <div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>כמות יחידות</div>
            <Inp type="number" placeholder="0" value={form.shares} onChange={e=>setForm({...form,shares:e.target.value})}/>
          </div>
          <div style={{flex:"1 1 120px"}}>
            <div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>{isBuy?"שער קנייה":"שער מכירה"} ({curSym})</div>
            <Inp type="number" placeholder="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
          </div>
        </div>
        {/* שורה 2: עמלה + מס */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 120px"}}>
            <div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>עמלה ({curSym})</div>
            <Inp type="number" placeholder="0" value={form.commission} onChange={e=>setForm({...form,commission:e.target.value})}/>
          </div>
          {!isBuy&&(
            <div style={{flex:"1 1 120px"}}>
              <div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>מס רווח הון (%)</div>
              <Inp type="number" placeholder="25" value={form.taxRate??""} onChange={e=>setForm({...form,taxRate:e.target.value})}/>
            </div>
          )}
        </div>
        {/* שורה 3: שער המרה + תאריך */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {currency!=="ILS"&&(
            <div style={{flex:"1 1 120px"}}>
              <div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>שער המרה ל-₪</div>
              <Inp type="number" placeholder="3.68" value={form.rateUsed} onChange={e=>setForm({...form,rateUsed:e.target.value})}/>
            </div>
          )}
          <div style={{flex:"1 1 120px"}}>
            <div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>תאריך</div>
            <Inp type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
          </div>
        </div>
        {/* סיכום */}
        {shares>0&&price>0&&(
          <div style={{background:isBuy?"#fff":"#fff8f8",border:`1px solid ${isBuy?T.navyBorder:T.dangerBorder}`,borderRadius:10,padding:"10px 14px",display:"flex",flexDirection:"column",gap:4}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:T.textMid}}>מחיר ליחידה</span>
              <span style={{fontSize:12,fontWeight:600,color:T.text}}>{curSym}{fmtNum(effectivePrice)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:T.textMid}}>סה״כ {curSym}</span>
              <span style={{fontSize:12,fontWeight:600,color:T.text}}>{curSym}{fmtNum(totalForeign)}</span>
            </div>
            {currency!=="ILS"&&(
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:T.textMid}}>סה״כ ₪</span>
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>₪{fmtNum(totalILS)}</span>
              </div>
            )}
            {!isBuy&&taxAmount>0&&(
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:T.danger}}>מס ({taxPct}%)</span>
                <span style={{fontSize:12,color:T.danger}}>-₪{fmtNum(taxAmount)}</span>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${isBuy?T.navyBorder:T.dangerBorder}`,paddingTop:4,marginTop:2}}>
              <span style={{fontSize:12,fontWeight:700,color:T.textMid}}>{isBuy?"עלות סופית":"נטו"}</span>
              <span style={{fontSize:13,fontWeight:700,color:isBuy?T.navy:T.success}}>₪{fmtNum(isBuy?totalILS:netILS)}</span>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={onSave} style={{flex:1,padding:"10px",background:isBuy?T.navy:T.danger}}>שמירה</Btn>
          <Btn variant="secondary" onClick={onCancel} style={{flex:1,padding:"10px"}}>ביטול</Btn>
        </div>
      </div>
    </div>
  );
}

function InvestSection({ tab, setTab }) {
  const [assets, setAssets] = useStorage("inv-assets3", [
    {id:"a1",security:"Apple (AAPL)",currency:"USD",rateUsed:3.68,purchases:[{id:"p1",shares:10,price:155,commission:5,date:"2025-06-01"},{id:"p2",shares:5,price:170,commission:5,date:"2025-11-15"}],sales:[]},
    {id:"a2",security:"Vanguard S&P 500 (VOO)",currency:"USD",rateUsed:3.68,purchases:[{id:"p3",shares:5,price:410,commission:8,date:"2025-08-20"}],sales:[]},
    {id:"a3",security:"Bitcoin (BTC)",currency:"USD",rateUsed:3.68,purchases:[{id:"p4",shares:0.05,price:62000,commission:20,date:"2025-03-10"}],sales:[{id:"s1",shares:0.02,price:71000,commission:15,date:"2026-01-05"}]},
  ]);
  const [watchlist,setWatchlist]=useStorage("inv-watchlist",["AAPL","VOO","BTC","NVDA","TSLA"]);
  const [customTopics,setCustomTopics]=useStorage("inv-topics",["AI","ריביות","נאסד״ק"]);
  const [alertThresh,setAlertThresh]=useStorage("inv-alert-thresh",3);
  const [sentimentLog,setSentimentLog]=useStorage("inv-sentiment-log",[]);
  const [agentHistory,setAgentHistory]=useStorage("inv-agent-history",[]);
  const [dividends,setDividends]=useStorage("inv-dividends",[]);
  const [portfolioView,setPortfolioView]=useState("active");
  const [expandedId,setExpandedId]=useState(null);
  const [collapsed,setCollapsed]=useState({});
  const toggleSection=(aid,sec)=>setCollapsed(c=>({...c,[`${aid}_${sec}`]:!c[`${aid}_${sec}`]}));
  const isOpen=(aid,sec)=>collapsed[`${aid}_${sec}`]!==true;
  const [showAssetForm,setShowAssetForm]=useState(null); // null | "new" | assetId
  const [editAssetId,setEditAssetId]=useState(null);
  const [addPurchaseId,setAddPurchaseId]=useState(null);
  const [addSaleId,setAddSaleId]=useState(null);
  const [confirmAsset,  setConfirmAsset]  = useState(null);
  const [confirmPurch,  setConfirmPurch]  = useState(null);
  const [confirmSale,   setConfirmSale]   = useState(null);
  const [confirmDiv,    setConfirmDiv]    = useState(null);
  const [editPurch,     setEditPurch]     = useState(null); // {assetId, purchase}
  const [editSale,      setEditSale]      = useState(null); // {assetId, sale}
  const [editDiv,       setEditDiv]       = useState(null); // {assetId, dividend}
  const [addDividendId,setAddDividendId]=useState(null);
  // ── סעיף 7א: searchQ ──
  const [searchQ,setSearchQ]=useState("");
  const [prices,setPrices]=useState({});
  const [pricesLoading,setPricesLoading]=useState(false);
  const [pricesError,setPricesError]=useState("");
  const [lastUpdated,setLastUpdated]=useState(null);
  const [news,setNews]=useState([]);
  const [agentQuery,setAgentQuery]=useState("");
  const [agentLoading,setAgentLoading]=useState(false);
  const [newsItems,     setNewsItems]     = useState([]);
  const [newsLoading,   setNewsLoading]   = useState(false);
  const [newsError,     setNewsError]     = useState("");
  const [newsLastFetch, setNewsLastFetch] = useState(null);
  const NEWS_CACHE_MIN = 30; // דקות בין רענונים
  const blankAsset={security:"",shares:"",price:"",commission:"0",date:today(),currency:"USD",rateUsed:"3.68"};
  const blankPurchase={shares:"",price:"",commission:"0",date:today()};
  const blankSale     = { shares:"", price:"", commission:"0", date:today(), taxRate:"25", rateUsed:"0" };
  const blankDividend = { amount:"", currency:"USD", rateUsed:"3.68", date:today(), taxRate:"25" };
  const [assetForm,setAssetForm]=useState(blankAsset);
  const [purchaseForm,setPurchaseForm]=useState(blankPurchase);
  const [saleForm,setSaleForm]=useState(blankSale);
  const [dividendForm,setDividendForm]=useState(blankDividend);
  const [newWatch,setNewWatch]=useState("");
  const [newTopic,setNewTopic]=useState("");

  function extractTicker(security){const m=security.match(/\(([^)]+)\)/);return m?m[1].toUpperCase():security.split(" ")[0].toUpperCase();}
  const totalShares=a=>a.purchases.reduce((s,p)=>s+ +p.shares,0)-(a.sales||[]).reduce((s,p)=>s+ +p.shares,0);
  const avgBuyPrice=a=>{const tc=a.purchases.reduce((s,p)=>s+ +p.shares*(+p.price+(+p.commission||0)/+p.shares),0);const ts=a.purchases.reduce((s,p)=>s+ +p.shares,0);return ts>0?tc/ts:0;};
  const costBasisILS=a=>{const rate=a.currency!=="ILS"?+a.rateUsed:1;return a.purchases.reduce((s,p)=>s+(+p.shares*+p.price+(+p.commission||0))*rate,0);};
  const currentPriceFor=a=>prices[extractTicker(a.security)]||null;
  const currentValILS=a=>{const price=currentPriceFor(a);const rate=a.currency!=="ILS"?+a.rateUsed:1;const shrs=totalShares(a);return price?price*shrs*rate:avgBuyPrice(a)*shrs*rate;};
  const soldCostILS=a=>{const rate=a.currency!=="ILS"?+a.rateUsed:1;const avg=avgBuyPrice(a);return(a.sales||[]).reduce((s,p)=>s+ +p.shares*avg*rate,0);};
  const unrealizedPnLILS=a=>currentValILS(a)-(costBasisILS(a)-soldCostILS(a));
  const realizedPnLILS=a=>{
    const avg=avgBuyPrice(a);
    return(a.sales||[]).reduce((s,p)=>{
      const saleRate=p.rateUsed?+p.rateUsed:(a.currency!=="ILS"?+a.rateUsed:1);
      const rev=(+p.shares*+p.price-(+p.commission||0))*saleRate;
      const cost=+p.shares*avg*saleRate;
      const grossPnL=rev-cost;
      const taxRate=(+p.taxRate||0)/100;
      const tax=grossPnL>0?grossPnL*taxRate:0;
      return s+grossPnL-tax;
    },0);
  };
  const isSoldOut=a=>totalShares(a)<=0.000001;
  const assetDividends=assetId=>(dividends||[]).filter(d=>d.assetId===assetId);
  const totalDividendsILS=a=>assetDividends(a.id).reduce((s,d)=>{
    const gross=(+d.amount)*(+d.rateUsed||1);
    const tax=gross*(+d.taxRate||0)/100;
    return s+gross-tax;
  },0);
  const allDividendsTotal=assets.reduce((s,a)=>s+totalDividendsILS(a),0);
  const activeAssets=assets.filter(a=>!isSoldOut(a));
  const soldAssets=assets.filter(a=>isSoldOut(a));
  const totalPortfolio=activeAssets.reduce((s,a)=>s+currentValILS(a),0);
  const totalCost=activeAssets.reduce((s,a)=>s+(costBasisILS(a)-soldCostILS(a)),0);
  const totalPnL=totalPortfolio-totalCost;
  const totalRealized=assets.reduce((s,a)=>s+realizedPnLILS(a),0);

  const openAddAsset=()=>{setEditAssetId(null);setAssetForm(blankAsset);setShowAssetForm("new");setExpandedId(null);};
  const saveAsset=()=>{
    if(!assetForm.security||!assetForm.shares||!assetForm.price)return;
    const purchase={id:uid(),shares:+assetForm.shares,price:+assetForm.price,commission:+assetForm.commission||0,date:assetForm.date};
    if(editAssetId){setAssets(assets.map(a=>a.id===editAssetId?{...a,security:assetForm.security,currency:assetForm.currency,rateUsed:+assetForm.rateUsed}:a));}
    else{setAssets([...assets,{id:uid(),security:assetForm.security,currency:assetForm.currency,rateUsed:+assetForm.rateUsed,purchases:[purchase],sales:[]}]);}
    setShowAssetForm(false);setEditAssetId(null);setAssetForm(blankAsset);
  };
  const savePurchase=(assetId)=>{
    if(!purchaseForm.shares||!purchaseForm.price)return;
    const p={id:uid(),shares:+purchaseForm.shares,price:+purchaseForm.price,commission:+purchaseForm.commission||0,date:purchaseForm.date};
    setAssets(assets.map(a=>a.id===assetId?{...a,purchases:[...a.purchases,p]}:a));
    setAddPurchaseId(null);setPurchaseForm(blankPurchase);
  };
  const saveSale=(assetId)=>{
    if(!saleForm.shares||!saleForm.price)return;
    const asset=assets.find(a=>a.id===assetId);const avail=totalShares(asset);
    if(+saleForm.shares>avail)return;
    const s={id:uid(),shares:+saleForm.shares,price:+saleForm.price,commission:+saleForm.commission||0,date:saleForm.date};
    setAssets(assets.map(a=>a.id===assetId?{...a,sales:[...(a.sales||[]),s]}:a));
    setAddSaleId(null);setSaleForm(blankSale);
  };
  const updatePurchase=({assetId,purchase})=>{
    setAssets(assets.map(a=>a.id===assetId?{...a,purchases:a.purchases.map(p=>p.id===purchase.id?purchase:p)}:a));
    setEditPurch(null);
  };
  const updateSale=({assetId,sale})=>{
    setAssets(assets.map(a=>a.id===assetId?{...a,sales:(a.sales||[]).map(s=>s.id===sale.id?sale:s)}:a));
    setEditSale(null);
  };
  const updateDividend=(dividend)=>{
    setDividends(dividends.map(d=>d.id===dividend.id?dividend:d));
    setEditDiv(null);
  };
  const deletePurchase=({assetId,purchaseId})=>{setAssets(assets.map(a=>a.id===assetId?{...a,purchases:a.purchases.filter(p=>p.id!==purchaseId)}:a));setConfirmPurch(null);};
  const deleteSale=({assetId,saleId})=>{setAssets(assets.map(a=>a.id===assetId?{...a,sales:(a.sales||[]).filter(s=>s.id!==saleId)}:a));setConfirmSale(null);};
const saveDividend=(assetId)=>{
    if(!dividendForm.amount)return;
    const asset=assets.find(x=>x.id===assetId);
    const d={id:uid(),assetId,amount:+dividendForm.amount,currency:asset?.currency||"ILS",rateUsed:+dividendForm.rateUsed||+asset?.rateUsed||1,date:dividendForm.date,taxRate:+dividendForm.taxRate||25};
    setDividends([...dividends,d]);setAddDividendId(null);setDividendForm(blankDividend);
  };
  const deleteDividend=(id)=>{setDividends(dividends.filter(d=>d.id!==id));setConfirmDiv(null);};

  useEffect(()=>{
    if(tab==="news" && newsItems.length===0) fetchNews();
  },[tab]);

const fetchNews = async (force=false) => {
    if(!force && newsLastFetch) {
      const minSince = (Date.now() - newsLastFetch.getTime()) / 60000;
      if(minSince < NEWS_CACHE_MIN) return;
    }
    setNewsLoading(true);
    // טען מחירים אוטומטית עם החדשות
    fetchPrices().catch(()=>{});
    setNewsError("");
    try {
      const tickers = assets.map(a => extractTicker(a.security)).join(", ");
      const question = `תן לי סיכום חדשות פיננסיות עדכניות בעברית על: ${tickers}, ועל השוק הכללי (S&P 500, נאסד"ק).
פורמט JSON בלבד ללא טקסט נוסף:
{
  "items": [
    {"ticker": "AAPL", "label": "Apple", "summary": "...", "trend": "positive/negative/neutral"},
    {"ticker": "MARKET", "label": "שוק כללי", "summary": "...", "trend": "positive/negative/neutral"}
  ]
}
2-3 משפטים לכל נייר. מגמה חיובית/שלילית/ניטרלית.`;

      const resp = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 8192,
          useSearch: true,
          messages: [{ role: "user", content: question }]
        })
      });

      const data = await resp.json();
      const text = (data.content||[]).map(b=>b.text||"").join("").trim();

      // פרסור JSON
      let parsed = [];
      try {
        let clean = text.replace(/```json[\s\S]*?(?=\{)/,"").replace(/```\s*$/,"").trim();
      if(!clean.startsWith("{")) {
        const match2 = text.match(/\{[\s\S]*\}/);
        clean = match2?.[0] || "{}";
      }
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          const json = JSON.parse(match[0]);
          parsed = json.items || [];
        }
      } catch {}

      const results = parsed.map(item => ({
        ticker: item.ticker,
        label: item.label,
        type: item.ticker === "MARKET" ? "market" : "stock",
        summary: item.summary,
        trend: item.trend || "neutral",
        articles: [],
        updatedAt: new Date()
      }));

      setNewsItems(results);
      setNewsLastFetch(new Date());
    } catch {
      setNewsError("שגיאה בטעינת חדשות");
    }
    setNewsLoading(false);
  };

  useEffect(()=>{
    if(tab==="news" && newsItems.length===0) fetchNews();
  },[tab]);

  const fetchPrices=async()=>{
    const allTickers=[...new Set([
      ...assets.map(a=>extractTicker(a.security)),
      ...watchlist
    ])];
    if(!allTickers.length)return;
    setPricesLoading(true);
    setPricesError("");

    try{
      const cryptoIds={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",BNB:"binancecoin",ADA:"cardano",XRP:"ripple",DOGE:"dogecoin",DOT:"polkadot",MATIC:"matic-network",AVAX:"avalanche-2"};
      const cryptoTickers=allTickers.filter(t=>cryptoIds[t]);
      const stockTickers=allTickers.filter(t=>!cryptoIds[t]);
      const result={};

      if(cryptoTickers.length){
        const ids=cryptoTickers.map(t=>cryptoIds[t]).join(",");
        const r=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        if(r.ok){
          const d=await r.json();
          cryptoTickers.forEach(t=>{
            if(d[cryptoIds[t]]?.usd) result[t]=d[cryptoIds[t]].usd;
          });
        }
      }

      if(stockTickers.length){
        const r=await fetch("/api/prices",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({tickers:stockTickers})
        });
        if(r.ok){
          const data=await r.json();
          Object.assign(result,data);
        }
      }

      if(Object.keys(result).length){
        setPrices(result);
        setLastUpdated(new Date());
      } else {
        setPricesError("לא ניתן לקבל מחירים כרגע");
      }
    }catch(e){
      console.error("fetchPrices error:",e);
      setPricesError("שגיאת חיבור");
    }

    setPricesLoading(false);
  };
  const priceAlerts=assets.flatMap(a=>{const ticker=extractTicker(a.security);const current=prices[ticker];const avg=avgBuyPrice(a);if(!current||!avg)return[];const changePct=((current-avg)/avg)*100;if(Math.abs(changePct)>=alertThresh)return[{security:a.security,ticker,changePct,current,avg}];return[];});
  const runAgent = async () => {
    if (!agentQuery.trim()) return;
    const question = agentQuery.trim();
    setAgentQuery("");
    setAgentLoading(true);

    const totalPortfolioILS = assets.reduce((s,a) => s + currentValILS(a), 0);
    const portfolioLines = activeAssets.map(a => {
      const ticker = extractTicker(a.security);
      const price = prices[ticker];
      const avg = avgBuyPrice(a);
      const valILS = currentValILS(a);
      const pnl = unrealizedPnLILS(a);
      const pnlPct = avg && price ? (((price - avg) / avg) * 100).toFixed(1) : "?";
      const weight = totalPortfolioILS ? ((valILS / totalPortfolioILS) * 100).toFixed(1) : "?";
      return `${a.security}: ${totalShares(a).toFixed(4)} יח׳ | קנייה ${fmtForeign(avg,a.currency)} | נוכחי ${price ? fmtForeign(price,a.currency) : "לא ידוע"} | שווי ${fmt(valILS)} (${weight}%) | P&L ${pnl>=0?"+":""}${fmt(pnl)} (${pnlPct}%)`;
    }).join("\n");

    const newsContext = newsItems.length > 0
      ? newsItems.map(g => `${g.label}: ${g.summary||"אין סיכום"}`).join("\n")
      : "לא נמשכו חדשות";

    const isFirstMessage = agentHistory.length === 0;
    const systemPrompt = `אתה סוכן השקעות אישי בשם סינריו - סוכן השקעות. עונה בעברית בלבד.
    כללים: תשובות ספציפיות עם מספרים מהתיק. תמציתי (3-5 משפטים). אל תמליץ על קנייה/מכירה חד-משמעית — הצג שיקולים. אם אין מחירים — ציין.
    ${isFirstMessage ? 'בפתיחת שיחה — הצג את עצמך במשפט אחד קצר.' : 'אל תציג את עצמך שוב — המשך את השיחה ישירות.'}

תיק:
${portfolioLines || "ריק"}
סה"כ: ${fmt(totalPortfolioILS)} | P&L: ${fmt(totalPnL)} | ממומש: ${fmt(totalRealized)}

חדשות:
${newsContext}`;

    const conversationHistory = agentHistory.slice(-4).flatMap(h => [
      { role: "user",      content: h.q },
      { role: "assistant", content: h.a }
    ]);

    try {
      const resp = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 8192,
          system: systemPrompt,
          messages: [...conversationHistory, { role: "user", content: question }]
        })
      });
      const data = await resp.json();
      const text = (data.content||[]).map(b=>b.text||"").join("") || data.error || "שגיאה — נסה שוב";
      setAgentHistory(h => [...h, { id:uid(), q:question, a:text, date:new Date().toISOString() }]);
    } catch {
      setAgentHistory(h => [...h, { id:uid(), q:question, a:"שגיאה בחיבור. נסה שוב.", date:new Date().toISOString() }]);
    }
    setAgentLoading(false);
  };

  const fmtForeign=(n,cur)=>{const sym=CURRENCIES.find(c=>c.code===cur)?.symbol||cur;return`${sym}${Number(n).toLocaleString(undefined,{maximumFractionDigits:4})}`;};
  const sentColor=s=>({positive:T.success,negative:T.danger,neutral:T.textSub}[s]||T.textSub);
  const sentBg=s=>({positive:T.successBg,negative:T.dangerBg,neutral:T.bg}[s]||T.bg);
  const sentBdr=s=>({positive:"#bbf7d0",negative:T.dangerBorder,neutral:T.border}[s]||T.border);


  return(
    <div style={{display:"flex",flexDirection:"column",gap:0,animation:"fadeUp .25s ease"}}>
      {confirmAsset&&<ConfirmModal message="למחוק נייר ערך זה לצמיתות?" onConfirm={()=>{setAssets(assets.filter(a=>a.id!==confirmAsset));setConfirmAsset(null);}} onCancel={()=>setConfirmAsset(null)}/>}
      {confirmPurch&&<ConfirmModal message="למחוק קנייה זו?" onConfirm={()=>deletePurchase(confirmPurch)} onCancel={()=>setConfirmPurch(null)}/>}
      {confirmSale&&<ConfirmModal message="למחוק מכירה זו?" onConfirm={()=>deleteSale(confirmSale)} onCancel={()=>setConfirmSale(null)}/>}
      {confirmDiv&&<ConfirmModal message="למחוק דיבידנד זה?" onConfirm={()=>deleteDividend(confirmDiv)} onCancel={()=>setConfirmDiv(null)}/>}

      {tab==="portfolio"&&(
        <Card style={{background:`linear-gradient(135deg,${T.navy} 0%,#2d5282 100%)`,border:"none",borderRadius:18,marginBottom:12}}>
          <div style={{color:"rgba(255,255,255,.55)",fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>שווי תיק</div>
          <div style={{fontSize:40,fontWeight:300,fontFamily:T.display,color:"#fff",letterSpacing:-2,marginBottom:4}}>{fmt(totalPortfolio)}</div>
          <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
            {[["רווח ממומש",totalRealized,totalRealized>=0],["רווח דיבידנדים",allDividendsTotal,allDividendsTotal>=0],["רווח/הפסד שוטף",totalPnL,totalPnL>=0]].map(([label,val,pos])=>(
              <div key={label} style={{flex:1,minWidth:100,background:"rgba(255,255,255,.1)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(255,255,255,.13)"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:600,marginBottom:3}}>{label}</div>
                <div style={{fontSize:16,fontWeight:700,color:pos?"#86efac":"#fca5a5",fontFamily:T.display}}>{val>=0?"+":""}{fmt(val)}</div>
              </div>
            ))}
          </div>
          {priceAlerts.length>0&&(
            <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.15)",paddingTop:10}}>
              {priceAlerts.map(a=>(
                <div key={a.ticker} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><Icon name="trending" size={11} color="rgba(255,255,255,.7)"/><span style={{fontSize:11,color:"rgba(255,255,255,.7)",fontWeight:600}}>{a.security}</span></div>
                  <span style={{fontSize:12,fontWeight:700,color:a.changePct>=0?"#86efac":"#fca5a5"}}>{a.changePct>=0?"+":""}{a.changePct.toFixed(1)}% לעומת שער קנייה</span>
                </div>
              ))}
            </div>
          )}
          {lastUpdated&&<div style={{marginTop:8,fontSize:10,color:"rgba(255,255,255,.35)"}}>עודכן: {lastUpdated.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"})}</div>}
        </Card>
      )}

      {tab==="portfolio"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* ── סעיף 7ה: איפוס searchQ בטוגל ── */}
          <div style={{flex:1,display:"flex",background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:3,gap:3}}>
            {[["active",`פעיל (${activeAssets.length})`],["sold",`נמכר (${soldAssets.length})`]].map(([v,l])=>(
              <button key={v} onClick={()=>{setPortfolioView(v);setSearchQ("");}} style={{flex:1,padding:"9px",borderRadius:9,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",border:"none",background:portfolioView===v?T.surface:"transparent",color:portfolioView===v?T.navy:T.textSub,boxShadow:portfolioView===v?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .15s"}}>{l}</button>
            ))}
          </div>
          {/* ── סעיף 7ג: SearchBar ── */}
          <SearchBar value={searchQ} onChange={setSearchQ} placeholder="חיפוש נייר ערך, טיקר…" />
          <div style={{display:"flex",gap:8,justifyContent:"end",flexShrink:0}}>
            {portfolioView==="active"&&(<>
              <button onClick={fetchPrices} disabled={pricesLoading} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",borderRadius:10,border:`1px solid ${T.navyBorder}`,background:T.navyLight,color:T.navy,fontSize:12,fontFamily:T.font,fontWeight:600,cursor:pricesLoading?"wait":"pointer"}}>
                {pricesLoading?<div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${T.navy}`,borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>:<Icon name="trending" size={13} color={T.navy}/>}
                {pricesLoading?"טוען…":"מחירים"}
              </button>
              <Btn onClick={openAddAsset} style={{padding:"8px 14px",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn>
            </>)}
          </div>
          {pricesError&&<div style={{background:T.dangerBg,border:`1px solid ${T.dangerBorder}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.danger}}>{pricesError}</div>}
          {showAssetForm==="new"&&(()=>{
            const rate=assetForm.currency!=="ILS"?+assetForm.rateUsed||1:1;
            const totalFx=(+assetForm.shares||0)*(+assetForm.price||0)+(+assetForm.commission||0);
            const totalILS=totalFx*rate;const effPrice=+assetForm.shares>0?totalFx/+assetForm.shares:0;
            return(
              <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
                <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>{editAssetId?"עריכת נייר ערך":"נייר ערך חדש"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>נייר ערך</div><Inp placeholder='למשל: Apple (AAPL) / ביטקוין (BTC)' value={assetForm.security} onChange={e=>setAssetForm({...assetForm,security:e.target.value})}/></div>
                  {!editAssetId&&(<>
                    <div style={{display:"flex",gap:8}}>
                      <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>כמות יחידות</div><Inp type="number" placeholder="כמות" value={assetForm.shares} onChange={e=>setAssetForm({...assetForm,shares:e.target.value})}/></div>
                      <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>שער קנייה</div><Inp type="number" placeholder="מחיר" value={assetForm.price} onChange={e=>setAssetForm({...assetForm,price:e.target.value})}/></div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>עמלת קנייה</div><Inp type="number" placeholder="0" value={assetForm.commission} onChange={e=>setAssetForm({...assetForm,commission:e.target.value})}/></div>
                      <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>תאריך קנייה</div><Inp type="date" value={assetForm.date} onChange={e=>setAssetForm({...assetForm,date:e.target.value})}/></div>
                    </div>
                  </>)}
                  <CurrencyField currency={assetForm.currency} setCurrency={c=>setAssetForm({...assetForm,currency:c})} rate={assetForm.rateUsed} setRate={r=>setAssetForm({...assetForm,rateUsed:r})} amount={assetForm.price}/>
                  {!editAssetId&&(+assetForm.shares>0&&+assetForm.price>0)&&(
                    <div style={{background:"#fff",border:`1px solid ${T.navyBorder}`,borderRadius:10,padding:"10px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.textMid}}>מחיר אפקטיבי ליחידה</span><span style={{fontSize:12,fontWeight:600}}>{fmtForeign(effPrice,assetForm.currency)}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.textMid}}>סך ב-{assetForm.currency}</span><span style={{fontSize:12,fontWeight:600}}>{fmtForeign(totalFx,assetForm.currency)}</span></div>
                      <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${T.border}`,paddingTop:4,marginTop:4}}><span style={{fontSize:11,color:T.textMid,fontWeight:700}}>מחיר סופי בש״ח</span><span style={{fontSize:14,fontWeight:700,color:T.navy}}>{fmt(totalILS)}</span></div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8}}><Btn onClick={saveAsset} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowAssetForm(null);setEditAssetId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
                </div>
              </Card>
            );
          })()}
          {activeAssets.length>1&&portfolioView==="active"&&!searchQ&&(
            <Card style={{padding:16}}>
              <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>חלוקת תיק</div>
                  {activeAssets.map((a,i)=>{
                    const pct=((currentValILS(a)/totalPortfolio)*100).toFixed(1);
                    const colors=[T.navy,"#2563ab","#7c3aed","#be185d","#1a6b3c","#6b5c3e"];
                    const color=colors[i%6];
                    return(
                      <div key={a.id} style={{marginBottom:11}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                            <CatDot color={color} size={8}/>
                            <span style={{fontSize:12,color:T.textMid,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.security}</span>
                          </div>
                          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                            <span style={{fontSize:12,color:T.textSub}}>{fmt(currentValILS(a))}</span>
                            <span style={{fontSize:12,color:color,fontWeight:700}}>{pct}%</span>
                          </div>
                        </div>
                        <PBar value={currentValILS(a)} max={totalPortfolio} color={color} h={4}/>
                      </div>
                    );
                  })}
              </div>
                <Donut slices={activeAssets.map((a,i)=>({val:currentValILS(a),color:[T.navy,"#2563ab","#7c3aed","#be185d","#1a6b3c","#6b5c3e"][i%6]}))} size={Math.min(120,window.innerWidth-240)}/>
              </div>
            </Card>
          )}
          {/* ── סעיף 7ב: סינון לפי searchQ ── */}
          {(portfolioView==="active"?activeAssets:soldAssets)
            .filter(a=>!searchQ||a.security.toLowerCase().includes(searchQ.toLowerCase()))
            .map(a=>{
            const ticker=extractTicker(a.security);const pnl=portfolioView==="active"?unrealizedPnLILS(a):realizedPnLILS(a);
            const pnlPct=(costBasisILS(a)-soldCostILS(a))>0?(unrealizedPnLILS(a)/(costBasisILS(a)-soldCostILS(a)))*100:0;
            const pos=pnl>=0;const price=prices[ticker];const avg=avgBuyPrice(a);const shrs=totalShares(a);const rate=a.currency!=="ILS"?+a.rateUsed:1;
            const isExpanded=expandedId===a.id;
            const cardEl=(
              <Card key={a.id} style={{padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,cursor:"pointer"}} onClick={()=>setExpandedId(isExpanded?null:a.id)}>
                  <div style={{flex:1}}>
                    {/* ── סעיף 7ד: highlight ── */}
                    <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:3}}>{highlight(a.security,searchQ)}</div>
                    <div style={{fontSize:11,color:T.textSub}}>{shrs>0?`${shrs.toFixed(shrs<1?6:4)} יחידות`:"נמכר"}{" · "}שער ממוצע {fmtForeign(avg,a.currency)}{" · "}{fmt(avg*rate)}/יח׳</div>
                    {price?(
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                        <span style={{fontSize:12,fontWeight:700,color:T.navy,background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"2px 10px"}}>{fmtForeign(price,a.currency)}</span>
                        <span style={{fontSize:11,color:T.textSub}}>{fmt(price*rate)}/יח׳</span>
                        {avg>0&&<span style={{fontSize:11,fontWeight:700,color:price>=avg?T.success:T.danger,background:price>=avg?T.successBg:T.dangerBg,border:`1px solid ${price>=avg?"#bbf7d0":T.dangerBorder}`,borderRadius:99,padding:"2px 8px"}}>{price>=avg?"+":""}{(((price-avg)/avg)*100).toFixed(1)}%</span>}
                      </div>
                    ):<div style={{fontSize:11,color:T.textSub,marginTop:2,fontStyle:"italic"}}>לחץ "מחירים" לעדכון</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
                    {portfolioView==="active"&&<div style={{fontSize:20,fontWeight:600,fontFamily:T.display,color:T.text}}>{fmt(currentValILS(a))}</div>}
                    <div style={{fontSize:12,fontWeight:700,color:pos?T.success:T.danger,background:pos?T.successBg:T.dangerBg,borderRadius:99,padding:"3px 10px",border:`1px solid ${pos?"#bbf7d0":T.dangerBorder}`}}>{pos?"+":""}{fmt(pnl)} {portfolioView==="active"&&`(${pos?"+":""}${pnlPct.toFixed(1)}%)`}</div>
                    <div style={{fontSize:9,color:T.textSub}}>{isExpanded?"▲ סגור":"▼ יומן מסחר"}</div>
                  </div>
                </div>
                {isExpanded&&(
                  <div style={{marginTop:14,borderTop:`1px solid ${T.border}`,paddingTop:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:T.navy,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",gap:6}} onClick={()=>toggleSection(a.id,"p")}>
                        <Icon name={isOpen(a.id,"p")?"trending":"plus"} size={13} color={T.textMid}/>
                        קניות ({a.purchases.length})
                      </span>
                      <button onClick={()=>{setAddPurchaseId(a.id);setAddSaleId(null);setPurchaseForm({...blankPurchase,rateUsed:String(a.rateUsed)});}} style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,color:T.navy,fontFamily:T.font,fontWeight:600}}>+ קנייה נוספת</button>
                    </div>
                    {isOpen(a.id,"p")&&a.purchases.map(p=>{const totalFx=+p.shares*+p.price+(+p.commission||0);const totalIls=totalFx*rate;return(
                      <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px dashed ${T.border}`}}>
                        <div><div style={{fontSize:12,fontWeight:600,color:T.text}}>{p.shares} יחידות × {fmtForeign(p.price,a.currency)}</div><div style={{fontSize:10,color:T.textSub}}>{new Date(p.date).toLocaleDateString("he-IL")}{p.commission>0&&` · עמלה ${fmtForeign(p.commission,a.currency)}`}</div></div>
                            <div style={{display:"flex",gap:4}}>
                              <button onClick={()=>setEditPurch({assetId:a.id,purchase:{...p}})} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 7px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="pencil" size={11} color={T.textMid}/></button>
                              <button onClick={()=>setConfirmPurch({assetId:a.id,purchaseId:p.id})} style={{background:"none",border:`1px solid ${T.dangerBorder}`,borderRadius:7,padding:"4px 7px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="trash" size={11} color={T.danger}/></button>
                            </div>
                      </div>
                    );})}
                    {editPurch?.assetId===a.id&&(
                      <div style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:12,padding:14,marginTop:8}}>
                        <div style={{fontSize:12,fontWeight:700,color:T.navy,marginBottom:10}}>✏️ עריכת קנייה</div>
                        <div style={{display:"flex",flexDirection:"column",gap:8}}>
                          <div style={{display:"flex",gap:8}}>
                            <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>כמות</div><Inp type="number" value={editPurch.purchase.shares} onChange={e=>setEditPurch(ep=>({...ep,purchase:{...ep.purchase,shares:e.target.value}}))}/></div>
                            <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>שער קנייה</div><Inp type="number" value={editPurch.purchase.price} onChange={e=>setEditPurch(ep=>({...ep,purchase:{...ep.purchase,price:e.target.value}}))}/></div>
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>עמלה</div><Inp type="number" value={editPurch.purchase.commission||0} onChange={e=>setEditPurch(ep=>({...ep,purchase:{...ep.purchase,commission:e.target.value}}))}/></div>
                            <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>תאריך</div><Inp type="date" value={editPurch.purchase.date} onChange={e=>setEditPurch(ep=>({...ep,purchase:{...ep.purchase,date:e.target.value}}))}/></div>
                          </div>
{(()=>{
                            const curSym=CURRENCIES.find(c=>c.code===a.currency)?.symbol||a.currency;
                            const r=a.currency!=="ILS"?+(editPurch.purchase.rateUsed||a.rateUsed):1;
                            const sub=(+editPurch.purchase.shares||0)*(+editPurch.purchase.price||0);
                            const comm=+editPurch.purchase.commission||0;
                            const total=(sub-comm)*r;
                            return +editPurch.purchase.shares>0&&+editPurch.purchase.price>0?(
                              <div style={{background:"#fff",border:`1px solid ${T.navyBorder}`,borderRadius:10,padding:"10px 14px",display:"flex",flexDirection:"column",gap:4}}>
                                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.textMid}}>מחיר ליחידה</span><span style={{fontSize:12,fontWeight:600}}>{curSym}{fmtNum(sub/(+editPurch.purchase.shares||1))}</span></div>
                                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.textMid}}>סה״כ {curSym}</span><span style={{fontSize:12,fontWeight:600}}>{curSym}{fmtNum(sub-comm)}</span></div>
                                <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${T.navyBorder}`,paddingTop:4,marginTop:2}}><span style={{fontSize:12,fontWeight:700,color:T.textMid}}>עלות סופית</span><span style={{fontSize:13,fontWeight:700,color:T.navy}}>₪{fmtNum(total)}</span></div>
                              </div>
                            ):null;
                          })()}
                          <div style={{display:"flex",gap:8}}>
                            <Btn onClick={()=>updatePurchase({assetId:a.id,purchase:{...editPurch.purchase,shares:+editPurch.purchase.shares,price:+editPurch.purchase.price,commission:+editPurch.purchase.commission||0}})} style={{flex:1,padding:"9px"}}>שמירה</Btn>
                            <Btn variant="secondary" onClick={()=>setEditPurch(null)} style={{flex:1,padding:"9px"}}>ביטול</Btn>
                          </div>
                        </div>
                      </div>
                    )}
                    {addPurchaseId===a.id&&<TradeForm mode="buy" form={purchaseForm} setForm={setPurchaseForm} onSave={()=>savePurchase(a.id)} onCancel={()=>setAddPurchaseId(null)} currency={a.currency}/>}
                    {((a.sales||[]).length>0||portfolioView==="active")&&(
                      <div style={{marginTop:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:T.danger,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",gap:6}} onClick={()=>toggleSection(a.id,"s")}>
                            <Icon name={isOpen(a.id,"s")?"download":"minus"} size={13} color={T.textMid}/>
                            מכירות ({(a.sales||[]).length})
                          </span>
                          {portfolioView==="active"&&shrs>0&&<button onClick={()=>{setAddSaleId(a.id);setAddPurchaseId(null);setSaleForm({...blankSale,rateUsed:String(a.rateUsed)});}} style={{background:T.dangerBg,border:`1px solid ${T.dangerBorder}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,color:T.danger,fontFamily:T.font,fontWeight:600}}>+ מכירה</button>}
                        </div>
                        {isOpen(a.id,"s")&&(a.sales||[]).map(s=>{const avgCost=avgBuyPrice(a);const revenue=+s.shares*+s.price-(+s.commission||0);const costOfSale=+s.shares*avgCost;const salePnl=(revenue-costOfSale)*rate;const pnlPos=salePnl>=0;return(
                          <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px dashed ${T.border}`}}>
                            <div><div style={{fontSize:12,fontWeight:600,color:T.text}}>{s.shares} יחידות × {fmtForeign(s.price,a.currency)}</div><div style={{fontSize:10,color:T.textSub}}>{new Date(s.date).toLocaleDateString("he-IL")}{s.commission>0&&` · עמלה ${fmtForeign(s.commission,a.currency)}`}</div></div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{textAlign:"left"}}><div style={{fontSize:11,fontWeight:700,color:pnlPos?T.success:T.danger}}>{pnlPos?"+":""}{fmt(salePnl)}</div><div style={{fontSize:10,color:T.textSub}}>רווח/הפסד</div></div>
                            <div style={{display:"flex",gap:4}}>
                                  <button onClick={()=>setEditSale({assetId:a.id,sale:{...s}})} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 7px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="pencil" size={11} color={T.textMid}/></button>
                                  <button onClick={()=>setConfirmSale({assetId:a.id,saleId:s.id})} style={{background:"none",border:`1px solid ${T.dangerBorder}`,borderRadius:7,padding:"4px 7px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="trash" size={11} color={T.danger}/></button>
                                </div>
                             </div>
                          </div>
                        );})}
                        {isOpen(a.id,"s")&&(a.sales||[]).length===0&&<div style={{fontSize:11,color:T.textSub,fontStyle:"italic"}}>אין מכירות עדיין</div>}
                        {editSale?.assetId===a.id&&(
                          <div style={{background:T.dangerBg,border:`1px solid ${T.dangerBorder}`,borderRadius:12,padding:14,marginTop:8}}>
                            <div style={{fontSize:12,fontWeight:700,color:T.danger,marginBottom:10}}>✏️ עריכת מכירה</div>
                            <div style={{display:"flex",flexDirection:"column",gap:8}}>
                              <div style={{display:"flex",gap:8}}>
                                <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>כמות</div><Inp type="number" value={editSale.sale.shares} onChange={e=>setEditSale(es=>({...es,sale:{...es.sale,shares:e.target.value}}))}/></div>
                                <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>שער מכירה</div><Inp type="number" value={editSale.sale.price} onChange={e=>setEditSale(es=>({...es,sale:{...es.sale,price:e.target.value}}))}/></div>
                              </div>
                              <div style={{display:"flex",gap:8}}>
                                <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>עמלה</div><Inp type="number" value={editSale.sale.commission||0} onChange={e=>setEditSale(es=>({...es,sale:{...es.sale,commission:e.target.value}}))}/></div>
                                <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>מס (%)</div><Inp type="number" value={editSale.sale.taxRate||25} onChange={e=>setEditSale(es=>({...es,sale:{...es.sale,taxRate:e.target.value}}))}/></div>
                              </div>
                              <div style={{display:"flex",gap:8}}>
                                <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>תאריך</div><Inp type="date" value={editSale.sale.date} onChange={e=>setEditSale(es=>({...es,sale:{...es.sale,date:e.target.value}}))}/></div>
                                {a.currency!=="ILS"&&<div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>שער המרה</div><Inp type="number" value={editSale.sale.rateUsed||a.rateUsed} onChange={e=>setEditSale(es=>({...es,sale:{...es.sale,rateUsed:e.target.value}}))}/></div>}
                              </div>
{(()=>{
                                const curSym=CURRENCIES.find(c=>c.code===a.currency)?.symbol||a.currency;
                                const r=a.currency!=="ILS"?+(editSale.sale.rateUsed||a.rateUsed):1;
                                const sub=(+editSale.sale.shares||0)*(+editSale.sale.price||0);
                                const comm=+editSale.sale.commission||0;
                                const taxPct=+editSale.sale.taxRate||0;
                                const totalILS=(sub-comm)*r;
                                const tax=Math.max(0,totalILS*taxPct/100);
                                return +editSale.sale.shares>0&&+editSale.sale.price>0?(
                                  <div style={{background:"#fff8f8",border:`1px solid ${T.dangerBorder}`,borderRadius:10,padding:"10px 14px",display:"flex",flexDirection:"column",gap:4}}>
                                    <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.textMid}}>סה״כ {curSym}</span><span style={{fontSize:12,fontWeight:600}}>{curSym}{fmtNum(sub-comm)}</span></div>
                                    {a.currency!=="ILS"&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.textMid}}>סה״כ ₪</span><span style={{fontSize:12,fontWeight:600}}>₪{fmtNum(totalILS)}</span></div>}
                                    {tax>0&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.danger}}>מס ({taxPct}%)</span><span style={{fontSize:12,color:T.danger}}>-₪{fmtNum(tax)}</span></div>}
                                    <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${T.dangerBorder}`,paddingTop:4,marginTop:2}}><span style={{fontSize:12,fontWeight:700,color:T.textMid}}>נטו</span><span style={{fontSize:13,fontWeight:700,color:T.success}}>₪{fmtNum(totalILS-tax)}</span></div>
                                  </div>
                                ):null;
                              })()}
                              <div style={{display:"flex",gap:8}}>
                                <Btn onClick={()=>updateSale({assetId:a.id,sale:{...editSale.sale,shares:+editSale.sale.shares,price:+editSale.sale.price,commission:+editSale.sale.commission||0,taxRate:+editSale.sale.taxRate||25,rateUsed:+editSale.sale.rateUsed||+a.rateUsed}})} style={{flex:1,padding:"9px",background:T.danger}}>שמירה</Btn>
                                <Btn variant="secondary" onClick={()=>setEditSale(null)} style={{flex:1,padding:"9px"}}>ביטול</Btn>
                              </div>
                            </div>
                          </div>
                        )}
                        {addSaleId===a.id&&<TradeForm mode="sell" form={saleForm} setForm={setSaleForm} onSave={()=>saveSale(a.id)} onCancel={()=>setAddSaleId(null)} currency={a.currency}/>}
                      </div>
                    )}
                    <div style={{marginTop:12}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#1a6b3c",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",gap:6}} onClick={()=>toggleSection(a.id,"d")}>
                          <Icon name={isOpen(a.id,"d")?"wallet":"currency"} size={13} color={T.textMid}/>
                          דיבידנדים ({assetDividends(a.id).length}) · סה״כ {fmt(totalDividendsILS(a))}
                        </span>
                        <button onClick={()=>{setAddDividendId(addDividendId===a.id?null:a.id);setDividendForm(blankDividend);}} style={{background:T.successBg,border:"1px solid #bbf7d0",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,color:T.success,fontFamily:T.font,fontWeight:600}}>+ דיבידנד</button>
                      </div>
                      {addDividendId===a.id&&(
                        <div style={{background:T.successBg,border:"1px solid #bbf7d0",borderRadius:12,padding:14,marginBottom:8}}>
                          <div style={{fontSize:12,fontWeight:700,color:T.success,marginBottom:10}}>➕ הוספת דיבידנד</div>
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            <div style={{display:"flex",gap:8}}>
                              <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>סכום ({a.currency})</div><Inp type="number" placeholder="0.00" value={dividendForm.amount} onChange={e=>setDividendForm({...dividendForm,amount:e.target.value})}/></div>
                              <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>מס רווח הון (%)</div><Inp type="number" placeholder="25" value={dividendForm.taxRate} onChange={e=>setDividendForm({...dividendForm,taxRate:e.target.value})}/></div>
                            </div>
                            <div style={{display:"flex",gap:8}}>
                              <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>שער המרה לש״ח</div><Inp type="number" placeholder="3.68" value={dividendForm.rateUsed} onChange={e=>setDividendForm({...dividendForm,rateUsed:e.target.value})}/></div>
                              <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>תאריך</div><Inp type="date" value={dividendForm.date} onChange={e=>setDividendForm({...dividendForm,date:e.target.value})}/></div>
                            </div>
                            {+dividendForm.amount>0&&<DividendPreview
                              amount={+dividendForm.amount}
                              rateUsed={+dividendForm.rateUsed||+a.rateUsed||1}
                              taxRate={+dividendForm.taxRate||25}
                            />}
                            <div style={{display:"flex",gap:8}}><Btn onClick={()=>saveDividend(a.id)} style={{flex:1,padding:"9px",background:T.success}}>שמירה</Btn><Btn variant="secondary" onClick={()=>setAddDividendId(null)} style={{flex:1,padding:"9px"}}>ביטול</Btn></div>
                          </div>
                        </div>
                      )}
                      {editDiv?.assetId===a.id&&(
                        <div style={{background:T.successBg,border:"1px solid #bbf7d0",borderRadius:12,padding:14,marginBottom:8}}>
                          <div style={{fontSize:12,fontWeight:700,color:T.success,marginBottom:10}}>✏️ עריכת דיבידנד</div>
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            <div style={{display:"flex",gap:8}}>
                              <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>סכום ({a.currency})</div><Inp type="number" value={editDiv.dividend.amount} onChange={e=>setEditDiv(ed=>({...ed,dividend:{...ed.dividend,amount:e.target.value}}))}/></div>
                              <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>תאריך</div><Inp type="date" value={editDiv.dividend.date} onChange={e=>setEditDiv(ed=>({...ed,dividend:{...ed.dividend,date:e.target.value}}))}/></div>
                            </div>
                            <div style={{display:"flex",gap:8}}>
                              {a.currency!=="ILS"&&<div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>שער המרה</div><Inp type="number" value={editDiv.dividend.rateUsed} onChange={e=>setEditDiv(ed=>({...ed,dividend:{...ed.dividend,rateUsed:e.target.value}}))}/></div>}
                              <div style={{flex:1}}><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>מס (%)</div><Inp type="number" value={editDiv.dividend.taxRate||25} onChange={e=>setEditDiv(ed=>({...ed,dividend:{...ed.dividend,taxRate:e.target.value}}))}/></div>
                            </div>
                            <div><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>הערה</div><Inp value={editDiv.dividend.notes||""} onChange={e=>setEditDiv(ed=>({...ed,dividend:{...ed.dividend,notes:e.target.value}}))}/></div>
                            <div style={{display:"flex",gap:8}}>
                              <Btn onClick={()=>updateDividend({...editDiv.dividend,amount:+editDiv.dividend.amount,rateUsed:+editDiv.dividend.rateUsed||1,taxRate:+editDiv.dividend.taxRate||25})} style={{flex:1,padding:"9px",background:T.success}}>שמירה</Btn>
                              <Btn variant="secondary" onClick={()=>setEditDiv(null)} style={{flex:1,padding:"9px"}}>ביטול</Btn>
                            </div>
                          </div>
                        </div>
                      )}
                      {isOpen(a.id,"d")&&assetDividends(a.id).length>0&&(
                        <div style={{borderRadius:10,overflow:"hidden",border:"1px solid #bbf7d0"}}>
                          {assetDividends(a.id).sort((x,y)=>new Date(y.date)-new Date(x.date)).map((d,di)=>(
                            <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderBottom:di<assetDividends(a.id).length-1?"1px solid #dcfce7":"none",background:di%2===0?"#f0faf4":"#fff"}}>
                              <div><div style={{fontSize:12,fontWeight:600,color:T.text}}>{new Date(d.date).toLocaleDateString("he-IL")}</div>{d.notes&&<div style={{fontSize:10,color:T.textSub}}>{d.notes}</div>}</div>
                              <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{textAlign:"left"}}><div style={{fontSize:12,fontWeight:700,color:T.success}}>+{fmt((+d.amount)*(+d.rateUsed||1))}</div>{a.currency!=="ILS"&&<div style={{fontSize:10,color:T.textSub}}>{d.amount} {a.currency}</div>}</div>
                              <div style={{display:"flex",gap:4}}>
                                <button onClick={()=>setEditDiv({assetId:a.id,dividend:{...d}})} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 7px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="pencil" size={11} color={T.textMid}/></button>
                                <button onClick={()=>setConfirmDiv(d.id)} style={{background:"none",border:`1px solid ${T.dangerBorder}`,borderRadius:7,padding:"4px 7px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="trash" size={11} color={T.danger}/></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {isOpen(a.id,"d")&&assetDividends(a.id).length===0&&addDividendId!==a.id&&<div style={{fontSize:11,color:T.textSub,fontStyle:"italic"}}>אין דיבידנדים מתועדים</div>}
                    </div>
                    <div style={{marginTop:12,display:"flex",gap:8}}>
                      <button onClick={()=>{setEditAssetId(a.id);setAssetForm({security:a.security,shares:"",price:"",commission:"0",date:today(),currency:a.currency,rateUsed:String(a.rateUsed)});setShowAssetForm(a.id);setExpandedId(null);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:"none",cursor:"pointer",fontSize:12,color:T.textMid,fontFamily:T.font,fontWeight:600}}><Icon name="pencil" size={12} color={T.textMid}/>עריכה</button>
                      <button onClick={()=>setConfirmAsset(a.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:9,border:`1px solid ${T.dangerBorder}`,background:T.dangerBg,cursor:"pointer",fontSize:12,color:T.danger,fontFamily:T.font,fontWeight:600}}><Icon name="trash" size={12} color={T.danger}/>מחיקה</button>
                    </div>
                  </div>
                )}
              </Card>
);
          const isEditOpen = showAssetForm===a.id;
          return [
            cardEl,
            isEditOpen&&(
              <Card key={`edit-${a.id}`} style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight,marginTop:-8}}>
                <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>עריכת נייר ערך</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div><div style={{fontSize:10,color:T.textMid,fontWeight:600,marginBottom:3}}>שם נייר ערך</div><Inp value={assetForm.security} onChange={e=>setAssetForm({...assetForm,security:e.target.value})}/></div>
                  <CurrencyField currency={assetForm.currency} setCurrency={c=>setAssetForm({...assetForm,currency:c})} rate={assetForm.rateUsed} setRate={r=>setAssetForm({...assetForm,rateUsed:r})} amount={assetForm.price}/>
                  <div style={{display:"flex",gap:8}}><Btn onClick={saveAsset} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowAssetForm(null);setEditAssetId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
                </div>
              </Card>
            )
          ];
          })}
          {(portfolioView==="active"?activeAssets:soldAssets).filter(a=>!searchQ||a.security.toLowerCase().includes(searchQ.toLowerCase())).length===0&&(
            <div style={{textAlign:"center",color:T.textSub,padding:40,fontSize:13}}>{searchQ?"לא נמצאו ניירות ערך":(portfolioView==="active"?"אין ניירות ערך פעילים":"אין מכירות מתועדות")}</div>
          )}
        </div>
      )}

{tab==="news"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:22,fontWeight:300,fontFamily:T.display,color:T.text}}>חדשות שוק</div>
              {newsLastFetch&&<div style={{fontSize:11,color:T.textSub,marginTop:2}}>
                עודכן: {newsLastFetch.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"})}
              </div>}
            </div>
            <button onClick={()=>fetchNews(true)} disabled={newsLoading}
              style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:10,
                border:`1px solid ${T.navyBorder}`,background:T.navy,color:"#fff",
                fontSize:12,fontFamily:T.font,fontWeight:600,cursor:newsLoading?"wait":"pointer"}}>
              {newsLoading
                ?<div style={{width:13,height:13,borderRadius:"50%",border:"2px solid #fff",
                    borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
                :<Icon name="insights" size={13} color="#fff"/>}
              {newsLoading?"מנתח…":"רענן חדשות"}
            </button>
          </div>

          {newsError&&<div style={{background:T.dangerBg,border:`1px solid ${T.dangerBorder}`,
            borderRadius:10,padding:"10px 14px",fontSize:12,color:T.danger}}>{newsError}</div>}

          {/* מצב ריק */}
          {!newsLoading&&newsItems.length===0&&(
            <Card style={{padding:40,textAlign:"center"}}>
              <Icon name="insights" size={32} color={T.textSub}/>
              <div style={{fontSize:14,color:T.textSub,marginTop:14,lineHeight:1.9}}>
                לחץ "רענן חדשות" לקבלת תמצית מנותחת<br/>
                <span style={{fontSize:12}}>AI מסכם חדשות לכל מניה בתיק + עדכוני שוק</span>
              </div>
            </Card>
          )}

          {/* loading */}
          {newsLoading&&(
            <Card style={{padding:40,textAlign:"center"}}>
              <div style={{width:28,height:28,borderRadius:"50%",border:`3px solid ${T.navy}`,
                borderTopColor:"transparent",animation:"spin 1s linear infinite",margin:"0 auto 14px"}}/>
              <div style={{fontSize:13,color:T.textSub,marginBottom:4}}>מנתח חדשות עם AI…</div>
              <div style={{fontSize:11,color:T.textSub}}>מושך וסוכם כתבות לכל נייר ערך</div>
            </Card>
          )}

          {/* כרטיסי סיכום */}
          {newsItems.map((group,gi)=>{
            const trendColor = group.trend==="positive"?T.success
              :group.trend==="negative"?T.danger:T.textSub;
            const trendBg = group.trend==="positive"?T.successBg
              :group.trend==="negative"?T.dangerBg:T.bg;
            const trendBorder = group.trend==="positive"?"#bbf7d0"
              :group.trend==="negative"?T.dangerBorder:T.border;
            const trendIcon = group.trend==="positive"?"📈"
              :group.trend==="negative"?"📉":"📊";

            return(
              <Card key={gi} style={{padding:16}}>
                {/* שורת כותרת */}
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{trendIcon}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:T.text}}>{group.label}</div>
                      {group.type==="stock"&&(
                        <div style={{fontSize:11,color:T.textSub}}>{group.ticker}</div>
                      )}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {/* מחיר נוכחי אם קיים */}
                    {prices[group.ticker]&&(
                      <div style={{fontSize:12,fontWeight:700,color:T.navy,
                        background:T.navyLight,border:`1px solid ${T.navyBorder}`,
                        borderRadius:99,padding:"3px 10px"}}>
                        ${Number(prices[group.ticker]).toLocaleString()}
                      </div>
                    )}
                    <div style={{fontSize:11,fontWeight:700,color:trendColor,
                      background:trendBg,border:`1px solid ${trendBorder}`,
                      borderRadius:99,padding:"3px 10px"}}>
                      {group.trend==="positive"?"חיובי"
                        :group.trend==="negative"?"שלילי":"ניטרלי"}
                    </div>
                  </div>
                </div>

                {/* סיכום AI */}
                {group.summary?(
                  <div style={{fontSize:13,color:T.text,lineHeight:1.8,
                    direction:"rtl",padding:"10px 12px",
                    background:T.bg,borderRadius:10,
                    border:`1px solid ${T.border}`}}>
                    {group.summary}
                  </div>
                ):(
                  <div style={{fontSize:12,color:T.textSub,fontStyle:"italic"}}>
                    לא נמצאו כתבות רלוונטיות
                  </div>
                )}

                {/* כתבות מקור — מכווצות */}
                {group.articles?.length>0&&(
                  <details style={{marginTop:10}}>
                    <summary style={{fontSize:11,color:T.textSub,cursor:"pointer",
                      userSelect:"none",listStyle:"none",display:"flex",
                      alignItems:"center",gap:4}}>
                      <span>▸</span>
                      <span>{group.articles.length} כתבות מקור</span>
                    </summary>
                    <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
                      {group.articles.map((a,ai)=>(
                        <a key={ai} href={a.link} target="_blank" rel="noopener noreferrer"
                          style={{fontSize:11,color:T.navyMid,textDecoration:"none",
                            display:"flex",justifyContent:"space-between",
                            alignItems:"flex-start",gap:8,padding:"6px 0",
                            borderBottom:ai<group.articles.length-1
                              ?`1px solid ${T.border}`:"none"}}>
                          <span style={{flex:1,lineHeight:1.5}}>{a.title} ↗</span>
                          {a.source&&<span style={{fontSize:10,color:T.textSub,
                            flexShrink:0,fontWeight:600}}>{a.source}</span>}
                        </a>
                      ))}
                    </div>
                  </details>
                )}

                {/* תאריך עדכון */}
                <div style={{fontSize:10,color:T.textSub,marginTop:8,textAlign:"left"}}>
                  {group.updatedAt?.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"})}
                </div>
              </Card>
            );
          })}

          {/* התראות מחיר */}
          {priceAlerts.length>0&&(
            <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight,padding:16}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                <Icon name="target" size={14} color={T.navy}/>
                <span style={{fontSize:13,fontWeight:700,color:T.navy}}>התראות מחיר פעילות</span>
              </div>
              {priceAlerts.map(a=>(
                <div key={a.ticker} style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.navyBorder}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><Icon name="trending" size={13} color={T.navy}/><span style={{fontSize:13,fontWeight:600,color:T.navy}}>{a.security}</span></div>
                  <span style={{fontSize:13,fontWeight:700,
                    color:a.changePct>=0?T.success:T.danger}}>
                    {a.changePct>=0?"+":""}{a.changePct.toFixed(1)}% ממחיר קנייה
                  </span>
                </div>
              ))}
              <div style={{fontSize:11,color:T.textSub,marginTop:8}}>
                עדכן מחירים כדי לרענן התראות
              </div>
            </Card>
          )}

          {/* סף התראה */}
          <Card style={{padding:16}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
              <Icon name="settings" size={14} color={T.textMid}/>
              <span style={{fontSize:13,fontWeight:700,color:T.text}}>סף התראת מחיר</span>
            </div>
            <div style={{fontSize:12,color:T.textSub,marginBottom:10}}>
              הצג התראה כשמחיר משתנה ב-X% ממחיר הקנייה
            </div>
            <div style={{display:"flex",gap:8}}>
              {[2,3,5,10].map(v=>(
                <button key={v} onClick={()=>setAlertThresh(v)}
                  style={{flex:1,padding:"8px",borderRadius:10,fontFamily:T.font,
                    fontSize:13,fontWeight:700,cursor:"pointer",
                    border:`1px solid ${alertThresh===v?T.navy:T.border}`,
                    background:alertThresh===v?T.navy:"transparent",
                    color:alertThresh===v?"#fff":T.textSub}}>
                  {v}%
                </button>
              ))}
            </div>
          </Card>

        </div>
      )}
{tab==="agent"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card style={{background:`linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%)`,border:"none",padding:18}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:34,height:34,borderRadius:11,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon name="sparkle" size={17} color="#fff"/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>סוכן השקעות</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.55)"}}>
                  {Object.keys(prices).length>0?"מחירים עדכניים ✓":"ללא מחירים — רענן לניתוח מדויק"}
                </div>
              </div>
              {agentHistory.length>0&&(
                <button onClick={()=>setAgentHistory([])}
                  style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:11,color:"rgba(255,255,255,.8)",fontFamily:T.font,fontWeight:600}}>
                  שיחה חדשה
                </button>
              )}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {activeAssets.map(a=>{
                const ticker=extractTicker(a.security);
                const price=prices[ticker];
                const avg=avgBuyPrice(a);
                const pnlPct=price&&avg?(((price-avg)/avg)*100):null;
                return(
                  <div key={a.id} style={{background:"rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px",border:"1px solid rgba(255,255,255,.15)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{ticker}</div>
                    {pnlPct!==null&&<div style={{fontSize:10,fontWeight:600,color:pnlPct>=0?"#86efac":"#fca5a5"}}>{pnlPct>=0?"+":""}{pnlPct.toFixed(1)}%</div>}
                  </div>
                );
              })}
            </div>
          </Card>

          {agentHistory.map(h=>(
            <div key={h.id}>
              <div style={{display:"flex",justifyContent:"flex-start",marginBottom:6}}>
                <div style={{maxWidth:"78%",background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:"14px 14px 14px 2px",padding:"10px 14px",fontSize:13,color:T.navy,fontWeight:600,direction:"rtl",lineHeight:1.5}}>
                  {h.q}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{maxWidth:"85%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:"14px 14px 2px 14px",padding:"12px 14px",fontSize:13,color:T.text,lineHeight:1.8,direction:"rtl",whiteSpace:"pre-wrap"}}>
                  {h.a}
                </div>
              </div>
            </div>
          ))}

          {agentLoading&&(
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"14px 14px 2px 14px",padding:"14px 18px",display:"flex",alignItems:"center",gap:5}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.navy,animation:`agentDot 1.2s ease-in-out ${i*.2}s infinite`}}/>
                ))}
                <style>{`@keyframes agentDot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}`}</style>
              </div>
            </div>
          )}

          {agentHistory.length===0&&!agentLoading&&(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <div style={{fontSize:11,color:T.textSub,fontWeight:700,marginBottom:4,textAlign:"right"}}>שאל את הסוכן</div>
              {[
                ...activeAssets.slice(0,2).map(a=>`האם כדאי להגדיל את הפוזיציה ב-${extractTicker(a.security)}?`),
                "מהו הנייר עם הביצועים הגרועים? האם למכור?",
                "האם התיק שלי מגוון מספיק?",
                "השווה את התיק למדד S&P 500",
                "מה הסיכונים העיקריים בתיק?",
              ].map((s,i)=>(
                <button key={i} onClick={()=>setAgentQuery(s)}
                  style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 14px",textAlign:"right",cursor:"pointer",fontFamily:T.font,fontSize:13,color:T.text,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,transition:"border-color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.navy}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                  <Icon name="trending" size={13} color={T.navyMid}/>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{position:"sticky",bottom:0,paddingTop:8,background:T.bg}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"8px 8px 8px 12px"}}>
              <textarea value={agentQuery} onChange={e=>setAgentQuery(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();runAgent();}}}
                placeholder="שאל שאלה על התיק שלך… (Enter לשליחה)"
                rows={2}
                style={{flex:1,background:"transparent",border:"none",color:T.text,fontSize:14,outline:"none",fontFamily:T.font,resize:"none",direction:"rtl",lineHeight:1.5}}/>
              <button onClick={runAgent} disabled={agentLoading||!agentQuery.trim()}
                style={{width:36,height:36,borderRadius:10,flexShrink:0,background:agentQuery.trim()?T.navy:T.border,border:"none",cursor:agentQuery.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}>
                <Icon name="plane" size={15} color="#fff"/>
              </button>
            </div>
            <div style={{fontSize:10,color:T.textSub,textAlign:"center",marginTop:4}}>Enter לשליחה · Shift+Enter לשורה חדשה</div>
          </div>
        </div>
      )}
    </div>
  );
}

function exportMenuPDF(menu){
  const w=window.open("","_blank");if(!w)return;
  const sections=(menu.sections||[]).filter(s=>s.dishes?.some(d=>d.trim()));
  const cats=(menu.categories||[menu.category]).filter(Boolean);const concepts=(menu.concepts||[]);
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet"><title>${menu.name}</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'system-ui',sans-system-ui;color:#1c1917;background:#fff;padding:48px 56px;direction:rtl;}.header{border-bottom:2px solid #1e3a5f;padding-bottom:20px;margin-bottom:28px;}.title{font-family:'system-ui',system-ui;font-size:32px;font-weight:400;color:#1e3a5f;letter-spacing:-0.5px;margin-bottom:8px;}.tags{display:flex;gap:8px;flex-wrap:wrap;}.tag{background:#ebf0f7;color:#1e3a5f;border:1px solid #c3d4e8;border-radius:99px;padding:4px 14px;font-size:12px;font-weight:600;}.section{margin-bottom:28px;}.section-title{font-size:11px;font-weight:700;color:#a8a29e;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e6e2db;}.dish{padding:9px 0;border-bottom:1px solid #f7f6f3;font-size:14px;color:#1c1917;display:flex;align-items:center;gap:8px;}.dish:last-child{border-bottom:none;}.dish-bullet{width:6px;height:6px;border-radius:50%;background:#1e3a5f;flex-shrink:0;}.notes-box{background:#f7f6f3;border:1px solid #e6e2db;border-radius:10px;padding:16px;margin-top:8px;}.footer{margin-top:40px;text-align:center;font-size:10px;color:#a8a29e;}@media print{body{padding:32px 40px;}}</style></head><body><div class="header"><div class="title">${menu.name}</div><div class="tags">${cats.map(c=>`<span class="tag">${c}</span>`).join("")}${menu.servings?`<span class="tag">${menu.servings} אנשים</span>`:""}${concepts.map(c=>`<span class="tag">${c}</span>`).join("")}</div></div>${sections.length>0?sections.map(sec=>`<div class="section"><div class="section-title">${sec.title||""}</div>${(sec.dishes||[]).filter(d=>d.trim()).map(d=>`<div class="dish"><div class="dish-bullet"></div>${d}</div>`).join("")}</div>`).join(""):""}<div class="footer">Sinario · ${new Date().toLocaleDateString("he-IL")}</div><script>window.onload=()=>{window.print();}<\/script></body></html>`);
  w.document.close();
}

function RecipesTab({menuConceptsList}){
  const [items,setItems]=useStorage("kp-recipes",DEFAULT_RECIPES);
  const [mode,setMode]=useState("recipe");
  const [filterCat,setFilterCat]=useState("הכל");
  const [filterConcept,setFilterConcept]=useState("הכל");
  const [selected,setSelected]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  // ── סעיף 4א: searchQ ──
  const [searchQ,setSearchQ]=useState("");
  const normCats=item=>{if(Array.isArray(item.categories))return item.categories;if(item.category)return[item.category];return[];};
  const blankR={type:"recipe",name:"",categories:[],servings:"",prepTime:"",cookTime:"",ingredients:[{item:"",qty:"",unit:""}],steps:[""],prepNotes:"",concepts:[]};
  const blankM={type:"menu",name:"",categories:[],servings:"",concepts:[],sections:[{id:uid(),title:"מנות ראשונות",dishes:[""]},{id:uid(),title:"עיקריות",dishes:[""]},{id:uid(),title:"קינוחים",dishes:[""]}],notes:""};
  const [form,setForm]=useState(blankR);
  const [notesHtml,setNotesHtml]=useState("");
  const openAdd=()=>{setEditId(null);const b=mode==="recipe"?blankR:{...blankM,sections:[{id:uid(),title:"מנות ראשונות",dishes:[""]},{id:uid(),title:"עיקריות",dishes:[""]},{id:uid(),title:"קינוחים",dishes:[""]}]};setForm(b);setNotesHtml("");setShowForm(true);};
  const openEdit=item=>{setEditId(item.id);const f={...item,categories:normCats(item),servings:String(item.servings||""),prepTime:String(item.prepTime||""),cookTime:String(item.cookTime||"")};if(item.type==="menu"&&!f.sections){f.sections=[{id:uid(),title:"מנות",dishes:item.dishes||[""]}];}setForm(f);setNotesHtml(item.notes||item.prepNotes||"");setShowForm(true);setSelected(null);};
  const save=()=>{
    if(!form.name)return;
    const saved={...form,id:editId||uid(),servings:+form.servings||0,categories:form.categories||[]};
    if(form.type==="recipe")saved.prepNotes=notesHtml;if(form.type==="menu")saved.notes=notesHtml;
    delete saved.category;
    if(editId)setItems(items.map(x=>x.id===editId?saved:x));else setItems([...items,saved]);
    setShowForm(false);setEditId(null);setNotesHtml("");
  };
  const doDelete=id=>{setItems(items.filter(x=>x.id!==id));setConfirmId(null);if(selected===id)setSelected(null);};
  const toggleC=c=>setForm(f=>({...f,concepts:f.concepts.includes(c)?f.concepts.filter(x=>x!==c):[...f.concepts,c]}));
  const toggleCat=c=>setForm(f=>({...f,categories:(f.categories||[]).includes(c)?(f.categories||[]).filter(x=>x!==c):[...(f.categories||[]),c]}));
  // ── סעיף 4ב: filtered עם matchesSearch ──
  const filtered=items.filter(r=>{
    const rc=normCats(r);
    const matchesSearch=!searchQ
      ||r.name.toLowerCase().includes(searchQ.toLowerCase())
      ||(r.ingredients||[]).some(ing=>ing.item?.toLowerCase().includes(searchQ.toLowerCase()))
      ||(r.sections||[]).some(sec=>sec.dishes?.some(d=>d.toLowerCase().includes(searchQ.toLowerCase())));
    return r.type===mode&&(filterCat==="הכל"||rc.includes(filterCat))&&(filterConcept==="הכל"||(r.concepts||[]).includes(filterConcept))&&matchesSearch;
  });
  const sel=items.find(r=>r.id===selected);
  const addSection=()=>setForm(f=>({...f,sections:[...(f.sections||[]),{id:uid(),title:"",dishes:[""]}]}));
  const removeSection=id=>setForm(f=>({...f,sections:(f.sections||[]).filter(s=>s.id!==id)}));
  const updateSection=(id,key,val)=>setForm(f=>({...f,sections:(f.sections||[]).map(s=>s.id===id?{...s,[key]:val}:s)}));
  const addDishToSection=sid=>setForm(f=>({...f,sections:(f.sections||[]).map(s=>s.id===sid?{...s,dishes:[...s.dishes,""]}:s)}));
  const updateDish=(sid,di,val)=>setForm(f=>({...f,sections:(f.sections||[]).map(s=>s.id===sid?{...s,dishes:s.dishes.map((d,i)=>i===di?val:d)}:s)}));
  const removeDish=(sid,di)=>setForm(f=>({...f,sections:(f.sections||[]).map(s=>s.id===sid?{...s,dishes:s.dishes.filter((_,i)=>i!==di)}:s)}));
  return(  
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {confirmId&&<ConfirmModal message="למחוק לצמיתות?" onConfirm={()=>doDelete(confirmId)} onCancel={()=>setConfirmId(null)}/>}
      {!selected?(
        <>
          {/* ── סעיף 4ג: איפוס searchQ בטוגל ── */}
          <div style={{display:"flex",background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:3,gap:3}}>
            {[["recipe","מתכונים"],["menu","תפריטים"]].map(([v,l])=><button key={v} onClick={()=>{setMode(v);setFilterCat("הכל");setFilterConcept("הכל");setShowForm(false);setSearchQ("");}} style={{flex:1,padding:"8px",borderRadius:9,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",border:"none",background:mode===v?T.surface:"transparent",color:mode===v?T.navy:T.textSub,boxShadow:mode===v?"0 1px 4px rgba(0,0,0,.08)":"none"}}>{l}</button>)}
          </div>
          {/* ── סעיף 4ד: SearchBar ── */}
          <SearchBar
            value={searchQ}
            onChange={v=>{setSearchQ(v);setFilterCat("הכל");setFilterConcept("הכל");}}
            placeholder={mode==="recipe"?"חיפוש מתכון, מצרך…":"חיפוש תפריט, מנה…"}
          />
          <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none"}}>
            {["הכל",...RCATS].map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{flexShrink:0,padding:"5px 12px",borderRadius:99,fontFamily:T.font,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${filterCat===c?T.navy:T.border}`,background:filterCat===c?T.navy:"transparent",color:filterCat===c?"#fff":T.textSub}}>{c}</button>)}
          </div>
          {mode==="menu"&&<div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none"}}>{["הכל",...menuConceptsList].map(c=><button key={c} onClick={()=>setFilterConcept(c)} style={{flexShrink:0,padding:"5px 12px",borderRadius:99,fontFamily:T.font,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${filterConcept===c?T.navyMid:T.border}`,background:filterConcept===c?T.navyMid:"transparent",color:filterConcept===c?"#fff":T.textSub}}>{c}</button>)}</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,color:T.textSub}}>{filtered.length} {mode==="recipe"?"מתכונים":"תפריטים"}</div>
            <Btn onClick={openAdd} style={{padding:"7px 14px",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn>
          </div>
          {showForm&&(
            <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
              <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>{editId?(mode==="recipe"?"עריכת מתכון":"עריכת תפריט"):(mode==="recipe"?"מתכון חדש":"תפריט חדש")}</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",gap:8}}><Inp placeholder="תיאור" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{flex:3}}/><Inp type="number" placeholder="כמות אנשים" value={form.servings} onChange={e=>setForm({...form,servings:e.target.value})} style={{flex:1}}/>{mode==="recipe"&&<Inp type="number" placeholder="זמן הכנה (דק׳)" value={form.prepTime} onChange={e=>setForm({...form,prepTime:e.target.value})} style={{flex:1}}/>}</div>
                <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>סוג ארוחה</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{RCATS.map(c=><button key={c} onClick={()=>toggleCat(c)} style={{padding:"5px 11px",borderRadius:99,fontFamily:T.font,fontSize:11,cursor:"pointer",border:`1px solid ${(form.categories||[]).includes(c)?T.navy:T.border}`,background:(form.categories||[]).includes(c)?T.navy:"transparent",color:(form.categories||[]).includes(c)?"#fff":T.textMid}}>{c}</button>)}</div>
                <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>סגנון</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{menuConceptsList.map(c=><button key={c} onClick={()=>toggleC(c)} style={{padding:"5px 11px",borderRadius:99,fontFamily:T.font,fontSize:11,cursor:"pointer",border:`1px solid ${(form.concepts||[]).includes(c)?T.navyMid:T.border}`,background:(form.concepts||[]).includes(c)?T.navyMid:"transparent",color:(form.concepts||[]).includes(c)?"#fff":T.textMid}}>{c}</button>)}</div>
                {mode==="recipe"&&(<>
                  <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>מצרכים</div>
                  {form.ingredients.map((ing,i)=><div key={i} style={{display:"flex",gap:6}}><Inp placeholder="מצרך" value={ing.item} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,item:e.target.value}:x)}))} style={{flex:3}}/><Inp placeholder="כמות" value={ing.qty} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,qty:e.target.value}:x)}))} style={{flex:1}}/><Inp placeholder="יח׳" value={ing.unit} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,unit:e.target.value}:x)}))} style={{flex:1}}/></div>)}
                  <button onClick={()=>setForm(f=>({...f,ingredients:[...f.ingredients,{item:"",qty:"",unit:""}]}))} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"8px",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>+ מצרך</button>
                  <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>שלבי הכנה</div>
                  {form.steps.map((st,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"flex-start"}}><div style={{width:22,height:22,borderRadius:"50%",background:T.navy,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,marginTop:10}}>{i+1}</div><textarea value={st} onChange={e=>setForm(f=>({...f,steps:f.steps.map((x,j)=>j===i?e.target.value:x)}))} rows={2} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,resize:"vertical"}}/></div>)}
                  <button onClick={()=>setForm(f=>({...f,steps:[...f.steps,""]}))} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"8px",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>+ שלב</button>
                  <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>הכנות מקדימות</div>
                  <RichTextEditor value={notesHtml} onChange={setNotesHtml} placeholder="הכנות מקדימות…"/>
                </>)}
                {mode==="menu"&&(<>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:11,color:T.textMid,fontWeight:600}}>חלוקת התפריט</div><button onClick={addSection} style={{fontSize:11,color:T.navy,fontFamily:T.font,background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"4px 12px",cursor:"pointer",fontWeight:600}}>+ הוספת חלק</button></div>
                  {(form.sections||[]).map(sec=>(
                    <div key={sec.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:12}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><Inp placeholder="שם החלק" value={sec.title} onChange={e=>updateSection(sec.id,"title",e.target.value)} style={{flex:1}}/>{(form.sections||[]).length>1&&<button onClick={()=>removeSection(sec.id)} style={{background:"none",border:`1px solid ${T.dangerBorder}`,borderRadius:8,padding:"6px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}><Icon name="trash" size={12} color={T.danger}/></button>}</div>
                      {sec.dishes.map((d,di)=><div key={di} style={{display:"flex",gap:6,marginBottom:6}}><Inp placeholder={`מנה ${di+1}`} value={d} onChange={e=>updateDish(sec.id,di,e.target.value)} style={{flex:1}}/>{sec.dishes.length>1&&<button onClick={()=>removeDish(sec.id,di)} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:18,padding:"0 4px"}}>×</button>}</div>)}
                      <button onClick={()=>addDishToSection(sec.id)} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:8,padding:"6px",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font,width:"100%"}}>+ מנה</button>
                    </div>
                  ))}
                  <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>הערות</div>
                  <RichTextEditor value={notesHtml} onChange={setNotesHtml} placeholder="הערות…"/>
                </>)}
                <div style={{display:"flex",gap:8}}><Btn onClick={save} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowForm(false);setEditId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
              </div>
            </Card>
          )}
          {filtered.map(r=>{const rc=normCats(r);return(
            <Card key={r.id} style={{cursor:"pointer"}} onClick={()=>setSelected(r.id)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  {/* ── סעיף 4ה: highlight ── */}
                  <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:6}}>{highlight(r.name,searchQ)}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {rc.map((c,i)=><span key={i} style={{fontSize:11,color:T.textSub,background:T.bg,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.border}`}}>{c}</span>)}
                    {r.servings&&<span style={{fontSize:11,color:T.textSub,background:T.bg,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.border}`}}>{r.servings} אנשים</span>}
                    {r.type==="recipe"&&(r.prepTime||r.cookTime)&&<span style={{fontSize:11,color:T.textSub,background:T.bg,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.border}`}}>{(+r.prepTime||0)+(+r.cookTime||0)} דק׳</span>}
                    {(r.concepts||[]).map(c=><span key={c} style={{fontSize:11,color:T.navyMid,background:T.navyLight,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.navyBorder}`}}>{c}</span>)}
                  </div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {r.type==="menu"&&<button onClick={e=>{e.stopPropagation();exportMenuPDF(r);}} style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Icon name="download" size={12} color={T.navy}/><span style={{fontSize:10,color:T.navy,fontFamily:T.font,fontWeight:600}}>PDF</span></button>}
                  <ActionBtns onEdit={()=>openEdit(r)} onDelete={()=>setConfirmId(r.id)}/>
                </div>
              </div>
            </Card>
          );})}
          {filtered.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>{searchQ?"לא נמצאו תוצאות":`אין ${mode==="recipe"?"מתכונים":"תפריטים"} עדיין`}</div>}
        </>
      ):(sel&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:T.navy,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>← חזרה</button>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {sel.type==="menu"&&<button onClick={()=>exportMenuPDF(sel)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,border:`1px solid ${T.navyBorder}`,background:T.navyLight,color:T.navy,fontSize:12,fontFamily:T.font,fontWeight:600,cursor:"pointer"}}><Icon name="download" size={13} color={T.navy}/>ייצוא PDF</button>}
              <ActionBtns onEdit={()=>openEdit(sel)} onDelete={()=>setConfirmId(sel.id)}/>
            </div>
          </div>
          <Card>
            <div style={{fontSize:24,fontWeight:300,fontFamily:T.display,color:T.text,marginBottom:10}}>{sel.name}</div>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {normCats(sel).map((c,i)=><span key={i} style={{fontSize:12,color:T.textSub,background:T.bg,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.border}`}}>{c}</span>)}
              {sel.servings&&<span style={{fontSize:12,color:T.textSub,background:T.bg,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.border}`}}>{sel.servings} איש</span>}
              {sel.type==="recipe"&&(sel.prepTime||sel.cookTime)&&<span style={{fontSize:12,color:T.textSub,background:T.bg,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.border}`}}>{(+sel.prepTime||0)+(+sel.cookTime||0)} דק׳</span>}
              {(sel.concepts||[]).map(c=><span key={c} style={{fontSize:12,color:T.navyMid,background:T.navyLight,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.navyBorder}`}}>{c}</span>)}
            </div>
            {sel.type==="recipe"&&(<>
              {sel.ingredients?.length>0&&(<><div style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>מצרכים</div>{sel.ingredients.map((ing,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:13,color:T.text}}>{ing.item}</span><span style={{fontSize:13,color:T.textSub}}>{ing.qty} {ing.unit}</span></div>)}</>)}
              {sel.steps?.length>0&&<div style={{marginTop:14}}><div style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>אופן הכנה</div>{sel.steps.map((st,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:10}}><div style={{width:24,height:24,borderRadius:"50%",background:T.navy,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{st}</div></div>)}</div>}
              {sel.prepNotes&&<div style={{marginTop:14,background:T.navyLight,borderRadius:10,padding:14,border:`1px solid ${T.navyBorder}`}}><div style={{fontSize:11,fontWeight:700,color:T.navyMid,marginBottom:6}}>הכנות מקדימות</div><div style={{fontSize:13,color:T.textMid,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:sel.prepNotes}}/></div>}
            </>)}
            {sel.type==="menu"&&(<>
              {(sel.sections||[]).filter(s=>s.dishes?.some(d=>d.trim())).map(sec=>(
                <div key={sec.id} style={{marginBottom:18}}>
                  {sec.title&&<div style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:.5,textTransform:"uppercase",marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${T.border}`}}>{sec.title}</div>}
                  {sec.dishes.filter(d=>d.trim()).map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><div style={{width:6,height:6,borderRadius:"50%",background:T.navy,flexShrink:0}}/><span style={{fontSize:13,color:T.text}}>{d}</span></div>)}
                </div>
              ))}
              {sel.notes&&<div style={{marginTop:14,background:T.navyLight,borderRadius:10,padding:14,border:`1px solid ${T.navyBorder}`}}><div style={{fontSize:11,fontWeight:700,color:T.navyMid,marginBottom:6}}>הערות</div><div style={{fontSize:13,color:T.textMid,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:sel.notes}}/></div>}
            </>)}
          </Card>
        </div>
      ))}
    </div>
  );
}

function NotesTab(){
  const [notes,setNotes]=useStorage("kp-notes",DEFAULT_NOTES);
  const [html,setHtml]=useState("");
  const [who,setWho]=useState("א");
  const [editId,setEditId]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  // ── סעיף 5א: searchQ ──
  const [searchQ,setSearchQ]=useState("");
  const save=()=>{
    if(!html.replace(/<[^>]+>/g,"").trim())return;
    if(editId){setNotes(notes.map(n=>n.id===editId?{...n,text:html,who}:n));setEditId(null);}
    else{setNotes([{id:uid(),text:html,who,date:new Date().toISOString()},...notes]);}
    setHtml("");
  };
  const startEdit=note=>{setEditId(note.id);setHtml(note.text);setWho(note.who);};
  // ── סעיף 5ב: filteredNotes ──
  const filteredNotes=searchQ
    ?notes.filter(n=>n.text.replace(/<[^>]+>/g," ").toLowerCase().includes(searchQ.toLowerCase()))
    :notes;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {confirmId&&<ConfirmModal message="למחוק פתק זה?" onConfirm={()=>{setNotes(notes.filter(n=>n.id!==confirmId));setConfirmId(null);}} onCancel={()=>setConfirmId(null)}/>}
              {/* ── סעיף 5ג: SearchBar ── */}
      <SearchBar value={searchQ} onChange={setSearchQ} placeholder="חיפוש בפתקים…" />
      <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight,padding:16}}>
        {editId&&<div style={{fontSize:12,color:T.navy,fontWeight:600,marginBottom:8}}>עריכת פתק</div>}
        <RichTextEditor value={html} onChange={setHtml} placeholder="כתיבת פתק…" minHeight={80}/>
        <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
          <div style={{display:"flex",gap:6}}>{[["א","אדיר"],["ס","ספיר"]].map(([v,l])=><button key={v} onClick={()=>setWho(v)} style={{padding:"6px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${who===v?T.navy:T.border}`,background:who===v?T.navyLight:"transparent",color:who===v?T.navy:T.textMid}}>{l}</button>)}</div>
          <div style={{marginRight:"auto",display:"flex",gap:8}}>{editId&&<Btn variant="secondary" onClick={()=>{setEditId(null);setHtml("");}} style={{padding:"8px 14px"}}>ביטול</Btn>}<Btn onClick={save} style={{padding:"8px 20px"}}>{editId?"עדכון":"שמירה"}</Btn></div>
        </div>
      </Card>

      {filteredNotes.map(note=>(
        <Card key={note.id} style={{padding:16}}>
          <div style={{fontSize:14,color:T.text,lineHeight:1.7,marginBottom:10}} dangerouslySetInnerHTML={{__html:note.text}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:11,color:T.textSub}}>{note.who==="א"?"אדיר":"ספיר"} · {fmtDt(note.date)}</div>
            <ActionBtns onEdit={()=>startEdit(note)} onDelete={()=>setConfirmId(note.id)}/>
          </div>
        </Card>
      ))}
      {filteredNotes.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>{searchQ?"לא נמצאו פתקים":"אין פתקים עדיין"}</div>}
    </div>
  );
}

function TripsSection({month,year,setMonth,setYear}){
  const [trips,setTrips]=useStorage("kp-trips",DEFAULT_TRIPS);
  const [sel,setSel]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [showItem,setShowItem]=useState(false);
  const [showAll,setShowAll]=useState(false);
  const [editTripId,setEditTripId]=useState(null);
  const [editItemId,setEditItemId]=useState(null);
  const [confirmTrip,setConfirmTrip]=useState(null);
  const [confirmItem,setConfirmItem]=useState(null);
  // ── סעיף 6א: searchQ ──
  const [searchQ,setSearchQ]=useState("");
  const blankTf={name:"",budget:"",dateFrom:"",dateTo:"",color:T.navy};
  const [tf,setTf]=useState(blankTf);
  const blankItf={cat:"טיסות",label:"",amount:"",currency:"ILS",rateUsed:"1"};
  const [itf,setItf]=useState(blankItf);
  const tripTotal=t=>t.items.reduce((s,i)=>s+toILS(i),0);
  const openAddTrip=()=>{setEditTripId(null);setTf(blankTf);setShowNew(true);};
  const openEditTrip=trip=>{setEditTripId(trip.id);setTf({name:trip.name,budget:String(trip.budget),dateFrom:trip.dateFrom||"",dateTo:trip.dateTo||"",color:trip.color||T.navy});setShowNew(true);};
  const saveTrip=()=>{
    if(!tf.name||!tf.budget||!tf.dateFrom||!tf.dateTo)return;
    if(editTripId)setTrips(trips.map(t=>t.id===editTripId?{...t,...tf,budget:+tf.budget}:t));
    else setTrips([...trips,{...tf,id:uid(),budget:+tf.budget,items:[]}]);
    setTf(blankTf);setShowNew(false);setEditTripId(null);
  };
  const openAddItem=()=>{setEditItemId(null);setItf(blankItf);setShowItem(true);};
  const openEditItem=item=>{setEditItemId(item.id);setItf({cat:item.cat||"אחר",label:item.label,amount:String(item.amount),currency:item.currency||"ILS",rateUsed:String(item.rateUsed||1)});setShowItem(true);};
  const saveItem=()=>{
    if(!itf.label||!itf.amount)return;
    const saved={...itf,id:editItemId||uid(),amount:+itf.amount,rateUsed:+itf.rateUsed||1};
    if(editItemId)setTrips(trips.map(t=>t.id===sel?{...t,items:t.items.map(i=>i.id===editItemId?saved:i)}:t));
    else setTrips(trips.map(t=>t.id===sel?{...t,items:[...t.items,saved]}:t));
    setItf(blankItf);setShowItem(false);setEditItemId(null);
  };
  const doDeleteTrip=id=>{setTrips(trips.filter(t=>t.id!==id));setConfirmTrip(null);if(sel===id)setSel(null);};
  const doDeleteItem=id=>{setTrips(trips.map(t=>t.id===sel?{...t,items:t.items.filter(i=>i.id!==id)}:t));setConfirmItem(null);};
  const selTrip=trips.find(t=>t.id===sel);
  const catIcon=c=>({טיסות:"plane",מלון:"home",ביטוח:"heart",אוכל:"basket",בילויים:"sparkle",כרטיסים:"note"}[c]||"currency");
  const filteredTrips=(showAll?[...trips].sort((a,b)=>(a.dateFrom||"").localeCompare(b.dateFrom||"")):trips.filter(t=>{if(!t.dateFrom)return true;const d=new Date(t.dateFrom);return d.getMonth()===month&&d.getFullYear()===year;}))
    // ── סעיף 6ב: displayTrips ──
    .filter(t=>!searchQ||t.name.toLowerCase().includes(searchQ.toLowerCase()));
  return(
    <div style={{padding:"0 0 40px"}}>
      {confirmTrip&&<ConfirmModal message="למחוק חופשה זו?" onConfirm={()=>doDeleteTrip(confirmTrip)} onCancel={()=>setConfirmTrip(null)}/>}
      {confirmItem&&<ConfirmModal message="למחוק פריט זה?" onConfirm={()=>doDeleteItem(confirmItem)} onCancel={()=>setConfirmItem(null)}/>}
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {!sel?(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontSize:14,fontWeight:600,color:T.text}}>{filteredTrips.length} חופשות</div>
                <button onClick={()=>setShowAll(v=>!v)} style={{fontSize:11,color:showAll?T.navy:T.textSub,fontFamily:T.font,background:showAll?T.navyLight:"transparent",border:`1px solid ${showAll?T.navyBorder:T.border}`,borderRadius:99,padding:"4px 12px",cursor:"pointer",fontWeight:600}}>{showAll?"לפי תקופה":"צפייה בהכל"}</button>
              </div>
              <Btn onClick={openAddTrip} style={{padding:"7px 14px",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn>
            </div>
            {/* ── סעיף 6ג: SearchBar ── */}
            <SearchBar value={searchQ} onChange={setSearchQ} placeholder="חיפוש חופשה, יעד…" />
            {showNew&&(
              <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
                <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>{editTripId?"עריכת חופשה":"חופשה חדשה"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <Inp placeholder="שם החופשה" value={tf.name} onChange={e=>setTf({...tf,name:e.target.value})}/>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{flex:1}}><div style={{fontSize:11,color:T.textMid,fontWeight:600,marginBottom:4}}>מתאריך</div><Inp type="date" value={tf.dateFrom} onChange={e=>setTf({...tf,dateFrom:e.target.value})}/></div>
                    <div style={{flex:1}}><div style={{fontSize:11,color:T.textMid,fontWeight:600,marginBottom:4}}>עד תאריך</div><Inp type="date" value={tf.dateTo} onChange={e=>setTf({...tf,dateTo:e.target.value})}/></div>
                  </div>
                  <Inp type="number" placeholder="תקציב ₪" value={tf.budget} onChange={e=>setTf({...tf,budget:e.target.value})}/>
                  <div style={{display:"flex",gap:8}}><Btn onClick={saveTrip} disabled={!tf.name||!tf.budget||!tf.dateFrom||!tf.dateTo} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowNew(false);setEditTripId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
                </div>
              </Card>
            )}
            {filteredTrips.map(trip=>{
              const tot=tripTotal(trip);const over=tot>trip.budget;
              const dateLabel=trip.dateFrom&&trip.dateTo?`${new Date(trip.dateFrom).toLocaleDateString("he-IL")} – ${new Date(trip.dateTo).toLocaleDateString("he-IL")}`:trip.dateFrom||"";
              return(
                  <Card key={trip.id} style={{cursor:"pointer"}} onClick={()=>{setSel(trip.id);setSearchQ("");}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      {/* ── סעיף 6ד: highlight ── */}
                      <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:3}}>{highlight(trip.name,searchQ)}</div>
                      {dateLabel&&<div style={{fontSize:12,color:T.textSub}}>{dateLabel}</div>}
                    </div>
                    <ActionBtns onEdit={()=>openEditTrip(trip)} onDelete={()=>setConfirmTrip(trip.id)}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:18,fontWeight:600,fontFamily:T.display}}>{fmt(tot)}</div><div style={{fontSize:12,color:T.textSub}}>מתוך {fmt(trip.budget)}</div></div>
                  <PBar value={tot} max={trip.budget} color={trip.color||T.navy}/>
                  <div style={{marginTop:6,fontSize:12,fontWeight:600,color:over?T.danger:T.success}}>{over?`חריגה של ${fmt(tot-trip.budget)}`:`נותר ${fmt(trip.budget-tot)}`}</div>
                </Card>
              );
            })}
            {filteredTrips.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>{searchQ?"לא נמצאו חופשות":(showAll?"אין חופשות":`אין חופשות ב${MONTHS[month]} ${year}`)}</div>}
          </>
        ):(selTrip&&(
          <div>
            <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:T.navy,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:14}}>← חזרה</button>
            <Card style={{marginBottom:12}}>
              <div style={{fontSize:22,fontWeight:300,fontFamily:T.display,marginBottom:4}}>{selTrip.name}</div>
              {(selTrip.dateFrom||selTrip.dateTo)&&<div style={{fontSize:12,color:T.textSub,marginBottom:12}}>{selTrip.dateFrom&&new Date(selTrip.dateFrom).toLocaleDateString("he-IL")}{selTrip.dateTo&&` – ${new Date(selTrip.dateTo).toLocaleDateString("he-IL")}`}</div>}
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div><div style={{fontSize:11,color:T.textSub}}>שולם</div><div style={{fontSize:22,fontWeight:600,fontFamily:T.display}}>{fmt(tripTotal(selTrip))}</div></div><div style={{textAlign:"left"}}><div style={{fontSize:11,color:T.textSub}}>תקציב</div><div style={{fontSize:22,fontWeight:600,fontFamily:T.display,color:T.navy}}>{fmt(selTrip.budget)}</div></div></div>
              <PBar value={tripTotal(selTrip)} max={selTrip.budget} h={6}/>
              <div style={{marginTop:8,fontSize:12,fontWeight:600,color:tripTotal(selTrip)>selTrip.budget?T.danger:T.success}}>{tripTotal(selTrip)>selTrip.budget?`חריגה של ${fmt(tripTotal(selTrip)-selTrip.budget)}`:`נותר ${fmt(selTrip.budget-tripTotal(selTrip))}`}</div>
            </Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"4px 0 8px"}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>פירוט הוצאות</div><Btn onClick={openAddItem} style={{padding:"6px 12px",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn></div>
            {showItem&&(
              <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight,marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:10}}>{editItemId?"עריכת פריט":"פריט חדש"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>קטגוריה</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TCAT.map(c=><button key={c} onClick={()=>setItf({...itf,cat:c})} style={{padding:"6px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${itf.cat===c?T.navy:T.border}`,background:itf.cat===c?T.navyLight:"transparent",color:itf.cat===c?T.navy:T.textMid}}>{c}</button>)}</div>
                  <Inp placeholder="תיאור" value={itf.label} onChange={e=>setItf({...itf,label:e.target.value})}/>
                  <Inp type="number" placeholder="סכום" value={itf.amount} onChange={e=>setItf({...itf,amount:e.target.value})}/>
                  <CurrencyField currency={itf.currency} setCurrency={c=>setItf({...itf,currency:c})} rate={itf.rateUsed} setRate={r=>setItf({...itf,rateUsed:r})} amount={itf.amount}/>
                  <div style={{display:"flex",gap:8}}><Btn onClick={saveItem} disabled={!itf.label||!itf.amount} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowItem(false);setEditItemId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
                </div>
              </Card>
            )}
            {selTrip.items.map((item,i)=>{const cur=CURRENCIES.find(c=>c.code===item.currency)||CURRENCIES[0];return(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<selTrip.items.length-1?`1px solid ${T.border}`:"none"}}>
                <CatIcon icon={catIcon(item.cat)} color={T.navy} size={34}/>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,color:T.text}}>{item.label}</div><div style={{fontSize:11,color:T.textSub}}>{item.cat}{item.currency!=="ILS"?` · ${fmtCur(item.amount,cur.symbol)}`:""}</div></div>
                <div style={{fontSize:14,fontWeight:600,color:T.text}}>{fmt(toILS(item))}</div>
                <ActionBtns onEdit={()=>openEditItem(item)} onDelete={()=>setConfirmItem(item.id)}/>
              </div>
            );})}
            {selTrip.items.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:24,fontSize:13}}>אין פירוט עדיין</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsSection({expenses,specialItems=[],cats,month,year,setMonth,setYear}){
  const [savingsGoal,setSavingsGoal]=useStorage("kp-savings-goal",3000);
  const [editGoal,setEditGoal]=useState(false);
  const [goalInput,setGoalInput]=useState("");
  const [drillCat,setDrillCat]=useState(null);
  const [reportTab,setReportTab]=useState("monthly");
  const monthExp=e=>{const d=new Date(e.date||e.expense_date||"");return d.getMonth()===month&&d.getFullYear()===year;};
  const prevM=month===0?11:month-1;const prevY=month===0?year-1:year;
  const monthExpenses=expenses.filter(monthExp);
  const totalSpent=monthExpenses.reduce((s,e)=>s+e.amount,0);
  const monthSpecial=specialItems.filter(i=>{const d=new Date(i.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const totalSpecial=monthSpecial.reduce((s,i)=>s+toILS(i),0);
  const grandTotal=totalSpent+totalSpecial;
  const totalBudget=cats.reduce((s,c)=>s+c.budget,0);
  const remaining=totalBudget-grandTotal;
  const savedThisMonth=Math.max(0,remaining);
  const catSpent=id=>monthExpenses.filter(e=>e.catId===id).reduce((s,e)=>s+e.amount,0);
  const trend=Array.from({length:6},(_,i)=>{const mi=(month-5+i+12)%12;const yi=month-5+i<0?year-1:year;const v=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi;}).reduce((s,e)=>s+e.amount,0)+specialItems.filter(i=>{const d=new Date(i.date);return d.getMonth()===mi&&d.getFullYear()===yi;}).reduce((s,i2)=>s+toILS(i2),0);return{label:MONTHS[mi].slice(0,3),v,current:mi===month&&yi===year};});
  const maxT=Math.max(...trend.map(t=>t.v),1);
  const annualData=MONTHS.map((m,mi)=>{const v=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===year;}).reduce((s,e)=>s+e.amount,0)+specialItems.filter(i=>{const d=new Date(i.date);return d.getMonth()===mi&&d.getFullYear()===year;}).reduce((s,i2)=>s+toILS(i2),0);return{label:m.slice(0,3),v,mi};});
  const annualTotal=annualData.reduce((s,d)=>s+d.v,0);const annualAvg=annualTotal/12;const maxA=Math.max(...annualData.map(d=>d.v),1);
  const splitTrend=Array.from({length:6},(_,i)=>{const mi=(month-5+i+12)%12;const yi=month-5+i<0?year-1:year;const ae=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi&&e.who==="א";}).reduce((s,e)=>s+e.amount,0);const se=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi&&e.who==="ס";}).reduce((s,e)=>s+e.amount,0);return{label:MONTHS[mi].slice(0,3),a:ae,s:se,current:mi===month&&yi===year};});
  const prevMonthTotal=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===prevM&&d.getFullYear()===prevY;}).reduce((s,e)=>s+e.amount,0);
  const insights=[];
  if(grandTotal>totalBudget)insights.push({type:"warn",text:`חרגת ב-${fmt(grandTotal-totalBudget)} מהתקציב החודשי`});
  else insights.push({type:"good",text:`נותר ${fmt(remaining)} מהתקציב — ${Math.round((remaining/totalBudget)*100)}%`});
  if(prevMonthTotal>0){const diff=grandTotal-prevMonthTotal;if(Math.abs(diff)>200)insights.push({type:diff>0?"warn":"good",text:diff>0?`הוצאות גבוהות ב-${fmt(diff)} לעומת ${MONTHS[prevM]}`:`חסכת ${fmt(-diff)} לעומת ${MONTHS[prevM]}`});}
  const topCat=cats.map(c=>({...c,sp:catSpent(c.id)})).sort((a,b)=>b.sp-a.sp)[0];
  if(topCat?.sp>topCat?.budget)insights.push({type:"warn",text:`${topCat.label}: חריגה של ${fmt(topCat.sp-topCat.budget)}`});
  if(savedThisMonth>=savingsGoal)insights.push({type:"good",text:`יעד החיסכון הושג! ${fmt(savedThisMonth)} נחסכו החודש`});
  else if(savingsGoal>0)insights.push({type:"info",text:`נדרש עוד ${fmt(savingsGoal-savedThisMonth)} להשגת יעד החיסכון`});
  const drillExpenses=drillCat?monthExpenses.filter(e=>e.catId===drillCat):[];
  const drillCatObj=cats.find(c=>c.id===drillCat);
  const exportCSV=()=>{const rows=[["תאריך","תיאור","קטגוריה","מי שילם","סכום"],...monthExpenses.map(e=>{const c=cats.find(x=>x.id===e.catId);return[e.date,e.desc||"",c?.label||"",e.who==="א"?"אדיר":"ספיר",e.amount];}),...monthSpecial.map(i=>[i.date,i.desc,"מיוחד","",toILS(i).toFixed(0)])];const csv=rows.map(r=>r.join(",")).join("\n");const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);a.download=`sinario-${MONTHS[month]}-${year}.csv`;a.click();};
  const tabBtn=(id,label)=><button onClick={()=>setReportTab(id)} style={{padding:"7px 14px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${reportTab===id?T.navy:T.border}`,background:reportTab===id?T.navy:"transparent",color:reportTab===id?"#fff":T.textSub,flexShrink:0}}>{label}</button>;
  return(
    <div style={{padding:"0 0 40px"}}>
      <div style={{padding:"12px 16px 0",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>{tabBtn("monthly","חודשי")}{tabBtn("annual","שנתי")}{tabBtn("split","חלוקה")}{tabBtn("insights","תובנות")}</div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {reportTab==="monthly"&&(<>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div><div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1,marginBottom:4}}>סה"כ {MONTHS[month]}</div><div style={{fontSize:32,fontWeight:300,fontFamily:T.display,color:T.text,letterSpacing:-1}}>{fmt(grandTotal)}</div><div style={{fontSize:12,color:T.textSub,marginTop:4}}>מתוך {fmt(totalBudget)}</div></div>
              <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bg,color:T.textMid,fontSize:12,fontFamily:T.font,fontWeight:600,cursor:"pointer"}}><Icon name="download" size={13} color={T.textMid}/>CSV</button>
            </div>
            <PBar value={grandTotal} max={totalBudget} h={6}/>
            <div style={{marginTop:8,fontSize:12,fontWeight:600,color:grandTotal>totalBudget?T.danger:T.success}}>{grandTotal>totalBudget?`חריגה של ${fmt(grandTotal-totalBudget)}`:`נותר ${fmt(remaining)}`}</div>
            {totalSpecial>0&&<div style={{marginTop:6,fontSize:11,color:T.textSub}}>הוצאות שוטפות {fmt(totalSpent)} + מיוחדות {fmt(totalSpecial)}</div>}
          </Card>
          <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="target" size={15} color={T.navy}/><div style={{fontSize:13,fontWeight:600,color:T.navy}}>יעד חיסכון חודשי</div></div>
              <button onClick={()=>{setEditGoal(v=>!v);setGoalInput(String(savingsGoal));}} style={{background:"none",border:`1px solid ${T.navyBorder}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,color:T.navy,fontFamily:T.font,fontWeight:600}}>{editGoal?"סגור":"עריכה"}</button>
            </div>
            {editGoal?(<div style={{display:"flex",gap:8}}><Inp type="number" placeholder="יעד חיסכון ₪" value={goalInput} onChange={e=>setGoalInput(e.target.value)} style={{flex:1}}/><Btn onClick={()=>{setSavingsGoal(+goalInput||0);setEditGoal(false);}} style={{padding:"10px 16px"}}>שמור</Btn></div>):(
              <><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:T.textMid}}>נחסך בפועל</span><span style={{fontSize:14,fontWeight:600,color:savedThisMonth>=savingsGoal?T.success:T.danger}}>{fmt(savedThisMonth)}</span></div><PBar value={savedThisMonth} max={savingsGoal||1} color={savedThisMonth>=savingsGoal?T.success:T.navy} h={6}/><div style={{marginTop:6,fontSize:11,color:T.textMid}}>{savingsGoal>0?`יעד: ${fmt(savingsGoal)}`:"לא הוגדר יעד"}</div></>
            )}
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>השוואה לחודש קודם</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1,textAlign:"center",padding:14,background:T.bg,borderRadius:12}}><div style={{fontSize:11,color:T.textSub,marginBottom:4}}>{MONTHS[prevM]}</div><div style={{fontSize:20,fontWeight:600,fontFamily:T.display,color:T.text}}>{fmt(prevMonthTotal)}</div></div>
              <div style={{color:grandTotal>prevMonthTotal?T.danger:T.success,fontWeight:700,fontSize:18}}>{grandTotal>prevMonthTotal?"▲":"▼"}</div>
              <div style={{flex:1,textAlign:"center",padding:14,background:T.navyLight,borderRadius:12,border:`1px solid ${T.navyBorder}`}}><div style={{fontSize:11,color:T.navy,marginBottom:4}}>{MONTHS[month]}</div><div style={{fontSize:20,fontWeight:600,fontFamily:T.display,color:T.navy}}>{fmt(grandTotal)}</div></div>
            </div>
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:16}}>מגמה — 6 חודשים</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:110}}>
              {trend.map((t,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{fontSize:9,color:t.current?T.navy:T.textSub,fontWeight:t.current?700:400,textAlign:"center"}}>{t.v>0?fmt(t.v):""}</div>
                  <div style={{width:"100%",background:T.bg,borderRadius:6,height:72,display:"flex",alignItems:"flex-end",overflow:"hidden",border:`1px solid ${T.border}`}}><div style={{width:"100%",height:`${(t.v/maxT)*100}%`,background:t.current?T.navy:"#c3d4e8",borderRadius:4,transition:"height .7s"}}/></div>
                  <span style={{fontSize:10,color:t.current?T.navy:T.textSub,fontWeight:t.current?700:400}}>{t.label}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>{drillCat?<><button onClick={()=>setDrillCat(null)} style={{background:"none",border:"none",color:T.navy,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:600}}>← חזרה</button><span style={{marginRight:8}}>{drillCatObj?.label}</span></>:"פירוט לפי קטגוריה"}</div>
            {!drillCat?(cats.map(c=>{const sp=catSpent(c.id);return(
              <div key={c.id} style={{marginBottom:14,cursor:"pointer"}} onClick={()=>setDrillCat(c.id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><div style={{display:"flex",alignItems:"center",gap:8}}><CatIcon icon={c.icon} color={c.color} size={30}/><div><div style={{fontSize:13,color:T.text,fontWeight:500}}>{c.label}</div><div style={{fontSize:11,color:T.textSub}}>{((sp/(totalSpent||1))*100).toFixed(0)}% מהכלל</div></div></div><div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:600,color:sp>c.budget?T.danger:T.text}}>{fmt(sp)}</div><div style={{fontSize:10,color:T.textSub}}>מתוך {fmt(c.budget)}</div></div></div>
                <PBar value={sp} max={c.budget} color={c.color}/>
              </div>
            );})
            ):(
              <><div style={{marginBottom:12}}><div style={{fontSize:20,fontWeight:300,fontFamily:T.display}}>{fmt(catSpent(drillCat))}</div><div style={{fontSize:12,color:T.textSub}}>מתוך {fmt(drillCatObj?.budget||0)} תקציב</div></div><PBar value={catSpent(drillCat)} max={drillCatObj?.budget||1} color={drillCatObj?.color||T.navy} h={6}/><div style={{marginTop:14}}>{drillExpenses.sort((a,b)=>new Date(b.date)-new Date(a.date)).map((e,i)=>(<div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<drillExpenses.length-1?`1px solid ${T.border}`:"none"}}><div><div style={{fontSize:13,fontWeight:500,color:T.text}}>{e.desc||"הוצאה"}</div><div style={{fontSize:11,color:T.textSub}}>{e.who==="א"?"אדיר":"ספיר"} · {new Date(e.date).toLocaleDateString("he-IL")}</div></div><div style={{fontSize:14,fontWeight:600,color:T.text}}>{fmt(e.amount)}</div></div>))}{drillExpenses.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:16,fontSize:13}}>אין הוצאות בקטגוריה זו</div>}</div></>
            )}
          </Card>
        </>)}
        {reportTab==="annual"&&(<>
          <Card><div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1,marginBottom:4}}>סה"כ {year}</div><div style={{fontSize:32,fontWeight:300,fontFamily:T.display,color:T.text,letterSpacing:-1}}>{fmt(annualTotal)}</div><div style={{fontSize:12,color:T.textSub,marginTop:4}}>ממוצע חודשי: {fmt(annualAvg)}</div></Card>
          <Card><div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:16}}>הוצאות לאורך {year}</div><div style={{display:"flex",alignItems:"flex-end",gap:5,height:130}}>{annualData.map((d,i)=>(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{fontSize:8,color:d.mi===month?T.navy:T.textSub,fontWeight:d.mi===month?700:400,textAlign:"center",writingMode:"vertical-rl"}}>{d.v>0?`₪${Math.round(d.v/1000)}K`:""}</div><div style={{width:"100%",background:T.bg,borderRadius:4,height:90,display:"flex",alignItems:"flex-end",overflow:"hidden",border:`1px solid ${T.border}`}}><div style={{width:"100%",height:`${(d.v/maxA)*100}%`,background:d.mi===month?T.navy:"#c3d4e8",transition:"height .7s"}}/></div><span style={{fontSize:8,color:d.mi===month?T.navy:T.textSub,fontWeight:d.mi===month?700:400}}>{d.label}</span></div>))}</div></Card>
          <Card><div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>חודש לפי חודש</div>{annualData.filter(d=>d.v>0).sort((a,b)=>b.v-a.v).map((d,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:28,height:28,borderRadius:8,background:d.mi===month?T.navy:T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:d.mi===month?"#fff":T.textMid}}>{d.label.slice(0,2)}</div><span style={{fontSize:13,color:T.text,fontWeight:d.mi===month?600:400}}>{MONTHS[d.mi]}</span></div><div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:600,color:T.text}}>{fmt(d.v)}</div><div style={{fontSize:10,color:T.textSub}}>{((d.v/annualTotal)*100).toFixed(0)}%</div></div></div>))}</Card>
        </>)}
        {reportTab==="split"&&(<>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>חלוקה — {MONTHS[month]}</div>
            {[["אדיר","א"],["ספיר","ס"]].map(([name,who])=>{const amt=monthExpenses.filter(e=>e.who===who).reduce((s,e)=>s+e.amount,0);const pct=((amt/(totalSpent||1))*100).toFixed(0);return(<div key={who} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:T.text}}>{name}</span><span style={{fontSize:14,fontWeight:600,color:T.navy}}>{fmt(amt)} <span style={{fontSize:11,color:T.textSub,fontWeight:400}}>({pct}%)</span></span></div><PBar value={amt} max={totalSpent||1} color={T.navy} h={6}/></div>);})}
            {Math.abs(monthExpenses.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0)-monthExpenses.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0))>5&&(<div style={{marginTop:8,background:T.navyLight,borderRadius:10,padding:12,border:`1px solid ${T.navyBorder}`}}><div style={{fontSize:12,fontWeight:600,color:T.navy}}>{monthExpenses.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0)>monthExpenses.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0)?"ספיר חייבת לאדיר":"אדיר חייב לספיר"}: {fmt(Math.abs(monthExpenses.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0)-monthExpenses.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0))/2)}</div></div>)}
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:16}}>חלוקה — 6 חודשים</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>{splitTrend.map((t,i)=>{const maxV=Math.max(...splitTrend.map(x=>x.a+x.s),1);return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:"100%",height:90,display:"flex",alignItems:"flex-end",gap:2}}><div style={{flex:1,background:T.navy,borderRadius:"3px 3px 0 0",height:`${(t.a/maxV)*90}px`,transition:"height .7s",opacity:t.current?1:.6}}/><div style={{flex:1,background:"#be185d",borderRadius:"3px 3px 0 0",height:`${(t.s/maxV)*90}px`,transition:"height .7s",opacity:t.current?1:.6}}/></div><span style={{fontSize:10,color:t.current?T.navy:T.textSub,fontWeight:t.current?700:400}}>{t.label}</span></div>);})}</div>
            <div style={{display:"flex",gap:12,marginTop:8,fontSize:11,color:T.textSub}}><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:2,background:T.navy}}/> אדיר</div><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:2,background:"#be185d"}}/> ספיר</div></div>
          </Card>
        </>)}
        {reportTab==="insights"&&(<>
          <Card>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Icon name="insights" size={15} color={T.navy}/><div style={{fontSize:14,fontWeight:600,color:T.text}}>תובנות חכמות — {MONTHS[month]}</div></div>
            {insights.map((ins,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:8,background:ins.type==="warn"?T.dangerBg:ins.type==="good"?T.successBg:T.navyLight,border:`1px solid ${ins.type==="warn"?T.dangerBorder:ins.type==="good"?"#bbf7d0":T.navyBorder}`}}><span style={{fontSize:14}}>{ins.type==="warn"?"⚠️":ins.type==="good"?"✓":"→"}</span><span style={{fontSize:13,color:T.text,lineHeight:1.5}}>{ins.text}</span></div>))}
            {insights.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:20,fontSize:13}}>אין תובנות לחודש זה</div>}
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>קטגוריות עם חריגות חוזרות</div>
            {cats.map(c=>{const overMonths=Array.from({length:6},(_,i)=>{const mi=(month-5+i+12)%12;const yi=month-5+i<0?year-1:year;const sp=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi&&e.catId===c.id;}).reduce((s,e)=>s+e.amount,0);return sp>c.budget;}).filter(Boolean).length;if(overMonths<2)return null;return(<div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}><CatIcon icon={c.icon} color={c.color} size={32}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:T.text}}>{c.label}</div><div style={{fontSize:11,color:T.danger}}>חריגה ב-{overMonths} מתוך 6 חודשים אחרונים</div></div><div style={{fontSize:12,color:T.textSub}}>תקציב {fmt(c.budget)}</div></div>);})}
            {cats.every(c=>Array.from({length:6},(_,i)=>{const mi=(month-5+i+12)%12;const yi=month-5+i<0?year-1:year;return expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi&&e.catId===c.id;}).reduce((s,e)=>s+e.amount,0)>c.budget;}).filter(Boolean).length<2)&&<div style={{textAlign:"center",color:T.textSub,padding:16,fontSize:13}}>אין חריגות חוזרות</div>}
          </Card>
        </>)}
      </div>
    </div>
  );
}

function SettingsSection({cats,setCats,specialCatsList,setSpecialCatsList,menuConceptsList,setMenuConceptsList}){
  const [tab,setTab]=useState("system");
  const [calConnected,setCalConnected]=useState(false);
  const [editId,setEditId]=useState(null);
  const [confirmCatId,setConfirmCatId]=useState(null);
  const [newSpecialCat,setNewSpecialCat]=useState("");
  const [newConcept,setNewConcept]=useState("");
  const [editBudget,setEditBudget]=useState(false);
  const [budgetInput,setBudgetInput]=useState("");
  const blank={label:"",icon:"basket",color:T.navy,budget:1000};
  const [form,setForm]=useState(blank);
  const ICONS=["basket","car","bolt","sparkle","heart","home","plane","currency","note","book"];
  const COLORS=[T.navy,"#2563ab","#6b5c3e","#7c3aed","#be185d","#1a6b3c","#b45309","#0369a1","#7f1d1d","#374151"];
  const startEdit=c=>{setEditId(c.id);setForm({label:c.label,icon:c.icon,color:c.color,budget:c.budget});};
  const saveEdit=()=>{
    if(!form.label)return;
    if(editId==="__new__")setCats([...cats,{...form,id:"c"+uid()}]);
    else setCats(cats.map(c=>c.id===editId?{...c,...form}:c));
    setEditId(null);setForm(blank);
  };
  return(
    <div style={{padding:"0 0 40px"}}>
      {confirmCatId&&<ConfirmModal message="למחוק קטגוריה זו?" onConfirm={()=>{setCats(cats.filter(c=>c.id!==confirmCatId));setConfirmCatId(null);}} onCancel={()=>setConfirmCatId(null)}/>}
      <div style={{padding:"16px 16px 0",display:"flex",gap:6}}>
        {[["system","מערכת"],["db","נתונים"]].map(([id,l])=>(<button key={id} onClick={()=>setTab(id)} style={{padding:"8px 18px",borderRadius:99,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",border:`1px solid ${tab===id?T.navy:T.border}`,background:tab===id?T.navy:"transparent",color:tab===id?"#fff":T.textSub}}>{l}</button>))}
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {tab==="system"&&(<>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="wallet" size={15} color={T.navy}/><div style={{fontSize:13,fontWeight:700,color:T.navy}}>תקציב חודשי כולל</div></div>
              <button onClick={()=>{setEditBudget(v=>!v);setBudgetInput(String(cats.reduce((s,c)=>s+c.budget,0)));}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,color:T.textMid,fontFamily:T.font,fontWeight:600}}>{editBudget?"סגור":"עריכה"}</button>
            </div>
            {editBudget?(<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{fontSize:12,color:T.textMid,marginBottom:4}}>הזן תקציב חודשי כולל — יחולק שווה בין הקטגוריות</div><div style={{display:"flex",gap:8}}><Inp type="number" placeholder="תקציב ₪" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} style={{flex:1}}/><Btn onClick={()=>{const total=+budgetInput||0;if(!total||cats.length===0)return;const share=Math.round(total/cats.length);setCats(cats.map(c=>({...c,budget:share})));setEditBudget(false);}} style={{padding:"10px 16px"}}>חלק</Btn></div></div>):(<div style={{fontSize:24,fontWeight:300,fontFamily:T.display,color:T.text}}>{fmt(cats.reduce((s,c)=>s+c.budget,0))}</div>)}
          </Card>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy}}>קטגוריות הוצאות שוטפות</div>
              <Btn onClick={()=>{setEditId("__new__");setForm(blank);}} style={{padding:"6px 12px",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn>
            </div>
            {editId&&(
              <div style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:600,color:T.navy,marginBottom:10}}>{editId==="__new__"?"קטגוריה חדשה":"עריכת קטגוריה"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <Inp placeholder="שם קטגוריה" value={form.label} onChange={e=>setForm({...form,label:e.target.value})}/>
                  <Inp type="number" placeholder="תקציב חודשי ₪" value={form.budget} onChange={e=>setForm({...form,budget:+e.target.value})}/>
                  <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>אייקון</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{ICONS.map(ic=><button key={ic} onClick={()=>setForm({...form,icon:ic})} style={{width:36,height:36,borderRadius:9,background:form.icon===ic?T.navy+"18":T.bg,border:`2px solid ${form.icon===ic?T.navy:T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={ic} size={15} color={form.icon===ic?T.navy:T.textSub}/></button>)}</div>
                  <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>צבע</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{COLORS.map(c=><button key={c} onClick={()=>setForm({...form,color:c})} style={{width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",border:`3px solid ${form.color===c?"#1c1917":"transparent"}`}}/>)}</div>
                  <div style={{display:"flex",gap:8}}><Btn onClick={saveEdit} style={{flex:1,padding:"9px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>setEditId(null)} style={{flex:1,padding:"9px"}}>ביטול</Btn></div>
                </div>
              </div>
            )}
            {cats.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}><CatIcon icon={c.icon} color={c.color} size={36}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{c.label}</div><div style={{fontSize:11,color:T.textSub}}>תקציב: {fmt(c.budget)}</div></div><ActionBtns onEdit={()=>startEdit(c)} onDelete={()=>cats.length>1?setConfirmCatId(c.id):null}/></div>))}
          </Card>
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>קטגוריות הוצאות מיוחדות</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{specialCatsList.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:4,background:T.bg,border:`1px solid ${T.border}`,borderRadius:99,padding:"5px 12px"}}><span style={{fontSize:12,color:T.text}}>{c.label}</span><button onClick={()=>setSpecialCatsList(specialCatsList.filter(x=>x.id!==c.id))} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button></div>))}</div>
            <div style={{display:"flex",gap:8}}><Inp placeholder="קטגוריה חדשה" value={newSpecialCat} onChange={e=>setNewSpecialCat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newSpecialCat.trim()){setSpecialCatsList([...specialCatsList,{id:"sc"+uid(),label:newSpecialCat.trim()}]);setNewSpecialCat("");}}}/><Btn onClick={()=>{if(newSpecialCat.trim()){setSpecialCatsList([...specialCatsList,{id:"sc"+uid(),label:newSpecialCat.trim()}]);setNewSpecialCat("");}}} style={{padding:"10px 14px",flexShrink:0}}><Icon name="plus" size={13} color="#fff"/></Btn></div>
          </Card>
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>סגנונות תפריטים</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{menuConceptsList.map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"5px 12px"}}><span style={{fontSize:12,color:T.navy}}>{c}</span><button onClick={()=>setMenuConceptsList(menuConceptsList.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:T.navyMid,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button></div>))}</div>
            <div style={{display:"flex",gap:8}}><Inp placeholder="סגנון חדש" value={newConcept} onChange={e=>setNewConcept(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newConcept.trim()){setMenuConceptsList([...menuConceptsList,newConcept.trim()]);setNewConcept("");}}}/><Btn onClick={()=>{if(newConcept.trim()){setMenuConceptsList([...menuConceptsList,newConcept.trim()]);setNewConcept("");}}} style={{padding:"10px 14px",flexShrink:0}}><Icon name="plus" size={13} color="#fff"/></Btn></div>
          </Card>
        </>)}
        {tab==="db"&&(<>
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:16}}>חיבור ל-Supabase</div>
            <Inp placeholder="Supabase URL" value="" onChange={()=>{}}/>
            <Inp placeholder="API Key" value="" onChange={()=>{}} style={{marginTop:8}}/>
            <Btn style={{marginTop:10,width:"100%",padding:"12px"}} onClick={()=>{}}>בדיקת חיבור</Btn>
            <div style={{marginTop:8,fontSize:11,color:T.textSub,textAlign:"center"}}>חיבור מלא בגרסה הבאה</div>
          </Card>
          <Card>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><Icon name="calendar" size={18} color={T.navy}/><div style={{fontSize:13,fontWeight:700,color:T.navy}}>חיבור ל-Google Calendar</div></div>
            <div style={{fontSize:12,color:T.textMid,lineHeight:1.7,marginBottom:14,background:T.navyLight,borderRadius:10,padding:12,border:`1px solid ${T.navyBorder}`}}>יאפשר ייצוא חופשות ישירות ל-Calendar</div>
            {calConnected?(<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:T.successBg,borderRadius:10,border:"1px solid #bbf7d0"}}><span style={{fontSize:13}}>✓</span><span style={{fontSize:13,color:T.success,fontWeight:600}}>מחובר בהצלחה</span><button onClick={()=>setCalConnected(false)} style={{marginRight:"auto",background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>ניתוק</button></div>):(<Btn style={{width:"100%",padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={()=>setCalConnected(true)}><Icon name="calendar" size={14} color="#fff"/>התחבר ל-Google Calendar</Btn>)}
          </Card>
        </>)}
      </div>
    </div>
  );
}

const SECTIONS=[
  {id:"home",    label:"בית", icon:"home"},
  {id:"trips",   label:"חופשות",    icon:"plane"},
  {id:"invest",  label:"השקעות",    icon:"chart"},
  {id:"reports", label:"דוחות",     icon:"insights"},
];
const HOME_TABS=[
  {id:"expenses",label:"הוצאות"},
  {id:"grocery", label:"רשימת קניות"},
  {id:"recipes", label:"מתכונים/תפריטים"},
  {id:"notes",   label:"פתקים"},
];
const INVEST_TABS=[
  {id:"portfolio",label:"תיק השקעות"},
  {id:"news",     label:"חדשות והתראות"},
  {id:"agent",    label:"סוכן חכם"},
];

export default function App(){
  const [authed,setAuthed]=useState(()=>{try{return sessionStorage.getItem("sinario_auth")==="1";}catch{return false;}});
  const [cats,             setCats]             =useStorage("sp-cats",         DEFAULT_CATS);
  const [expenses,         setExpenses]         =useStorage("sp-expenses",     SEED_EXPENSES);
  const [special,          setSpecial]          =useStorage("kp-special",      DEFAULT_SPECIAL);
  const [specialCatsList,  setSpecialCatsList]  =useStorage("sp-special-cats", DEFAULT_SPECIAL_CATS);
  const [menuConceptsList, setMenuConceptsList] =useStorage("sp-menu-concepts",DEFAULT_MENU_CONCEPTS);
  const [section,  setSection] =useState("home");
  const [homeTab,  setHomeTab] =useState("expenses");
  const [investTab,setInvestTab]=useState("portfolio");
  const [month,    setMonth]   =useState(new Date().getMonth());
  const [year,     setYear]    =useState(2026);
  const monthExp=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const monthSpecialTotal=special.filter(i=>{const d=new Date(i.date);return d.getMonth()===month&&d.getFullYear()===year;}).reduce((s,i)=>s+toILS(i),0);
  if(!authed)return <PinScreen onUnlock={()=>setAuthed(true)}/>;
  return(
    <div style={{background:T.bg,minHeight:"100vh",width:"100%",fontFamily:T.font,direction:"rtl",color:T.text}}>
      <style>{globalCss}</style>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"12px 20px",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 0 rgba(0,0,0,.04)"}}>
        <div style={{maxWidth:720,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4}}>
  <button
    onClick={()=>setSection("settings")}
    style={{
      background: section==="settings" ? T.navyLight : "transparent",
      border: `1px solid ${section==="settings" ? T.navyBorder : "transparent"}`,
      borderRadius: 8,
      width: 30, height: 30,
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor:"pointer", transition:"all .15s", flexShrink:0
    }}>
    <Icon name="settings" size={17} color={section==="settings" ? T.navy : T.textMid}/>
  </button>
  <div style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"5px 14px",fontSize:12,color:T.navy,fontWeight:600,flexShrink:0}}>{MONTHS[month]} {year}</div>
</div>
<div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
  <div style={{opacity:0,width:30,height:30}}/>
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    <div style={{fontSize:18,fontWeight:700,fontFamily:T.display,color:T.navy,letterSpacing:-.3}}>Sinario</div>
    <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${T.navy}33`}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="19" cy="6" r="3" fill="#f0c040" stroke="#fff" strokeWidth="1.2"/></svg>
    </div>
  </div>
</div>
        </div>
      </div>
<div style={{background:T.surface,borderBottom:`1px solid ${T.border}`}}>
  <div style={{maxWidth:720,margin:"0 auto",display:"flex",padding:"6px 12px",gap:4}}>
    {SECTIONS.map(s=>(<button key={s.id} onClick={()=>{setSection(s.id);if(s.id==="home")setHomeTab("expenses");if(s.id==="invest")setInvestTab("portfolio");}} style={{flex:1,padding:"8px 4px",border:`1px solid ${section===s.id?T.navy:"#e0dbd4"}`,background:section===s.id?T.navy:"#f7f5f2",color:section===s.id?"#fff":T.textMid,fontFamily:T.font,fontSize:12,fontWeight:section===s.id?600:500,cursor:"pointer",borderRadius:12,transition:"all .15s",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:5}}><span>{s.label}</span><Icon name={s.icon} size={13} color={section===s.id?"#fff":T.textSub}/></button>))}
</div>
      </div>
      {section==="home"&&(<div style={{background:T.surface,borderBottom:`1px solid ${T.border}`}}><div style={{maxWidth:720,margin:"0 auto",display:"flex",padding:"6px 12px",gap:4}}>{HOME_TABS.map(t=>(<button key={t.id} onClick={()=>setHomeTab(t.id)} style={{flex:1,padding:"5px 4px",border:`1px solid ${homeTab===t.id?T.navy:"#e0dbd4"}`,background:homeTab===t.id?T.navy:"#f7f5f2",color:homeTab===t.id?"#fff":T.textMid,fontFamily:T.font,fontSize:11,fontWeight:homeTab===t.id?600:500,cursor:"pointer",borderRadius:12,transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center"}}>{t.label}</button>))}</div></div>)}
      {section==="home"&&(<div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"10px 16px"}}><div style={{maxWidth:720,margin:"0 auto"}}><PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/></div></div>)}
      {section==="trips"&&(<div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"10px 16px"}}><div style={{maxWidth:720,margin:"0 auto"}}><PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/></div></div>)}
      {section==="invest"&&(<div style={{background:T.surface,borderBottom:`1px solid ${T.border}`}}><div style={{maxWidth:720,margin:"0 auto",display:"flex",padding:"6px 12px",gap:4}}>{INVEST_TABS.map(t=>(<button key={t.id} onClick={()=>setInvestTab(t.id)} style={{flex:1,padding:"5px 4px",border:`1px solid ${investTab===t.id?T.navy:"#e0dbd4"}`,background:investTab===t.id?T.navy:"#f7f5f2",color:investTab===t.id?"#fff":T.textMid,fontFamily:T.font,fontSize:11,fontWeight:investTab===t.id?600:500,cursor:"pointer",borderRadius:12,transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center"}}>{t.label}</button>))}</div></div>)}
      {section==="reports"&&(<div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"10px 16px"}}><div style={{maxWidth:720,margin:"0 auto"}}><PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/></div></div>)}
      <div style={{maxWidth:720,margin:"0 auto",padding:"16px 16px 40px"}}>
        {section==="home"&&homeTab==="expenses"&&<ExpensesTab expenses={monthExp} setExpenses={setExpenses} cats={cats} month={month} year={year} specialItems={special} setSpecialItems={setSpecial} specialCatsList={specialCatsList} monthSpecialTotal={monthSpecialTotal}/>}
        {section==="home"&&homeTab==="grocery"  &&<GroceryTab/>}
        {section==="home"&&homeTab==="recipes"  &&<RecipesTab menuConceptsList={menuConceptsList}/>}
        {section==="home"&&homeTab==="notes"    &&<NotesTab/>}
        {section==="trips"   &&<TripsSection month={month} year={year} setMonth={setMonth} setYear={setYear}/>}
        {section==="invest"  &&<InvestSection tab={investTab} setTab={setInvestTab}/>}
        {section==="reports" &&<ReportsSection expenses={expenses} specialItems={special} cats={cats} month={month} year={year} setMonth={setMonth} setYear={setYear}/>}
        {section==="settings"&&<SettingsSection cats={cats} setCats={setCats} specialCatsList={specialCatsList} setSpecialCatsList={setSpecialCatsList} menuConceptsList={menuConceptsList} setMenuConceptsList={setMenuConceptsList}/>}
      </div>
    </div>
  );
}
