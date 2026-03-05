import { useState, useEffect, useRef, useCallback } from "react";

// ─── FONTS ────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap";
document.head.appendChild(fontLink);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:       "#f7f6f3",
  surface:  "#ffffff",
  border:   "#e6e2db",
  borderHover: "#c8c2b8",
  text:     "#1c1917",
  textMid:  "#57534e",
  textSub:  "#a8a29e",
  navy:     "#1e3a5f",
  navyMid:  "#2d5282",
  navyLight:"#ebf0f7",
  navyBorder:"#c3d4e8",
  danger:   "#c0392b",
  dangerBg: "#fdf2f2",
  dangerBorder:"#f5c6c2",
  success:  "#1a6b3c",
  successBg:"#f0faf4",
  font:     "'DM Sans', sans-serif",
  display:  "'DM Serif Display', serif",
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const YEARS  = [2024,2025,2026];
const CURRENCIES = [
  {code:"ILS",symbol:"₪",name:"שקל"},
  {code:"USD",symbol:"$",name:"דולר"},
  {code:"EUR",symbol:"€",name:"יורו"},
  {code:"GBP",symbol:"£",name:"פאונד"},
  {code:"JPY",symbol:"¥",name:"ין"},
];

const DEFAULT_CATS = [
  {id:"c1",label:"מזון וסופר",  icon:"basket",  color:T.navy,  budget:3000},
  {id:"c2",label:"תחבורה",      icon:"car",      color:"#2563ab",budget:1200},
  {id:"c3",label:"חשבונות",     icon:"bolt",     color:"#6b5c3e",budget:2500},
  {id:"c4",label:"בילויים",     icon:"sparkles", color:"#7c3aed",budget:800 },
  {id:"c5",label:"בריאות",      icon:"heart",    color:"#be185d",budget:600 },
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
  {id:109,desc:"מים",       amount:180,catId:"c3",who:"א",date:"2026-02-25"},
  {id:110,desc:"ארוחת ערב", amount:220,catId:"c4",who:"ס",date:"2026-02-20"},
  {id:111,desc:"פארם",      amount:150,catId:"c5",who:"א",date:"2026-02-18"},
  {id:112,desc:"חניה",      amount:60, catId:"c2",who:"א",date:"2026-01-15"},
];

const DEFAULT_SPECIAL = [
  {id:"sp1",desc:"מחשב נייד",catId:"tech",  amount:4200,currency:"ILS",rateUsed:1,   date:"2026-02-10"},
  {id:"sp2",desc:"ספה",      catId:"home",  amount:850, currency:"USD",rateUsed:3.65,date:"2026-01-20"},
];
const SPECIAL_CATS = [
  {id:"home",label:"בית ורהיטים"},{id:"tech",label:"טכנולוגיה"},
  {id:"clothing",label:"ביגוד"},{id:"gift",label:"מתנות"},
  {id:"medical",label:"רפואה"},{id:"other",label:"אחר"},
];

const DEFAULT_GROCERY = [
  {id:"g1",name:"חלב",checked:false,price:7},
  {id:"g2",name:"לחם",checked:false,price:12},
  {id:"g3",name:"ביצים",checked:false,price:18},
];

const DEFAULT_TRIPS = [
  {id:"t1",name:"אילת — קיץ 2026",budget:8000,items:[
    {id:"ti1",label:"טיסות",     amount:2200,currency:"ILS",rateUsed:1},
    {id:"ti2",label:"מלון",      amount:3200,currency:"ILS",rateUsed:1},
    {id:"ti3",label:"ביטוח",     amount:180, currency:"ILS",rateUsed:1},
  ],dates:"יולי 2026",color:T.navy},
  {id:"t2",name:"ברצלונה 2025",budget:15000,items:[
    {id:"ti4",label:"טיסות",     amount:1800,currency:"EUR",rateUsed:3.9},
    {id:"ti5",label:"מלון",      amount:2100,currency:"EUR",rateUsed:3.9},
    {id:"ti6",label:"הוצאות שוטפות",amount:600,currency:"EUR",rateUsed:3.95},
  ],dates:"ספטמבר 2025",color:"#2563ab"},
];

const DEFAULT_RECIPES = [
  {id:"r1",name:"פסטה ברוטב עגבניות",category:"ארוחות ערב",servings:4,prepTime:15,cookTime:25,
   ingredients:[{item:"פסטה",qty:"400",unit:"גרם"},{item:"עגבניות מרוסקות",qty:"400",unit:"גרם"},{item:"שום",qty:"3",unit:"שיני"},{item:"שמן זית",qty:"3",unit:"כפות"}],
   steps:["לבשל פסטה לפי הוראות.","לטגן שום בשמן זית 2 דקות.","להוסיף עגבניות ולבשל 15 דקות.","לערבב עם הפסטה."],
   prepNotes:"אפשר להכין את הרוטב מראש ולשמור במקרר עד 3 ימים."},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt    = n  => "₪" + Math.round(n).toLocaleString("he-IL");
const fmtCur = (n,sym) => sym + Number(n).toLocaleString();
const today  = () => new Date().toISOString().slice(0,10);
const uid    = () => Date.now() + Math.floor(Math.random()*9999);

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

// ─── ICON SVGs ────────────────────────────────────────────────────────────────
function Icon({name,size=16,color="currentColor"}){
  const icons={
    basket:   <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>,
    car:      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>,
    bolt:     <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"/>,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>,
    heart:    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>,
    home:     <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>,
    plane:    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>,
    chart:    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/>,
    book:     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>,
    plus:     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>,
    x:        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>,
    chevron:  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>,
    edit:     <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/>,
    trash:    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>,
    currency: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>,
    insights: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={1.8}>
      {icons[name]||null}
    </svg>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const globalCss = `
  *{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-thumb{background:#d6d0c8;border-radius:4px;}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .tab-btn:hover{background:#f0ede8!important;}
  .card-hover:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)!important;transform:translateY(-1px);transition:all .2s!important;}
`;

function Card({children,style={},className=""}){
  return(
    <div className={className} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.03)",...style}}>
      {children}
    </div>
  );
}

function Btn({children,variant="primary",onClick,style={},disabled=false}){
  const base={fontFamily:T.font,fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",borderRadius:10,padding:"9px 18px",border:"none",transition:"all .15s",opacity:disabled?.6:1,...style};
  const variants={
    primary:{background:T.navy,color:"#fff"},
    secondary:{background:T.bg,color:T.textMid,border:`1px solid ${T.border}`},
    ghost:{background:"transparent",color:T.navy,border:`1px solid ${T.navyBorder}`},
    danger:{background:T.dangerBg,color:T.danger,border:`1px solid ${T.dangerBorder}`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...base,...variants[variant]}}>{children}</button>;
}

function Input({value,onChange,placeholder,type="text",style={}}){
  return(
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",
        color:T.text,fontSize:14,outline:"none",fontFamily:T.font,width:"100%",...style}}/>
  );
}

function ProgressBar({value,max,color=T.navy,height=5}){
  const pct=Math.min(100,(value/(max||1))*100);
  return(
    <div style={{background:"#ece8e2",borderRadius:99,height,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:value>max?T.danger:color,transition:"width .7s cubic-bezier(.22,1,.36,1)"}}/>
    </div>
  );
}

function CatIcon({icon,color,size=36}){
  return(
    <div style={{width:size,height:size,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <Icon name={icon} size={size*.45} color={color}/>
    </div>
  );
}

// Period picker
function PeriodPicker({month,year,setMonth,setYear}){
  return(
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:4}}>
        {YEARS.map(y=>(
          <button key={y} onClick={()=>setYear(y)} style={{
            padding:"5px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s",
            border:`1px solid ${year===y?T.navy:T.border}`,background:year===y?T.navy:"transparent",color:year===y?"#fff":T.textSub,
          }}>{y}</button>
        ))}
      </div>
      <div style={{width:1,height:18,background:T.border}}/>
      <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",flex:1}}>
        {MONTHS.map((m,i)=>(
          <button key={i} onClick={()=>setMonth(i)} style={{
            flexShrink:0,padding:"5px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s",
            border:`1px solid ${month===i?T.navy:T.border}`,background:month===i?T.navy:"transparent",color:month===i?"#fff":T.textSub,
          }}>{m.slice(0,3)}</button>
        ))}
      </div>
    </div>
  );
}

// Donut
function Donut({slices,size=130}){
  const total=slices.reduce((s,sl)=>s+sl.val,0);
  if(!total)return<div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",color:T.textSub,fontSize:12}}>אין נתונים</div>;
  const R=46,cx=size/2,cy=size/2,SW=14;
  let angle=-90;
  const arcs=slices.filter(s=>s.val>0).map(sl=>{
    const deg=(sl.val/total)*360;
    const r1=(angle*Math.PI)/180,r2=((angle+deg)*Math.PI)/180;
    const laf=deg>180?1:0;
    const d=`M${cx+R*Math.cos(r1)} ${cy+R*Math.sin(r1)} A${R} ${R} 0 ${laf} 1 ${cx+R*Math.cos(r2)} ${cy+R*Math.sin(r2)}`;
    angle+=deg;
    return{...sl,d};
  });
  return(
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#ece8e2" strokeWidth={SW}/>
      {arcs.map((a,i)=><path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={SW-2} strokeLinecap="round" style={{transition:"all .5s"}}/>)}
      <text x={cx} y={cy-5} textAnchor="middle" fill={T.text} fontSize="12" fontWeight="700" fontFamily={T.font}>{fmt(total)}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fill={T.textSub} fontSize="9" fontFamily={T.font}>הוצאות</text>
    </svg>
  );
}

// ─── ADD EXPENSE DRAWER ───────────────────────────────────────────────────────
function AddExpenseDrawer({cats,onAdd,onClose}){
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({amount:"",desc:"",catId:cats[0]?.id||"",who:"א",date:today()});
  const numpad=[["7","8","9"],["4","5","6"],["1","2","3"],["⌫","0","✓"]];
  const press=k=>{
    if(k==="⌫"){setForm(f=>({...f,amount:f.amount.slice(0,-1)}));return;}
    if(k==="✓"){if(form.amount)setStep(1);return;}
    if(form.amount.length>=6)return;
    setForm(f=>({...f,amount:f.amount+k}));
  };
  const submit=()=>{
    if(!form.amount||!form.catId)return;
    const cat=cats.find(c=>c.id===form.catId);
    onAdd({...form,id:uid(),amount:+form.amount,icon:cat?.icon});
    onClose();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(28,25,23,.45)",backdropFilter:"blur(6px)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.surface,borderTop:`1px solid ${T.border}`,borderRadius:"22px 22px 0 0",
        padding:"22px 18px 40px",width:"100%",maxWidth:480,fontFamily:T.font,direction:"rtl",
        animation:"slideUp .28s cubic-bezier(.22,1,.36,1)",boxShadow:"0 -8px 40px rgba(0,0,0,.1)",
      }}>
        <div style={{width:32,height:3,borderRadius:2,background:T.border,margin:"0 auto 20px"}}/>
        {step===0?(
          <>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:44,fontWeight:300,color:form.amount?T.text:T.border,fontFamily:T.display,letterSpacing:-1,minHeight:56}}>
                {form.amount?`₪${form.amount}`:"₪0"}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {numpad.map((row,ri)=>(
                <div key={ri} style={{display:"flex",gap:6,flexDirection:"row-reverse"}}>
                  {row.map(k=>(
                    <button key={k} onClick={()=>press(k)} style={{
                      flex:1,padding:"14px 0",borderRadius:12,fontFamily:T.font,
                      border:`1px solid ${k==="✓"?T.navy:T.border}`,
                      background:k==="✓"?T.navy:T.surface,
                      color:k==="✓"?"#fff":T.text,
                      fontSize:k==="✓"||k==="⌫"?17:19,fontWeight:500,cursor:"pointer",
                    }}>{k}</button>
                  ))}
                </div>
              ))}
            </div>
          </>
        ):(
          <>
            <div style={{fontSize:26,fontWeight:300,color:T.text,fontFamily:T.display,textAlign:"center",marginBottom:20}}>{fmt(+form.amount)}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Input autoFocus placeholder="תיאור — שופרסל, דלק…" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {cats.map(c=>(
                  <button key={c.id} onClick={()=>setForm({...form,catId:c.id})} style={{
                    padding:"7px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",
                    border:`1px solid ${form.catId===c.id?c.color:T.border}`,
                    background:form.catId===c.id?c.color+"15":"transparent",
                    color:form.catId===c.id?c.color:T.textMid,
                  }}>{c.label}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                {[["א","אדיר"],["ס","ספיר"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setForm({...form,who:v})} style={{
                    flex:1,padding:"10px",borderRadius:10,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",
                    border:`1px solid ${form.who===v?T.navy:T.border}`,
                    background:form.who===v?T.navyLight:"transparent",
                    color:form.who===v?T.navy:T.textMid,
                  }}>{l}</button>
                ))}
              </div>
              <Input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              <Btn onClick={submit} style={{padding:"13px",borderRadius:12,fontSize:14}}>שמור</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── TAB: הוצאות שוטפות ───────────────────────────────────────────────────────
function ExpensesTab({expenses,setExpenses,cats,month,year}){
  const [showAdd,setShowAdd]=useState(false);
  const monthExp=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const totalBudget=cats.reduce((s,c)=>s+c.budget,0);
  const totalSpent=monthExp.reduce((s,e)=>s+e.amount,0);
  const catSpent=id=>monthExp.filter(e=>e.catId===id).reduce((s,e)=>s+e.amount,0);
  const adir=monthExp.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0);
  const sapir=monthExp.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0);
  const diff=Math.abs(adir-sapir)/2;
  const from=adir>sapir?"אדיר":"ספיר";
  const to=adir>sapir?"ספיר":"אדיר";
  const pct=Math.round((totalSpent/(totalBudget||1))*100);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {/* Hero */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>סה״כ הוצאות</div>
            <div style={{fontSize:34,fontWeight:300,color:T.text,fontFamily:T.display,letterSpacing:-1}}>{fmt(totalSpent)}</div>
            <div style={{fontSize:12,color:T.textSub,marginTop:4}}>מתוך {fmt(totalBudget)} תקציב</div>
          </div>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:28,fontWeight:600,color:totalSpent>totalBudget?T.danger:T.navy,fontFamily:T.display}}>{pct}%</div>
            <div style={{fontSize:11,color:T.textSub}}>נוצל</div>
          </div>
        </div>
        <ProgressBar value={totalSpent} max={totalBudget} color={totalSpent>totalBudget?T.danger:T.navy} height={6}/>
        <div style={{marginTop:8,fontSize:12,fontWeight:600,color:totalSpent>totalBudget?T.danger:T.success}}>
          {totalSpent>totalBudget?`חריגה של ${fmt(totalSpent-totalBudget)}`:`נותר ${fmt(totalBudget-totalSpent)}`}
        </div>
      </Card>

      {/* Who */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["אדיר",adir],["ספיר",sapir]].map(([name,amt])=>(
          <Card key={name} style={{padding:16}}>
            <div style={{fontSize:11,color:T.textSub,fontWeight:600,marginBottom:4}}>{name}</div>
            <div style={{fontSize:22,fontWeight:600,color:T.text,fontFamily:T.display}}>{fmt(amt)}</div>
            <div style={{fontSize:11,color:T.textSub,marginTop:2}}>{((amt/(totalSpent||1))*100).toFixed(0)}%</div>
          </Card>
        ))}
      </div>

      {diff>5&&(
        <Card style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,padding:16}}>
          <div style={{fontSize:11,color:T.navyMid,fontWeight:700,letterSpacing:.5,marginBottom:4}}>התחשבנות {MONTHS[month]}</div>
          <div style={{fontSize:17,fontWeight:600,color:T.navy}}>{from} מעביר/ת ל{to} {fmt(diff)}</div>
        </Card>
      )}

      {/* Donut + categories */}
      <Card>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <Donut slices={cats.map(c=>({val:catSpent(c.id),color:c.color}))} size={130}/>
          <div style={{flex:1}}>
            {cats.map(c=>{
              const sp=catSpent(c.id);
              return(
                <div key={c.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:T.textMid,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:c.color,display:"inline-block"}}/>
                      {c.label}
                    </span>
                    <span style={{fontSize:11,color:sp>c.budget?T.danger:T.textSub}}>{fmt(sp)}</span>
                  </div>
                  <ProgressBar value={sp} max={c.budget} color={c.color}/>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:600,color:T.text}}>הוצאות אחרונות</div>
          <Btn onClick={()=>setShowAdd(true)} style={{padding:"7px 14px",fontSize:12}}>
            <span style={{display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={14} color="#fff"/>הוסף</span>
          </Btn>
        </div>
        {monthExp.slice(0,6).map((ex,i)=>{
          const cat=cats.find(c=>c.id===ex.catId);
          return(
            <div key={ex.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<Math.min(monthExp.length,6)-1?`1px solid ${T.border}`:"none"}}>
              <CatIcon icon={cat?.icon||"basket"} color={cat?.color||T.navy}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:T.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.desc||"הוצאה"}</div>
                <div style={{fontSize:11,color:T.textSub}}>{cat?.label} · {ex.who==="א"?"אדיר":"ספיר"} · {new Date(ex.date).toLocaleDateString("he-IL")}</div>
              </div>
              <div style={{fontSize:14,fontWeight:600,color:T.text,flexShrink:0}}>{fmt(ex.amount)}</div>
            </div>
          );
        })}
        {monthExp.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:24,fontSize:13}}>אין הוצאות עדיין</div>}
      </Card>
      {showAdd&&<AddExpenseDrawer cats={cats} onAdd={e=>setExpenses([e,...expenses])} onClose={()=>setShowAdd(false)}/>}
    </div>
  );
}

// ─── TAB: הוצאות מיוחדות ─────────────────────────────────────────────────────
function SpecialTab(){
  const [items,setItems]=useStorage("kp-special",DEFAULT_SPECIAL);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({desc:"",catId:"home",amount:"",currency:"ILS",rateUsed:"",date:today()});
  const toILS=item=>{
    const rate=+item.rateUsed||1;
    return item.currency==="ILS"?item.amount:item.amount*rate;
  };
  const total=items.reduce((s,i)=>s+toILS(i),0);
  const add=()=>{
    if(!form.desc||!form.amount)return;
    setItems([...items,{...form,id:uid(),amount:+form.amount,rateUsed:+form.rateUsed||1}]);
    setForm({desc:"",catId:"home",amount:"",currency:"ILS",rateUsed:"",date:today()});
    setShowForm(false);
  };
  const cur=CURRENCIES.find(c=>c.code===form.currency)||CURRENCIES[0];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1}}>סה״כ הוצאות מיוחדות</div>
          <div style={{fontSize:28,fontWeight:300,fontFamily:T.display,color:T.text}}>{fmt(total)}</div>
        </div>
        <Btn onClick={()=>setShowForm(!showForm)} style={{padding:"8px 16px"}}>
          <span style={{display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={14} color="#fff"/>הוסף</span>
        </Btn>
      </div>

      {showForm&&(
        <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
          <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>הוצאה מיוחדת חדשה</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Input placeholder="תיאור (מחשב, ספה…)" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {SPECIAL_CATS.map(c=>(
                <button key={c.id} onClick={()=>setForm({...form,catId:c.id})} style={{
                  padding:"6px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",
                  border:`1px solid ${form.catId===c.id?T.navy:T.border}`,
                  background:form.catId===c.id?T.navyLight:"transparent",
                  color:form.catId===c.id?T.navy:T.textMid,
                }}>{c.label}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Input type="number" placeholder="סכום" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={{flex:2}}/>
              <select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 8px",color:T.text,fontSize:13,fontFamily:T.font,outline:"none"}}>
                {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select>
            </div>
            {form.currency!=="ILS"&&(
              <div style={{display:"flex",gap:8}}>
                <Input type="number" placeholder={`שער ${cur.name} ביום התשלום`} value={form.rateUsed} onChange={e=>setForm({...form,rateUsed:e.target.value})} style={{flex:1}}/>
                <div style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.textSub,display:"flex",alignItems:"center"}}>
                  {form.amount&&form.rateUsed?`≈ ${fmt(+form.amount * +form.rateUsed)}`:"= ? ₪"}
                </div>
              </div>
            )}
            <Input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={add} style={{flex:1,padding:"11px"}}>שמור</Btn>
              <Btn variant="secondary" onClick={()=>setShowForm(false)} style={{flex:1,padding:"11px"}}>ביטול</Btn>
            </div>
          </div>
        </Card>
      )}

      {items.map((item,i)=>{
        const cat=SPECIAL_CATS.find(c=>c.id===item.catId);
        const cur=CURRENCIES.find(c=>c.code===item.currency)||CURRENCIES[0];
        const ilsVal=toILS(item);
        return(
          <Card key={item.id} className="card-hover">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:4}}>{item.desc}</div>
                <div style={{fontSize:11,color:T.textSub,marginBottom:8}}>{cat?.label} · {new Date(item.date).toLocaleDateString("he-IL")}</div>
                {item.currency!=="ILS"&&(
                  <div style={{fontSize:12,color:T.textSub}}>
                    {fmtCur(item.amount,cur.symbol)} × שער {item.rateUsed} = {fmt(ilsVal)}
                  </div>
                )}
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:18,fontWeight:600,color:T.text,fontFamily:T.display}}>{fmt(ilsVal)}</div>
                {item.currency!=="ILS"&&<div style={{fontSize:11,color:T.textSub}}>{fmtCur(item.amount,cur.symbol)}</div>}
              </div>
            </div>
            <button onClick={()=>setItems(items.filter(x=>x.id!==item.id))} style={{marginTop:10,background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:11,fontFamily:T.font,display:"flex",alignItems:"center",gap:4}}>
              <Icon name="trash" size={12} color={T.textSub}/> הסר
            </button>
          </Card>
        );
      })}
      {items.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>אין הוצאות מיוחדות</div>}
    </div>
  );
}

// ─── TAB: רשימת קניות ────────────────────────────────────────────────────────
function GroceryTab(){
  const [grocery,setGrocery]=useStorage("kp-grocery",DEFAULT_GROCERY);
  const [newItem,setNewItem]=useState("");
  const add=()=>{
    if(!newItem.trim())return;
    setGrocery([...grocery,{id:uid(),name:newItem,checked:false,price:""}]);
    setNewItem("");
  };
  const toggle=id=>setGrocery(grocery.map(g=>g.id===id?{...g,checked:!g.checked}:g));
  const remove=id=>setGrocery(grocery.filter(g=>g.id!==id));
  const total=grocery.filter(g=>!g.checked).reduce((s,g)=>s+(+g.price||0),0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1}}>פריטים שנותרו</div>
          <div style={{fontSize:28,fontWeight:300,fontFamily:T.display,color:T.text}}>{grocery.filter(g=>!g.checked).length} פריטים{total>0&&<span style={{fontSize:16,color:T.navy}}> · {fmt(total)}</span>}</div>
        </div>
        {grocery.some(g=>g.checked)&&<Btn variant="secondary" onClick={()=>setGrocery(grocery.filter(g=>!g.checked))} style={{padding:"7px 14px",fontSize:12}}>נקה שנרכשו</Btn>}
      </div>

      <div style={{display:"flex",gap:8}}>
        <Input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="הוסף פריט…" style={{flex:1}}/>
        <Btn onClick={add} style={{padding:"10px 16px",flexShrink:0}}><Icon name="plus" size={15} color="#fff"/></Btn>
      </div>

      <Card style={{border:`1.5px dashed ${T.border}`,background:T.bg,cursor:"pointer",padding:16,textAlign:"center"}} onClick={()=>{}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:T.textSub}}>
          <Icon name="basket" size={16} color={T.textSub}/>
          <span style={{fontSize:13,fontWeight:500}}>העלאת קבלה לחילוץ פריטים אוטומטי</span>
        </div>
        <div style={{fontSize:11,color:T.textSub,marginTop:4}}>תמיכה מלאה בקרוב</div>
      </Card>

      <Card>
        {grocery.filter(g=>!g.checked).map((g,i,arr)=>(
          <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
            <button onClick={()=>toggle(g.id)} style={{width:20,height:20,borderRadius:6,border:`1.5px solid ${T.borderHover}`,background:"transparent",cursor:"pointer",flexShrink:0}}/>
            <span style={{flex:1,fontSize:14,color:T.text,fontWeight:400}}>{g.name}</span>
            <input type="number" placeholder="₪" value={g.price||""} onChange={e=>setGrocery(grocery.map(x=>x.id===g.id?{...x,price:e.target.value}:x))}
              style={{width:60,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 8px",color:T.textMid,fontSize:12,outline:"none",fontFamily:T.font,textAlign:"center"}}/>
            <button onClick={()=>remove(g.id)} style={{background:"none",border:"none",color:T.border,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
          </div>
        ))}
        {grocery.filter(g=>g.checked).length>0&&(
          <>
            <div style={{fontSize:10,color:T.textSub,fontWeight:700,padding:"10px 0 6px",letterSpacing:1,textTransform:"uppercase"}}>נרכשו</div>
            {grocery.filter(g=>g.checked).map((g,i,arr)=>(
              <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none",opacity:.45}}>
                <button onClick={()=>toggle(g.id)} style={{width:20,height:20,borderRadius:6,border:`1.5px solid ${T.navy}`,background:T.navy,cursor:"pointer",flexShrink:0,color:"#fff",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</button>
                <span style={{flex:1,fontSize:13,color:T.textSub,textDecoration:"line-through"}}>{g.name}</span>
              </div>
            ))}
          </>
        )}
        {grocery.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:24,fontSize:13}}>הרשימה ריקה</div>}
      </Card>
    </div>
  );
}

// ─── TAB: מתכונים ותפריטים ───────────────────────────────────────────────────
function RecipesTab(){
  const [recipes,setRecipes]=useStorage("kp-recipes",DEFAULT_RECIPES);
  const [selected,setSelected]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",category:"ארוחות ערב",servings:"4",prepTime:"",cookTime:"",ingredients:[{item:"",qty:"",unit:""}],steps:[""],prepNotes:""});
  const RECIPE_CATS=["ארוחות בוקר","ארוחות ערב","ארוחות צהריים","קינוחים","תפריטים","אחר"];
  const addIngredient=()=>setForm(f=>({...f,ingredients:[...f.ingredients,{item:"",qty:"",unit:""}]}));
  const addStep=()=>setForm(f=>({...f,steps:[...f.steps,""]}));
  const saveRecipe=()=>{
    if(!form.name)return;
    setRecipes([...recipes,{...form,id:uid(),servings:+form.servings||4,prepTime:+form.prepTime||0,cookTime:+form.cookTime||0}]);
    setShowForm(false);
    setForm({name:"",category:"ארוחות ערב",servings:"4",prepTime:"",cookTime:"",ingredients:[{item:"",qty:"",unit:""}],steps:[""],prepNotes:""});
  };
  const selRecipe=recipes.find(r=>r.id===selected);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {!selected?(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:14,fontWeight:600,color:T.text}}>{recipes.length} מתכונים ותפריטים</div>
            <Btn onClick={()=>setShowForm(!showForm)} style={{padding:"7px 14px",fontSize:12}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוסף</span>
            </Btn>
          </div>

          {showForm&&(
            <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
              <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>מתכון / תפריט חדש</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Input placeholder="שם המתכון" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                <div style={{display:"flex",gap:8}}>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 8px",color:T.text,fontSize:13,fontFamily:T.font,outline:"none"}}>
                    {RECIPE_CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <Input type="number" placeholder="מנות" value={form.servings} onChange={e=>setForm({...form,servings:e.target.value})} style={{width:80}}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Input type="number" placeholder="זמן הכנה (דק׳)" value={form.prepTime} onChange={e=>setForm({...form,prepTime:e.target.value})} style={{flex:1}}/>
                  <Input type="number" placeholder="זמן בישול (דק׳)" value={form.cookTime} onChange={e=>setForm({...form,cookTime:e.target.value})} style={{flex:1}}/>
                </div>
                <div style={{fontSize:12,color:T.textMid,fontWeight:600,marginBottom:2}}>מצרכים</div>
                {form.ingredients.map((ing,i)=>(
                  <div key={i} style={{display:"flex",gap:6}}>
                    <Input placeholder="מצרך" value={ing.item} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,item:e.target.value}:x)}))} style={{flex:3}}/>
                    <Input placeholder="כמות" value={ing.qty} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,qty:e.target.value}:x)}))} style={{flex:1}}/>
                    <Input placeholder="יח׳" value={ing.unit} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,unit:e.target.value}:x)}))} style={{flex:1}}/>
                  </div>
                ))}
                <button onClick={addIngredient} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"8px",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>+ מצרך</button>
                <div style={{fontSize:12,color:T.textMid,fontWeight:600,marginBottom:2}}>שלבי הכנה</div>
                {form.steps.map((st,i)=>(
                  <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:T.navy,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,marginTop:10}}>{i+1}</div>
                    <textarea value={st} onChange={e=>setForm(f=>({...f,steps:f.steps.map((x,j)=>j===i?e.target.value:x)}))}
                      placeholder={`שלב ${i+1}…`} rows={2}
                      style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,resize:"vertical"}}/>
                  </div>
                ))}
                <button onClick={addStep} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"8px",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>+ שלב</button>
                <textarea value={form.prepNotes} onChange={e=>setForm({...form,prepNotes:e.target.value})}
                  placeholder="הכנות מקדימות, טיפים…" rows={2}
                  style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,resize:"vertical",width:"100%"}}/>
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={saveRecipe} style={{flex:1,padding:"11px"}}>שמור</Btn>
                  <Btn variant="secondary" onClick={()=>setShowForm(false)} style={{flex:1,padding:"11px"}}>ביטול</Btn>
                </div>
              </div>
            </Card>
          )}

          {recipes.map(r=>(
            <Card key={r.id} className="card-hover" style={{cursor:"pointer"}} onClick={()=>setSelected(r.id)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:4}}>{r.name}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:T.textSub,background:T.bg,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.border}`}}>{r.category}</span>
                    {r.servings&&<span style={{fontSize:11,color:T.textSub,background:T.bg,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.border}`}}>{r.servings} מנות</span>}
                    {(r.prepTime||r.cookTime)&&<span style={{fontSize:11,color:T.textSub,background:T.bg,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.border}`}}>{(r.prepTime||0)+(r.cookTime||0)} דק׳</span>}
                  </div>
                </div>
                <Icon name="chevron" size={16} color={T.textSub} style={{transform:"rotate(-90deg)"}}/>
              </div>
            </Card>
          ))}
          {recipes.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>אין מתכונים עדיין</div>}
        </>
      ):(
        selRecipe&&(
          <div style={{animation:"fadeUp .2s ease"}}>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:T.navy,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:14}}>
              → חזרה לרשימה
            </button>
            <Card>
              <div style={{fontSize:22,fontWeight:300,fontFamily:T.display,color:T.text,marginBottom:6}}>{selRecipe.name}</div>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:T.textSub,background:T.bg,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.border}`}}>{selRecipe.category}</span>
                {selRecipe.servings&&<span style={{fontSize:12,color:T.textSub,background:T.bg,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.border}`}}>{selRecipe.servings} מנות</span>}
                {selRecipe.prepTime>0&&<span style={{fontSize:12,color:T.textSub,background:T.bg,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.border}`}}>הכנה: {selRecipe.prepTime} דק׳</span>}
                {selRecipe.cookTime>0&&<span style={{fontSize:12,color:T.textSub,background:T.bg,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.border}`}}>בישול: {selRecipe.cookTime} דק׳</span>}
              </div>
              {selRecipe.ingredients?.length>0&&(
                <>
                  <div style={{fontSize:12,fontWeight:700,color:T.textMid,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>מצרכים</div>
                  {selRecipe.ingredients.map((ing,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:13,color:T.text}}>{ing.item}</span>
                      <span style={{fontSize:13,color:T.textSub}}>{ing.qty} {ing.unit}</span>
                    </div>
                  ))}
                </>
              )}
              {selRecipe.steps?.length>0&&(
                <div style={{marginTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.textMid,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>אופן הכנה</div>
                  {selRecipe.steps.map((st,i)=>(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
                      <div style={{width:24,height:24,borderRadius:"50%",background:T.navy,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</div>
                      <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{st}</div>
                    </div>
                  ))}
                </div>
              )}
              {selRecipe.prepNotes&&(
                <div style={{marginTop:14,background:T.navyLight,borderRadius:10,padding:14,border:`1px solid ${T.navyBorder}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.navyMid,marginBottom:4}}>הכנות מקדימות</div>
                  <div style={{fontSize:13,color:T.textMid,lineHeight:1.7}}>{selRecipe.prepNotes}</div>
                </div>
              )}
              <div style={{marginTop:16,display:"flex",gap:8}}>
                <Btn variant="danger" onClick={()=>{setRecipes(recipes.filter(r=>r.id!==selRecipe.id));setSelected(null);}} style={{padding:"8px 14px",fontSize:12}}>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><Icon name="trash" size={13} color={T.danger}/>מחק</span>
                </Btn>
              </div>
            </Card>
          </div>
        )
      )}
    </div>
  );
}

// ─── SECTION: דוחות ──────────────────────────────────────────────────────────
function ReportsSection({expenses,cats,month,year,setMonth,setYear}){
  const monthExp=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const totalSpent=monthExp.reduce((s,e)=>s+e.amount,0);
  const totalBudget=cats.reduce((s,c)=>s+c.budget,0);
  const catSpent=id=>monthExp.filter(e=>e.catId===id).reduce((s,e)=>s+e.amount,0);
  const trend=Array.from({length:6},(_,i)=>{
    const mi=(month-5+i+12)%12;
    const yi=mi>month?year-1:year;
    const v=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi;}).reduce((s,e)=>s+e.amount,0);
    return{label:MONTHS[mi].slice(0,3),v,current:mi===month};
  });
  const maxTrend=Math.max(...trend.map(t=>t.v),1);
  const overBudget=cats.filter(c=>catSpent(c.id)>c.budget);
  const insights=[];
  if(totalSpent>totalBudget)insights.push({type:"warn",text:`חרגת מהתקציב החודשי ב-${fmt(totalSpent-totalBudget)}`});
  if(overBudget.length>0)insights.push({type:"warn",text:`חריגה בקטגוריות: ${overBudget.map(c=>c.label).join(", ")}`});
  const biggestCat=cats.reduce((a,c)=>catSpent(c.id)>catSpent(a.id)?c:a,cats[0]);
  if(biggestCat)insights.push({type:"info",text:`הוצאה גדולה ביותר: ${biggestCat?.label} (${fmt(catSpent(biggestCat?.id))})`});
  if(totalSpent<totalBudget*.7)insights.push({type:"good",text:`חסכת ${fmt(totalBudget-totalSpent)} מהתקציב החודשי`});

  return(
    <div style={{padding:"0 0 100px"}}>
      <div style={{padding:"16px 16px 0"}}><PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/></div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {/* Insights */}
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <Icon name="insights" size={16} color={T.navy}/>
            <div style={{fontSize:14,fontWeight:600,color:T.text}}>תובנות חודשיות</div>
          </div>
          {insights.map((ins,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:8,
              background:ins.type==="warn"?T.dangerBg:ins.type==="good"?T.successBg:T.navyLight,
              border:`1px solid ${ins.type==="warn"?T.dangerBorder:ins.type==="good"?"#bbf7d0":T.navyBorder}`,
            }}>
              <span style={{fontSize:14}}>{ins.type==="warn"?"⚠️":ins.type==="good"?"✓":"→"}</span>
              <span style={{fontSize:13,color:T.text,lineHeight:1.5}}>{ins.text}</span>
            </div>
          ))}
          {insights.length===0&&<div style={{fontSize:13,color:T.textSub,textAlign:"center",padding:16}}>אין תובנות לחודש זה</div>}
        </Card>

        {/* Trend bar chart */}
        <Card>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:16}}>מגמת הוצאות — 6 חודשים</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:100}}>
            {trend.map((t,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <div style={{fontSize:10,color:t.current?T.navy:T.textSub,fontWeight:t.current?700:400}}>{t.v>0?fmt(t.v):""}</div>
                <div style={{width:"100%",background:T.bg,borderRadius:6,height:70,display:"flex",alignItems:"flex-end",overflow:"hidden",border:`1px solid ${T.border}`}}>
                  <div style={{width:"100%",height:`${(t.v/maxTrend)*100}%`,background:t.current?T.navy:"#c3d4e8",borderRadius:4,transition:"height .7s"}}/>
                </div>
                <span style={{fontSize:10,color:t.current?T.navy:T.textSub,fontWeight:t.current?700:400}}>{t.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Category breakdown */}
        <Card>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>פירוט לפי קטגוריה</div>
          {cats.map(c=>{
            const sp=catSpent(c.id);
            const pct=((sp/(totalSpent||1))*100).toFixed(0);
            return(
              <div key={c.id} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <CatIcon icon={c.icon} color={c.color} size={30}/>
                    <div>
                      <div style={{fontSize:13,color:T.text,fontWeight:500}}>{c.label}</div>
                      <div style={{fontSize:11,color:T.textSub}}>{pct}% מהכלל</div>
                    </div>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:14,fontWeight:600,color:sp>c.budget?T.danger:T.text}}>{fmt(sp)}</div>
                    <div style={{fontSize:10,color:T.textSub}}>מתוך {fmt(c.budget)}</div>
                  </div>
                </div>
                <ProgressBar value={sp} max={c.budget} color={c.color}/>
              </div>
            );
          })}
        </Card>

        {/* Monthly comparison */}
        <Card>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>השוואה לחודש הקודם</div>
          {(()=>{
            const prevM=(month-1+12)%12;
            const prevY=month===0?year-1:year;
            const prevExp=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===prevM&&d.getFullYear()===prevY;});
            const prevTotal=prevExp.reduce((s,e)=>s+e.amount,0);
            const diff=totalSpent-prevTotal;
            return(
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1,textAlign:"center",padding:14,background:T.bg,borderRadius:12}}>
                  <div style={{fontSize:11,color:T.textSub,marginBottom:4}}>{MONTHS[prevM]}</div>
                  <div style={{fontSize:20,fontWeight:600,fontFamily:T.display,color:T.text}}>{fmt(prevTotal)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",color:diff>0?T.danger:T.success,fontWeight:700,fontSize:13}}>
                  {diff>0?"▲":"▼"}
                </div>
                <div style={{flex:1,textAlign:"center",padding:14,background:T.navyLight,borderRadius:12,border:`1px solid ${T.navyBorder}`}}>
                  <div style={{fontSize:11,color:T.navy,marginBottom:4}}>{MONTHS[month]}</div>
                  <div style={{fontSize:20,fontWeight:600,fontFamily:T.display,color:T.navy}}>{fmt(totalSpent)}</div>
                </div>
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
}

// ─── SECTION: החופשות שלנו ────────────────────────────────────────────────────
function TripsSection({month,year,setMonth,setYear}){
  const [trips,setTrips]=useStorage("kp-trips",DEFAULT_TRIPS);
  const [selected,setSelected]=useState(null);
  const [showNewTrip,setShowNewTrip]=useState(false);
  const [showNewItem,setShowNewItem]=useState(false);
  const [tripForm,setTripForm]=useState({name:"",budget:"",dates:"",color:T.navy});
  const [itemForm,setItemForm]=useState({label:"",amount:"",currency:"ILS",rateUsed:""});

  const addTrip=()=>{
    if(!tripForm.name||!tripForm.budget)return;
    setTrips([...trips,{...tripForm,id:uid(),budget:+tripForm.budget,items:[]}]);
    setTripForm({name:"",budget:"",dates:"",color:T.navy});
    setShowNewTrip(false);
  };

  const selTrip=trips.find(t=>t.id===selected);
  const tripTotal=t=>t.items.reduce((s,item)=>{
    const rate=+item.rateUsed||1;
    return s+(item.currency==="ILS"?item.amount:item.amount*rate);
  },0);

  const addItem=()=>{
    if(!itemForm.label||!itemForm.amount)return;
    setTrips(trips.map(t=>t.id===selected?{...t,items:[...t.items,{...itemForm,id:uid(),amount:+itemForm.amount,rateUsed:+itemForm.rateUsed||1}]}:t));
    setItemForm({label:"",amount:"",currency:"ILS",rateUsed:""});
    setShowNewItem(false);
  };

  const TRIP_ITEMS_CATS=["טיסות","מלון","ביטוח","תחבורה מקומית","אוכל","בילויים","כרטיסים","אחר"];

  return(
    <div style={{padding:"0 0 100px"}}>
      <div style={{padding:"16px 16px 0"}}><PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/></div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {!selected?(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:14,fontWeight:600,color:T.text}}>{trips.length} חופשות מתוכננות</div>
              <Btn onClick={()=>setShowNewTrip(!showNewTrip)} style={{padding:"7px 14px",fontSize:12}}>
                <span style={{display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוסף חופשה</span>
              </Btn>
            </div>

            {showNewTrip&&(
              <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
                <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>חופשה חדשה</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <Input placeholder="שם החופשה" value={tripForm.name} onChange={e=>setTripForm({...tripForm,name:e.target.value})}/>
                  <Input placeholder="תאריכים (יוני 2026…)" value={tripForm.dates} onChange={e=>setTripForm({...tripForm,dates:e.target.value})}/>
                  <Input type="number" placeholder="תקציב כולל ₪" value={tripForm.budget} onChange={e=>setTripForm({...tripForm,budget:e.target.value})}/>
                  <div style={{display:"flex",gap:8}}>
                    <Btn onClick={addTrip} style={{flex:1,padding:"11px"}}>שמור</Btn>
                    <Btn variant="secondary" onClick={()=>setShowNewTrip(false)} style={{flex:1,padding:"11px"}}>ביטול</Btn>
                  </div>
                </div>
              </Card>
            )}

            {trips.map(trip=>{
              const total=tripTotal(trip);
              return(
                <Card key={trip.id} className="card-hover" style={{cursor:"pointer"}} onClick={()=>setSelected(trip.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:4}}>{trip.name}</div>
                      {trip.dates&&<div style={{fontSize:12,color:T.textSub}}>{trip.dates}</div>}
                    </div>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:18,fontWeight:600,fontFamily:T.display,color:T.text}}>{fmt(total)}</div>
                      <div style={{fontSize:11,color:T.textSub}}>מתוך {fmt(trip.budget)}</div>
                    </div>
                  </div>
                  <ProgressBar value={total} max={trip.budget} color={trip.color||T.navy}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                    <span style={{fontSize:11,fontWeight:600,color:total>trip.budget?T.danger:T.success}}>
                      {total>trip.budget?`חריגה ${fmt(total-trip.budget)}`:`נותר ${fmt(trip.budget-total)}`}
                    </span>
                    <span style={{fontSize:11,color:T.textSub}}>{trip.items.length} פריטים</span>
                  </div>
                </Card>
              );
            })}
            {trips.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>אין חופשות מתוכננות</div>}
          </>
        ):(
          selTrip&&(
            <div style={{animation:"fadeUp .2s ease"}}>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:T.navy,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:14}}>
                → חזרה לרשימה
              </button>
              <Card>
                <div style={{fontSize:22,fontWeight:300,fontFamily:T.display,color:T.text,marginBottom:4}}>{selTrip.name}</div>
                {selTrip.dates&&<div style={{fontSize:12,color:T.textSub,marginBottom:16}}>{selTrip.dates}</div>}
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div><div style={{fontSize:11,color:T.textSub}}>סה״כ</div><div style={{fontSize:22,fontWeight:600,fontFamily:T.display,color:T.text}}>{fmt(tripTotal(selTrip))}</div></div>
                  <div style={{textAlign:"left"}}><div style={{fontSize:11,color:T.textSub}}>תקציב</div><div style={{fontSize:22,fontWeight:600,fontFamily:T.display,color:T.navy}}>{fmt(selTrip.budget)}</div></div>
                </div>
                <ProgressBar value={tripTotal(selTrip)} max={selTrip.budget} color={selTrip.color||T.navy} height={6}/>
              </Card>

              {/* Items */}
              <div style={{marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>פירוט הוצאות</div>
                <Btn onClick={()=>setShowNewItem(!showNewItem)} style={{padding:"6px 12px",fontSize:12}}>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={12} color="#fff"/>הוסף</span>
                </Btn>
              </div>

              {showNewItem&&(
                <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight,marginBottom:10}}>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {TRIP_ITEMS_CATS.map(c=>(
                        <button key={c} onClick={()=>setItemForm({...itemForm,label:c})} style={{
                          padding:"5px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",
                          border:`1px solid ${itemForm.label===c?T.navy:T.border}`,
                          background:itemForm.label===c?T.navyLight:"transparent",
                          color:itemForm.label===c?T.navy:T.textMid,
                        }}>{c}</button>
                      ))}
                    </div>
                    <Input placeholder="תיאור מפורט (אופציונלי)" value={itemForm.label!==itemForm.label?itemForm.label:""} onChange={e=>setItemForm({...itemForm,label:e.target.value})}/>
                    <div style={{display:"flex",gap:8}}>
                      <Input type="number" placeholder="סכום" value={itemForm.amount} onChange={e=>setItemForm({...itemForm,amount:e.target.value})} style={{flex:2}}/>
                      <select value={itemForm.currency} onChange={e=>setItemForm({...itemForm,currency:e.target.value})} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 8px",color:T.text,fontSize:13,fontFamily:T.font,outline:"none"}}>
                        {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                      </select>
                    </div>
                    {itemForm.currency!=="ILS"&&(
                      <div style={{display:"flex",gap:8}}>
                        <Input type="number" placeholder="שער ביום התשלום" value={itemForm.rateUsed} onChange={e=>setItemForm({...itemForm,rateUsed:e.target.value})} style={{flex:1}}/>
                        <div style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:T.textSub,display:"flex",alignItems:"center"}}>
                          {itemForm.amount&&itemForm.rateUsed?`≈ ${fmt(+itemForm.amount * +itemForm.rateUsed)}`:"= ? ₪"}
                        </div>
                      </div>
                    )}
                    <div style={{display:"flex",gap:8}}>
                      <Btn onClick={addItem} style={{flex:1,padding:"10px"}}>הוסף</Btn>
                      <Btn variant="secondary" onClick={()=>setShowNewItem(false)} style={{flex:1,padding:"10px"}}>ביטול</Btn>
                    </div>
                  </div>
                </Card>
              )}

              {selTrip.items.map((item,i)=>{
                const cur=CURRENCIES.find(c=>c.code===item.currency)||CURRENCIES[0];
                const ilsVal=item.currency==="ILS"?item.amount:item.amount*(+item.rateUsed||1);
                return(
                  <Card key={item.id} style={{marginBottom:8,padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:T.text}}>{item.label}</div>
                        {item.currency!=="ILS"&&<div style={{fontSize:11,color:T.textSub}}>{fmtCur(item.amount,cur.symbol)} × {item.rateUsed}</div>}
                      </div>
                      <div style={{textAlign:"left"}}>
                        <div style={{fontSize:15,fontWeight:600,color:T.text}}>{fmt(ilsVal)}</div>
                        {item.currency!=="ILS"&&<div style={{fontSize:10,color:T.textSub}}>= {fmt(ilsVal)} ₪</div>}
                      </div>
                    </div>
                  </Card>
                );
              })}
              {selTrip.items.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:24,fontSize:13}}>אין פריטים — הוסף הוצאות לחופשה</div>}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── SECTION: ההשקעות שלנו ────────────────────────────────────────────────────
function InvestSection(){
  return(
    <div style={{padding:16}}>
      <Card style={{padding:40,textAlign:"center"}}>
        <Icon name="chart" size={32} color={T.navy}/>
        <div style={{fontSize:22,fontWeight:300,fontFamily:T.display,color:T.text,marginTop:16,marginBottom:8}}>ההשקעות שלנו</div>
        <div style={{fontSize:13,color:T.textSub,lineHeight:1.8,maxWidth:300,margin:"0 auto"}}>
          מעקב תיק מסחר, חדשות יומיות, ניתוח ביצועים וסוכן חכם לאיתור מגמות — בפיתוח.
        </div>
        <div style={{marginTop:20,display:"inline-block",background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"5px 16px",fontSize:12,color:T.navy,fontWeight:600}}>בקרוב</div>
      </Card>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const SECTIONS=[
  {id:"home",    label:"הבית שלנו",    icon:"home"},
  {id:"trips",   label:"החופשות שלנו", icon:"plane"},
  {id:"invest",  label:"ההשקעות שלנו", icon:"chart"},
  {id:"reports", label:"דוחות",        icon:"insights"},
];

const HOME_TABS=[
  {id:"expenses",label:"הוצאות שוטפות"},
  {id:"special", label:"הוצאות מיוחדות"},
  {id:"grocery", label:"רשימת קניות"},
  {id:"recipes", label:"מתכונים ותפריטים"},
];

export default function App(){
  const [cats,    setCats]    =useStorage("kp3-cats",    DEFAULT_CATS);
  const [expenses,setExpenses]=useStorage("kp3-expenses",SEED_EXPENSES);
  const [section, setSection] =useState("home");
  const [homeTab, setHomeTab] =useState("expenses");
  const [month,   setMonth]   =useState(new Date().getMonth());
  const [year,    setYear]    =useState(2026);

  return(
    <div style={{background:T.bg,minHeight:"100vh",width:"100%",fontFamily:T.font,direction:"rtl",color:T.text}}>
      <style>{globalCss}</style>

      {/* Header */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"14px 20px",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 0 rgba(0,0,0,.04)"}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              width:34,height:34,borderRadius:10,
              background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 2px 8px ${T.navy}33`,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="19" cy="6" r="3" fill="#f0c040" stroke="#fff" strokeWidth="1.2"/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:17,fontWeight:700,fontFamily:T.display,color:T.navy,letterSpacing:-.3,lineHeight:1}}>SinPlace</div>
              <div style={{fontSize:9,color:T.textSub,letterSpacing:1.5,textTransform:"uppercase",marginTop:1}}>אדיר & ספיר</div>
            </div>
          </div>
          <div style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"5px 12px",fontSize:11,color:T.navy,fontWeight:600}}>
            {MONTHS[month]} {year}
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,overflowX:"auto",scrollbarWidth:"none"}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"flex",padding:"0 16px"}}>
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} style={{
              padding:"13px 16px",border:"none",background:"transparent",
              color:section===s.id?T.navy:T.textSub,
              fontFamily:T.font,fontSize:13,fontWeight:section===s.id?700:500,
              cursor:"pointer",whiteSpace:"nowrap",
              borderBottom:section===s.id?`2px solid ${T.navy}`:"2px solid transparent",
              marginBottom:-1,transition:"all .15s",
              display:"flex",alignItems:"center",gap:6,
            }}>
              <Icon name={s.icon} size={14} color={section===s.id?T.navy:T.textSub}/>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Home sub-tabs */}
      {section==="home"&&(
        <div style={{background:T.bg,borderBottom:`1px solid ${T.border}`,overflowX:"auto",scrollbarWidth:"none"}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",padding:"0 16px",gap:0}}>
            {HOME_TABS.map(t=>(
              <button key={t.id} onClick={()=>setHomeTab(t.id)} className="tab-btn" style={{
                padding:"10px 16px",border:"none",
                background:homeTab===t.id?T.surface:"transparent",
                color:homeTab===t.id?T.navy:T.textSub,
                fontFamily:T.font,fontSize:12,fontWeight:homeTab===t.id?700:500,
                cursor:"pointer",whiteSpace:"nowrap",
                borderBottom:homeTab===t.id?`2px solid ${T.navy}`:"2px solid transparent",
                marginBottom:-1,transition:"all .15s",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Period picker for home */}
      {section==="home"&&(
        <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"10px 16px"}}>
          <div style={{maxWidth:680,margin:"0 auto"}}>
            <PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"16px 16px 0"}}>
        {section==="home"&&homeTab==="expenses" &&<ExpensesTab expenses={expenses} setExpenses={setExpenses} cats={cats} month={month} year={year}/>}
        {section==="home"&&homeTab==="special"  &&<SpecialTab/>}
        {section==="home"&&homeTab==="grocery"  &&<GroceryTab/>}
        {section==="home"&&homeTab==="recipes"  &&<RecipesTab/>}
        {section==="trips"  &&<TripsSection month={month} year={year} setMonth={setMonth} setYear={setYear}/>}
        {section==="invest" &&<InvestSection/>}
        {section==="reports"&&<ReportsSection expenses={expenses} cats={cats} month={month} year={year} setMonth={setMonth} setYear={setYear}/>}
      </div>

      {/* Mobile bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.surface,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 22px",zIndex:50}}>
        <style>{`@media(min-width:681px){.mob-nav{display:none!important}}`}</style>
        <div className="mob-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:T.surface,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 22px",zIndex:50}}>
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              background:"transparent",border:"none",cursor:"pointer",
              color:section===s.id?T.navy:T.textSub,minWidth:60,transition:"color .15s",
            }}>
              <Icon name={s.icon} size={20} color={section===s.id?T.navy:T.textSub}/>
              <span style={{fontSize:9,fontFamily:T.font,fontWeight:section===s.id?700:400}}>{s.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
