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
  font:"'DM Sans', system-ui", display:"'DM Serif Display', serif",
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
  {id:"r1",type:"recipe",name:"פסטה ברוטב עגבניות",category:"ארוחות ערב",servings:4,prepTime:15,cookTime:25,
   ingredients:[{item:"פסטה",qty:"400",unit:"גרם"}],steps:["לבשל פסטה.","לטגן שום.","להוסיף עגבניות."],prepNotes:"",concepts:[]},
  {id:"r2",type:"menu",name:"ארוחת שישי משפחתית",category:"ארוחות ערב",servings:8,concepts:["ישראלי","משפחתי"],
   dishes:["סלט ירקות","חומוס","שניצל","עוגת שוקולד"],notes:""},
];
const DEFAULT_NOTES = [
  {id:"n1",text:"לזכור לקנות מתנה לאמא השבוע",who:"א",date:"2026-03-05T10:30"},
  {id:"n2",text:"שרברב מגיע ביום שלישי בין 10-12",who:"ס",date:"2026-03-04T19:15"},
];
const DEFAULT_MENU_CONCEPTS = ["אסייתי","ים תיכוני","איטלקי","מקסיקני","ישראלי","וגאן","צמחוני","בשרי","דגים","מהיר","חגיגי","משפחתי","רומנטי"];
const RCATS = ["ארוחות בוקר","ארוחות ערב","ארוחות צהריים","קינוחים","טאפסים","אחר"];
const TCAT  = ["טיסות","מלון","ביטוח","תחבורה מקומית","אוכל","בילויים","כרטיסים","אחר"];

const CORRECT_PIN = "123456";

const fmt    = n   => "₪" + Math.round(n).toLocaleString("he-IL");
const fmtCur = (n,sym) => sym + Number(n).toLocaleString();
const today  = ()  => new Date().toISOString().slice(0,10);
const uid    = ()  => Date.now() + Math.floor(Math.random()*9999);
const fmtDt  = dt  => { const d=new Date(dt); return d.toLocaleDateString("he-IL")+" "+d.toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}); };
const toILS  = item => item.currency==="ILS" ? +item.amount : (+item.amount)*(+item.rateUsed||1);

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
`;

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────
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
        <div style={{display:"flex",gap:10}}><Btn variant="danger" onClick={onConfirm} style={{flex:1,padding:"11px"}}>מחק</Btn><Btn variant="secondary" onClick={onCancel} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
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

// ─── ADD/EDIT EXPENSE DRAWER ──────────────────────────────────────────────────
function AddExpenseDrawer({cats,onAdd,onClose,initData=null}){
  const [step,setStep]=useState(initData?1:0);
  const [form,setForm]=useState(initData||{amount:"",desc:"",catId:cats[0]?.id||"",who:"א",date:today()});
  const np=[["7","8","9"],["4","5","6"],["1","2","3"],["⌫","0","✓"]];
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

// ─── PIN SCREEN ───────────────────────────────────────────────────────────────
function PinScreen({onUnlock}){
  const [pin,setPin]=useState("");
  const [showPin,setShowPin]=useState(false);
  const [shaking,setShaking]=useState(false);
  const [attempts,setAttempts]=useState(0);
  const [locked,setLocked]=useState(false);
  const np=[["7","8","9"],["4","5","6"],["1","2","3"],["⌫","0","✓"]];

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
      {/* לוגו — זהה ל-header הפנימי */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:44,animation:"pinPop .5s ease"}}>
        <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,.15)"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="19" cy="6" r="3" fill="#f0c040" stroke="#fff" strokeWidth="1.2"/></svg>
        </div>
        <div style={{fontSize:26,fontWeight:700,color:"#fff",fontFamily:T.display,letterSpacing:-.5}}>Sinario</div>
      </div>
      {/* כרטיס */}
      <div style={{background:"rgba(255,255,255,.06)",backdropFilter:"blur(24px)",border:"1px solid rgba(255,255,255,.1)",borderRadius:28,padding:"32px 28px 36px",width:"100%",maxWidth:320,boxShadow:"0 40px 80px rgba(0,0,0,.5)",animation:"pinPop .5s ease .08s both"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:44,height:44,borderRadius:13,background:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Icon name="lock" size={20} color="rgba(255,255,255,.75)"/></div>
          <div style={{fontSize:16,fontWeight:600,color:"#fff",letterSpacing:-.2}}>{locked?"חשבון נעול זמנית":"יש להזין קוד PIN"}</div>
        </div>
        {/* שדה תצוגה + כפתור עין */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:28,animation:shaking?"shake .45s ease":"none"}}>
          <div style={{flex:1,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,padding:"10px 14px",textAlign:"center",letterSpacing:6,fontSize:20,color:"#fff",fontFamily:"monospace",minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {pin.length===0?<span style={{color:"rgba(255,255,255,.25)",fontSize:13,letterSpacing:0}}>הזן קוד…</span>:showPin?pin:"•".repeat(pin.length)}
          </div>
          <button onClick={()=>setShowPin(v=>!v)} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"10px",cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0}}>
            <Icon name={showPin?"eyeOff":"eye"} size={18} color="rgba(255,255,255,.6)"/>
          </button>
        </div>
        {/* לוח מקשים */}
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

// ─── TAB: הוצאות שוטפות ──────────────────────────────────────────────────────
function ExpensesTab({expenses,setExpenses,cats,monthSpecialTotal=0}){
  const [showAdd,setShowAdd]=useState(false);
  const [editExp,setEditExp]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  const totalBudget=cats.reduce((s,c)=>s+c.budget,0);
  const regularTotal=expenses.reduce((s,e)=>s+e.amount,0);
  const combinedTotal=regularTotal+monthSpecialTotal;
  const catSpent=id=>expenses.filter(e=>e.catId===id).reduce((s,e)=>s+e.amount,0);
  const adir=expenses.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0);
  const sapir=expenses.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0);
  const diff=Math.abs(adir-sapir)/2;
  const from=adir>sapir?"ספיר":"אדיר";
  const doDelete=id=>{setExpenses(expenses.filter(e=>e.id!==id));setConfirmId(null);};
  const doEdit=u=>setExpenses(expenses.map(e=>e.id===u.id?{...u,amount:+u.amount}:e));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {confirmId&&<ConfirmModal message="למחוק הוצאה זו?" onConfirm={()=>doDelete(confirmId)} onCancel={()=>setConfirmId(null)}/>}
      {editExp&&<AddExpenseDrawer cats={cats} initData={editExp} onAdd={doEdit} onClose={()=>setEditExp(null)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:14,fontWeight:600,color:T.text}}>הוצאות שוטפות</div>
        <Btn onClick={()=>setShowAdd(true)} style={{padding:"8px 16px",fontSize:13,display:"flex",alignItems:"center",gap:5}}><Icon name="plus" size={14} color="#fff"/>הוספת הוצאה</Btn>
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>סה״כ הוצאות</div>
            <div style={{fontSize:34,fontWeight:400,color:T.text,fontFamily:T.display,letterSpacing:-1}}>{fmt(combinedTotal)}</div>
            <div style={{fontSize:12,color:T.textSub,marginTop:4}}>מתוך {fmt(totalBudget)} תקציב</div>
            {monthSpecialTotal>0&&<div style={{fontSize:11,color:T.navyMid,marginTop:3}}>כולל {fmt(monthSpecialTotal)} הוצאות מיוחדות</div>}
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
      {/* פאי שמאל, קטגוריות ימין — RTL: קטגוריות מופיעות ראשון בDOM */}
      <Card style={{padding:16}}>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <div style={{flex:1,minWidth:0}}>
            {cats.map(c=>{const sp=catSpent(c.id);return(
              <div key={c.id} style={{marginBottom:11}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                    <CatIcon icon={c.icon} color={c.color} size={28}/>
                    <span style={{fontSize:12,color:T.textMid,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.label}</span>
                  </div>
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
        <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>הוצאות אחרונות</div>
        {expenses.slice(0,8).map((ex,i)=>{const cat=cats.find(c=>c.id===ex.catId);return(
          <div key={ex.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<Math.min(expenses.length,8)-1?`1px solid ${T.border}`:"none"}}>
            <CatIcon icon={cat?.icon||"basket"} color={cat?.color||T.navy}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,color:T.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.desc||"הוצאה"}</div>
              <div style={{fontSize:11,color:T.textSub}}>{cat?.label} · {ex.who==="א"?"אדיר":"ספיר"} · {new Date(ex.date).toLocaleDateString("he-IL")}</div>
            </div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,flexShrink:0}}>{fmt(ex.amount)}</div>
            <ActionBtns onEdit={()=>setEditExp({...ex,amount:String(ex.amount)})} onDelete={()=>setConfirmId(ex.id)}/>
          </div>
        );})}
        {expenses.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:24,fontSize:13}}>אין הוצאות עדיין</div>}
      </Card>
      {showAdd&&<AddExpenseDrawer cats={cats} onAdd={e=>setExpenses([e,...expenses])} onClose={()=>setShowAdd(false)}/>}
    </div>
  );
}

// ─── TAB: הוצאות מיוחדות ─────────────────────────────────────────────────────
function SpecialTab({month,year,specialCatsList}){
  const [items,setItems]=useStorage("kp-special",DEFAULT_SPECIAL);
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  const [showAll,setShowAll]=useState(false);
  const blank={desc:"",catId:"home",amount:"",currency:"ILS",rateUsed:"1",date:today()};
  const [form,setForm]=useState(blank);
  const periodItems=showAll?[...items].sort((a,b)=>new Date(b.date)-new Date(a.date)):items.filter(i=>{const d=new Date(i.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const total=periodItems.reduce((s,i)=>s+toILS(i),0);
  const openAdd=()=>{setEditId(null);setForm(blank);setShowForm(true);};
  const openEdit=item=>{setEditId(item.id);setForm({...item,amount:String(item.amount),rateUsed:String(item.rateUsed||1)});setShowForm(true);};
  const save=()=>{
    if(!form.desc||!form.amount)return;
    if(editId)setItems(items.map(x=>x.id===editId?{...form,id:editId,amount:+form.amount,rateUsed:+form.rateUsed||1}:x));
    else setItems([...items,{...form,id:uid(),amount:+form.amount,rateUsed:+form.rateUsed||1}]);
    setForm(blank);setShowForm(false);setEditId(null);
  };
  const doDelete=id=>{setItems(items.filter(x=>x.id!==id));setConfirmId(null);};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {confirmId&&<ConfirmModal message="למחוק הוצאה מיוחדת זו?" onConfirm={()=>doDelete(confirmId)} onCancel={()=>setConfirmId(null)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1}}>{showAll?"סה״כ הכל":"סה״כ בתקופה"}</div>
          <div style={{fontSize:28,fontWeight:400,fontFamily:T.display,color:T.text}}>{fmt(total)}</div>
          <button onClick={()=>setShowAll(v=>!v)} style={{marginTop:6,fontSize:11,color:showAll?T.navy:T.textSub,fontFamily:T.font,background:showAll?T.navyLight:"transparent",border:`1px solid ${showAll?T.navyBorder:T.border}`,borderRadius:99,padding:"4px 12px",cursor:"pointer",fontWeight:600}}>{showAll?"חזרה לתקופה":"צפייה בהכל"}</button>
        </div>
        <Btn onClick={openAdd} style={{padding:"8px 16px",display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn>
      </div>
      {showForm&&(
        <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
          <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>{editId?"עריכת הוצאה":"הוצאה מיוחדת חדשה"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Inp placeholder="תיאור" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{specialCatsList.map(c=><button key={c.id} onClick={()=>setForm({...form,catId:c.id})} style={{padding:"6px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${form.catId===c.id?T.navy:T.border}`,background:form.catId===c.id?T.navyLight:"transparent",color:form.catId===c.id?T.navy:T.textMid}}>{c.label}</button>)}</div>
            <CurrencyField currency={form.currency} setCurrency={c=>setForm({...form,currency:c})} rate={form.rateUsed} setRate={r=>setForm({...form,rateUsed:r})} amount={form.amount}/>
            <Inp type="number" placeholder="סכום" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
            <Inp type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
            <div style={{display:"flex",gap:8}}><Btn onClick={save} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowForm(false);setEditId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
          </div>
        </Card>
      )}
      {periodItems.map(item=>{const cat=specialCatsList.find(c=>c.id===item.catId);const cur=CURRENCIES.find(c=>c.code===item.currency)||CURRENCIES[0];return(
        <Card key={item.id} style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:3}}>{item.desc}</div>
              <div style={{fontSize:11,color:T.textSub,marginBottom:4}}>{cat?.label} · {new Date(item.date).toLocaleDateString("he-IL")}</div>
              {item.currency!=="ILS"&&<div style={{fontSize:12,color:T.textSub}}>{fmtCur(item.amount,cur.symbol)} × שער {item.rateUsed}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
              <div style={{fontSize:18,fontWeight:600,color:T.text,fontFamily:T.display}}>{fmt(toILS(item))}</div>
              <ActionBtns onEdit={()=>openEdit(item)} onDelete={()=>setConfirmId(item.id)}/>
            </div>
          </div>
        </Card>
      );})}
      {periodItems.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>{showAll?"אין הוצאות מיוחדות":`אין הוצאות מיוחדות ב${MONTHS[month]} ${year}`}</div>}
    </div>
  );
}

// ─── TAB: רשימת קניות ────────────────────────────────────────────────────────
function GroceryTab(){
  const [grocery,setGrocery]=useStorage("kp-grocery",DEFAULT_GROCERY);
  const [newItem,setNewItem]=useState({name:"",qty:"1",price:""});
  const [scanMsg,setScanMsg]=useState("");
  const fileRef=useRef();
  const add=()=>{if(!newItem.name.trim())return;setGrocery([...grocery,{id:uid(),...newItem,checked:false,price:+newItem.price||""}]);setNewItem({name:"",qty:"1",price:""});};
  const toggle=id=>setGrocery(grocery.map(g=>g.id===id?{...g,checked:!g.checked}:g));
  const remove=id=>setGrocery(grocery.filter(g=>g.id!==id));
  const total=grocery.filter(g=>!g.checked).reduce((s,g)=>s+(+g.price||0)*(+g.qty||1),0);
  const active=grocery.filter(g=>!g.checked);
  const done=grocery.filter(g=>g.checked);
  const COL_QTY=52,COL_PRICE=90;

  const handleReceiptUpload=async e=>{
    const file=e.target.files?.[0];if(!file)return;
    setScanMsg("מנתח קבלה…");
    const b64=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.readAsDataURL(file);});
    try{
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:[
          {type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}},
          {type:"text",text:`חלץ רשימת פריטים מהקבלה. החזר JSON בלבד:\n{"items":[{"name":"שם בעברית","qty":"1","price":0}]}`}
        ]}]})});
      const data=await resp.json();
      const text=data.content?.map(b=>b.text||"").join("");
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      const newItems=(parsed.items||[]).filter(i=>i.name).map(i=>({id:uid(),name:i.name,qty:String(i.qty||1),price:+i.price||"",checked:false}));
      if(newItems.length){setGrocery(g=>[...g,...newItems]);setScanMsg(`✓ נוספו ${newItems.length} פריטים`);}
      else setScanMsg("לא זוהו פריטים");
    }catch{setScanMsg("שגיאה — נסה שוב");}
    setTimeout(()=>setScanMsg(""),3000);e.target.value="";
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1}}>פריטים שנותרו</div>
          <div style={{fontSize:26,fontWeight:300,fontFamily:T.display,color:T.text}}>{active.length} פריטים{total>0&&<span style={{fontSize:16,color:T.navy}}> · {fmt(total)}</span>}</div>
        </div>
        {done.length>0&&<Btn variant="secondary" onClick={()=>setGrocery(active)} style={{padding:"7px 14px",fontSize:12}}>נקה שנרכשו</Btn>}
      </div>
      <Card style={{padding:12}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <Inp placeholder="שם פריט" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&add()} style={{flex:1}}/>
          <input type="number" placeholder="כמות" value={newItem.qty} onChange={e=>setNewItem({...newItem,qty:e.target.value})} style={{width:COL_QTY,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 4px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,textAlign:"center"}}/>
          <div style={{width:COL_PRICE,display:"flex",alignItems:"center",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
            <span style={{padding:"10px 6px",fontSize:12,color:T.textSub,background:"#eeebe4",borderLeft:`1px solid ${T.border}`,flexShrink:0,lineHeight:1}}>₪</span>
            <input type="number" placeholder="מחיר" value={newItem.price} onChange={e=>setNewItem({...newItem,price:e.target.value})} style={{flex:1,minWidth:0,background:"transparent",border:"none",padding:"10px 4px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,textAlign:"center"}}/>
          </div>
          <Btn onClick={add} style={{padding:"10px 12px",flexShrink:0}}><Icon name="plus" size={14} color="#fff"/></Btn>
        </div>
      </Card>
      {/* העלאת קבלה */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleReceiptUpload} style={{display:"none"}}/>
      <Card style={{border:`1.5px dashed ${T.border}`,background:T.bg,padding:14,cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <Icon name="photo" size={16} color={T.textSub}/>
          <span style={{fontSize:13,fontWeight:500,color:T.textSub}}>{scanMsg||"העלאת קבלה לחילוץ פריטים אוטומטי"}</span>
          {scanMsg&&scanMsg.startsWith("מנתח")&&<div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${T.navy}`,borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>}
        </div>
        {!scanMsg&&<div style={{fontSize:11,color:T.textSub,marginTop:3,textAlign:"center"}}>מופעל על ידי Claude AI</div>}
      </Card>
      {/* טבלה */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",padding:"9px 14px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
          <div style={{width:24,flexShrink:0}}/>
          <div style={{flex:1,fontSize:10,color:T.textSub,fontWeight:700,letterSpacing:.5,textAlign:"right",paddingRight:10}}>פריט</div>
          <div style={{width:1,height:14,background:T.border,marginLeft:8,flexShrink:0}}/>
          <div style={{width:COL_QTY+4,fontSize:10,color:T.textSub,fontWeight:700,textAlign:"center",flexShrink:0}}>כמות</div>
          <div style={{width:COL_PRICE+12,fontSize:10,color:T.textSub,fontWeight:700,textAlign:"center",flexShrink:0}}>מחיר ממוצע</div>
          <div style={{width:22,flexShrink:0}}/>
        </div>
        {active.map((g,i)=>(
          <div key={g.id} style={{display:"flex",alignItems:"center",padding:"9px 14px",borderBottom:i<active.length-1||done.length>0?`1px solid ${T.border}`:"none"}}>
            <button onClick={()=>toggle(g.id)} style={{width:20,height:20,borderRadius:6,border:`1.5px solid ${T.borderHover}`,background:"transparent",cursor:"pointer",flexShrink:0}}/>
            <div style={{flex:1,fontSize:13,color:T.text,fontWeight:500,textAlign:"right",paddingRight:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name}</div>
            <div style={{width:1,alignSelf:"stretch",background:T.border,marginLeft:8,flexShrink:0}}/>
            <input type="number" value={g.qty||""} onChange={e=>setGrocery(grocery.map(x=>x.id===g.id?{...x,qty:e.target.value}:x))} style={{width:COL_QTY+4,background:"transparent",border:"none",padding:"4px",color:T.textMid,fontSize:12,outline:"none",fontFamily:T.font,textAlign:"center",flexShrink:0}}/>
            {/* מחיר ללא ריבוע — ₪ + מספר בלבד */}
            <div style={{width:COL_PRICE+12,display:"flex",alignItems:"center",gap:3,justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:11,color:T.textSub,flexShrink:0}}>₪</span>
              <input type="number" value={g.price||""} onChange={e=>setGrocery(grocery.map(x=>x.id===g.id?{...x,price:+e.target.value}:x))} style={{width:54,background:"transparent",border:"none",borderBottom:`1px solid ${T.border}`,padding:"4px 2px",color:T.textMid,fontSize:12,outline:"none",fontFamily:T.font,textAlign:"center"}}/>
            </div>
            <button onClick={()=>remove(g.id)} style={{background:"none",border:"none",color:T.border,cursor:"pointer",fontSize:17,lineHeight:1,width:22,textAlign:"center",flexShrink:0}}>×</button>
          </div>
        ))}
        {done.length>0&&(<>
          <div style={{padding:"8px 14px 4px",fontSize:10,color:T.textSub,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:T.bg}}>נרכשו</div>
          {done.map((g,i)=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",padding:"8px 14px",opacity:.4,borderBottom:i<done.length-1?`1px solid ${T.border}`:"none"}}>
              <button onClick={()=>toggle(g.id)} style={{width:20,height:20,borderRadius:6,border:`1.5px solid ${T.navy}`,background:T.navy,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:10}}>✓</span></button>
              <div style={{flex:1,fontSize:13,color:T.textSub,textDecoration:"line-through",textAlign:"right",paddingRight:10}}>{g.name}</div>
              <div style={{width:1,alignSelf:"stretch",background:T.border,marginLeft:8,flexShrink:0}}/>
              <span style={{width:COL_QTY+4,fontSize:12,color:T.textSub,textAlign:"center",flexShrink:0}}>{g.qty}</span>
              <div style={{width:COL_PRICE+12,display:"flex",alignItems:"center",gap:3,justifyContent:"center",flexShrink:0}}>
                {g.price?<><span style={{fontSize:11,color:T.textSub}}>₪</span><span style={{fontSize:12,color:T.textSub}}>{g.price}</span></>:null}
              </div>
              <div style={{width:22,flexShrink:0}}/>
            </div>
          ))}
        </>)}
        {grocery.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:24,fontSize:13}}>הרשימה ריקה</div>}
      </Card>
    </div>
  );
}

// ─── TAB: מתכונים ────────────────────────────────────────────────────────────
function RecipesTab({menuConceptsList}){
  const [items,setItems]=useStorage("kp-recipes",DEFAULT_RECIPES);
  const [mode,setMode]=useState("recipe");
  const [filterCat,setFilterCat]=useState("הכל");
  const [filterConcept,setFilterConcept]=useState("הכל");
  const [selected,setSelected]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [confirmId,setConfirmId]=useState(null);
  const blankR={type:"recipe",name:"",category:"ארוחות ערב",servings:"4",prepTime:"",cookTime:"",ingredients:[{item:"",qty:"",unit:""}],steps:[""],prepNotes:"",concepts:[]};
  const blankM={type:"menu",name:"",category:"ארוחות ערב",servings:"",concepts:[],dishes:[""],notes:""};
  const [form,setForm]=useState(blankR);
  const openAdd=()=>{setEditId(null);setForm(mode==="recipe"?blankR:blankM);setShowForm(true);};
  const openEdit=item=>{setEditId(item.id);setForm({...item,servings:String(item.servings||""),prepTime:String(item.prepTime||""),cookTime:String(item.cookTime||"")});setShowForm(true);setSelected(null);};
  const save=()=>{if(!form.name)return;if(editId)setItems(items.map(x=>x.id===editId?{...form,id:editId,servings:+form.servings||0}:x));else setItems([...items,{...form,id:uid(),servings:+form.servings||0}]);setShowForm(false);setEditId(null);};
  const doDelete=id=>{setItems(items.filter(x=>x.id!==id));setConfirmId(null);if(selected===id)setSelected(null);};
  const toggleC=c=>setForm(f=>({...f,concepts:f.concepts.includes(c)?f.concepts.filter(x=>x!==c):[...f.concepts,c]}));
  const filtered=items.filter(r=>r.type===mode&&(filterCat==="הכל"||r.category===filterCat)&&(filterConcept==="הכל"||(r.concepts||[]).includes(filterConcept)));
  const sel=items.find(r=>r.id===selected);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {confirmId&&<ConfirmModal message="למחוק לצמיתות?" onConfirm={()=>doDelete(confirmId)} onCancel={()=>setConfirmId(null)}/>}
      {!selected?(
        <>
          <div style={{display:"flex",background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:3,gap:3}}>
            {[["recipe","מתכונים"],["menu","תפריטים"]].map(([v,l])=><button key={v} onClick={()=>{setMode(v);setFilterCat("הכל");setFilterConcept("הכל");setShowForm(false);}} style={{flex:1,padding:"8px",borderRadius:9,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",border:"none",background:mode===v?T.surface:"transparent",color:mode===v?T.navy:T.textSub,boxShadow:mode===v?"0 1px 4px rgba(0,0,0,.08)":"none"}}>{l}</button>)}
          </div>
          <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none"}}>{["הכל",...RCATS].map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{flexShrink:0,padding:"5px 12px",borderRadius:99,fontFamily:T.font,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${filterCat===c?T.navy:T.border}`,background:filterCat===c?T.navy:"transparent",color:filterCat===c?"#fff":T.textSub}}>{c}</button>)}</div>
          {mode==="menu"&&<div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none"}}>{["הכל",...menuConceptsList].map(c=><button key={c} onClick={()=>setFilterConcept(c)} style={{flexShrink:0,padding:"5px 12px",borderRadius:99,fontFamily:T.font,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${filterConcept===c?T.navyMid:T.border}`,background:filterConcept===c?T.navyMid:"transparent",color:filterConcept===c?"#fff":T.textSub}}>{c}</button>)}</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,color:T.textSub}}>{filtered.length} {mode==="recipe"?"מתכונים":"תפריטים"}</div>
            <Btn onClick={openAdd} style={{padding:"7px 14px",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={13} color="#fff"/>הוספה</Btn>
          </div>
          {showForm&&(
            <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
              <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:12}}>{editId?(mode==="recipe"?"עריכת מתכון":"עריכת תפריט"):(mode==="recipe"?"מתכון חדש":"תפריט חדש")}</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <Inp placeholder="שם" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                <div style={{display:"flex",gap:8}}><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 8px",color:T.text,fontSize:13,fontFamily:T.font,outline:"none"}}>{RCATS.map(c=><option key={c}>{c}</option>)}</select><Inp type="number" placeholder="אנשים" value={form.servings} onChange={e=>setForm({...form,servings:e.target.value})} style={{width:90}}/></div>
                <div style={{fontSize:12,color:T.textMid,fontWeight:600}}>קונספט</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{menuConceptsList.map(c=><button key={c} onClick={()=>toggleC(c)} style={{padding:"5px 11px",borderRadius:99,fontFamily:T.font,fontSize:11,cursor:"pointer",border:`1px solid ${(form.concepts||[]).includes(c)?T.navyMid:T.border}`,background:(form.concepts||[]).includes(c)?T.navyMid:"transparent",color:(form.concepts||[]).includes(c)?"#fff":T.textMid}}>{c}</button>)}</div>
                {mode==="recipe"&&(<>
                  <div style={{display:"flex",gap:8}}><Inp type="number" placeholder="הכנה (דק׳)" value={form.prepTime} onChange={e=>setForm({...form,prepTime:e.target.value})} style={{flex:1}}/><Inp type="number" placeholder="בישול (דק׳)" value={form.cookTime} onChange={e=>setForm({...form,cookTime:e.target.value})} style={{flex:1}}/></div>
                  <div style={{fontSize:12,color:T.textMid,fontWeight:600}}>מצרכים</div>
                  {form.ingredients.map((ing,i)=><div key={i} style={{display:"flex",gap:6}}><Inp placeholder="מצרך" value={ing.item} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,item:e.target.value}:x)}))} style={{flex:3}}/><Inp placeholder="כמות" value={ing.qty} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,qty:e.target.value}:x)}))} style={{flex:1}}/><Inp placeholder="יח׳" value={ing.unit} onChange={e=>setForm(f=>({...f,ingredients:f.ingredients.map((x,j)=>j===i?{...x,unit:e.target.value}:x)}))} style={{flex:1}}/></div>)}
                  <button onClick={()=>setForm(f=>({...f,ingredients:[...f.ingredients,{item:"",qty:"",unit:""}]}))} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"8px",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>+ מצרך</button>
                  <div style={{fontSize:12,color:T.textMid,fontWeight:600}}>שלבי הכנה</div>
                  {form.steps.map((st,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"flex-start"}}><div style={{width:22,height:22,borderRadius:"50%",background:T.navy,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,marginTop:10}}>{i+1}</div><textarea value={st} onChange={e=>setForm(f=>({...f,steps:f.steps.map((x,j)=>j===i?e.target.value:x)}))} rows={2} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,resize:"vertical"}}/></div>)}
                  <button onClick={()=>setForm(f=>({...f,steps:[...f.steps,""]}))} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"8px",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>+ שלב</button>
                  <textarea value={form.prepNotes||""} onChange={e=>setForm({...form,prepNotes:e.target.value})} placeholder="הכנות מקדימות…" rows={2} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,resize:"none",width:"100%"}}/>
                </>)}
                {mode==="menu"&&(<>
                  <div style={{fontSize:12,color:T.textMid,fontWeight:600}}>מנות</div>
                  {(form.dishes||[""]).map((d,i)=><div key={i} style={{display:"flex",gap:6}}><Inp placeholder={`מנה ${i+1}`} value={d} onChange={e=>setForm(f=>({...f,dishes:f.dishes.map((x,j)=>j===i?e.target.value:x)}))} style={{flex:1}}/>{form.dishes.length>1&&<button onClick={()=>setForm(f=>({...f,dishes:f.dishes.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:18}}>×</button>}</div>)}
                  <button onClick={()=>setForm(f=>({...f,dishes:[...(f.dishes||[]),""]}))} style={{background:"none",border:`1px dashed ${T.border}`,borderRadius:10,padding:"8px",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>+ מנה</button>
                  <textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="הערות…" rows={2} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,outline:"none",fontFamily:T.font,resize:"none",width:"100%"}}/>
                </>)}
                <div style={{display:"flex",gap:8}}><Btn onClick={save} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowForm(false);setEditId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
              </div>
            </Card>
          )}
          {filtered.map(r=>(
            <Card key={r.id} style={{cursor:"pointer"}} onClick={()=>setSelected(r.id)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:6}}>{r.name}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {[r.category,r.servings&&`${r.servings} איש`,r.type==="recipe"&&(r.prepTime||r.cookTime)&&`${(+r.prepTime||0)+(+r.cookTime||0)} דק׳`].filter(Boolean).map((tag,i)=><span key={i} style={{fontSize:11,color:T.textSub,background:T.bg,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.border}`}}>{tag}</span>)}
                    {(r.concepts||[]).map(c=><span key={c} style={{fontSize:11,color:T.navyMid,background:T.navyLight,borderRadius:99,padding:"3px 10px",border:`1px solid ${T.navyBorder}`}}>{c}</span>)}
                  </div>
                </div>
                <ActionBtns onEdit={()=>openEdit(r)} onDelete={()=>setConfirmId(r.id)}/>
              </div>
            </Card>
          ))}
          {filtered.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>אין {mode==="recipe"?"מתכונים":"תפריטים"} עדיין</div>}
        </>
      ):(sel&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:T.navy,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>← חזרה</button>
            <ActionBtns onEdit={()=>openEdit(sel)} onDelete={()=>setConfirmId(sel.id)}/>
          </div>
          <Card>
            <div style={{fontSize:24,fontWeight:300,fontFamily:T.display,color:T.text,marginBottom:10}}>{sel.name}</div>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {[sel.category,sel.servings&&`${sel.servings} איש`,sel.type==="recipe"&&(sel.prepTime||sel.cookTime)&&`${(+sel.prepTime||0)+(+sel.cookTime||0)} דק׳`].filter(Boolean).map((tag,i)=><span key={i} style={{fontSize:12,color:T.textSub,background:T.bg,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.border}`}}>{tag}</span>)}
              {(sel.concepts||[]).map(c=><span key={c} style={{fontSize:12,color:T.navyMid,background:T.navyLight,borderRadius:99,padding:"4px 12px",border:`1px solid ${T.navyBorder}`}}>{c}</span>)}
            </div>
            {sel.type==="recipe"&&(<>
              {sel.ingredients?.length>0&&(<><div style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>מצרכים</div>{sel.ingredients.map((ing,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:13,color:T.text}}>{ing.item}</span><span style={{fontSize:13,color:T.textSub}}>{ing.qty} {ing.unit}</span></div>)}</>)}
              {sel.steps?.length>0&&<div style={{marginTop:14}}><div style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>אופן הכנה</div>{sel.steps.map((st,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:10}}><div style={{width:24,height:24,borderRadius:"50%",background:T.navy,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{st}</div></div>)}</div>}
              {sel.prepNotes&&<div style={{marginTop:14,background:T.navyLight,borderRadius:10,padding:14,border:`1px solid ${T.navyBorder}`}}><div style={{fontSize:11,fontWeight:700,color:T.navyMid,marginBottom:4}}>הכנות מקדימות</div><div style={{fontSize:13,color:T.textMid,lineHeight:1.7}}>{sel.prepNotes}</div></div>}
            </>)}
            {sel.type==="menu"&&(<>
              {sel.dishes?.filter(Boolean).length>0&&(<><div style={{fontSize:11,fontWeight:700,color:T.textMid,letterSpacing:.5,textTransform:"uppercase",marginBottom:10}}>מנות</div>{sel.dishes.filter(Boolean).map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><div style={{width:20,height:20,borderRadius:"50%",background:T.navyLight,color:T.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{i+1}</div><span style={{fontSize:13,color:T.text}}>{d}</span></div>)}</>)}
              {sel.notes&&<div style={{marginTop:14,background:T.navyLight,borderRadius:10,padding:14,border:`1px solid ${T.navyBorder}`}}><div style={{fontSize:11,fontWeight:700,color:T.navyMid,marginBottom:4}}>הערות</div><div style={{fontSize:13,color:T.textMid,lineHeight:1.7}}>{sel.notes}</div></div>}
            </>)}
          </Card>
        </div>
      ))}
    </div>
  );
}

// ─── TAB: פתקים ──────────────────────────────────────────────────────────────
function NotesTab(){
  const [notes,setNotes]=useStorage("kp-notes",DEFAULT_NOTES);
  const [text,setText]=useState("");const [who,setWho]=useState("א");const [editId,setEditId]=useState(null);const [confirmId,setConfirmId]=useState(null);
  const save=()=>{if(!text.trim())return;if(editId){setNotes(notes.map(n=>n.id===editId?{...n,text,who}:n));setEditId(null);}else{setNotes([{id:uid(),text,who,date:new Date().toISOString()},...notes]);}setText("");};
  const startEdit=note=>{setEditId(note.id);setText(note.text);setWho(note.who);};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,animation:"fadeUp .25s ease"}}>
      {confirmId&&<ConfirmModal message="למחוק פתק זה?" onConfirm={()=>{setNotes(notes.filter(n=>n.id!==confirmId));setConfirmId(null);}} onCancel={()=>setConfirmId(null)}/>}
      <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight,padding:16}}>
        {editId&&<div style={{fontSize:12,color:T.navy,fontWeight:600,marginBottom:8}}>עריכת פתק</div>}
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="..." rows={3} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",fontFamily:T.font,resize:"none"}}/>
        <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
          <div style={{display:"flex",gap:6}}>{[["א","אדיר"],["ס","ספיר"]].map(([v,l])=><button key={v} onClick={()=>setWho(v)} style={{padding:"6px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${who===v?T.navy:T.border}`,background:who===v?T.navyLight:"transparent",color:who===v?T.navy:T.textMid}}>{l}</button>)}</div>
          <div style={{marginRight:"auto",display:"flex",gap:8}}>{editId&&<Btn variant="secondary" onClick={()=>{setEditId(null);setText("");}} style={{padding:"8px 14px"}}>ביטול</Btn>}<Btn onClick={save} style={{padding:"8px 20px"}}>{editId?"עדכון":"שמירה"}</Btn></div>
        </div>
      </Card>
      {notes.map(note=>(
        <Card key={note.id} style={{padding:16}}>
          <div style={{fontSize:14,color:T.text,lineHeight:1.7,marginBottom:10}}>{note.text}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:11,color:T.textSub}}>{note.who==="א"?"אדיר":"ספיר"} · {fmtDt(note.date)}</div>
            <ActionBtns onEdit={()=>startEdit(note)} onDelete={()=>setConfirmId(note.id)}/>
          </div>
        </Card>
      ))}
      {notes.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>אין פתקים עדיין</div>}
    </div>
  );
}

// ─── SECTION: חופשות ─────────────────────────────────────────────────────────
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
  const filteredTrips=showAll?[...trips].sort((a,b)=>(a.dateFrom||"").localeCompare(b.dateFrom||"")):trips.filter(t=>{if(!t.dateFrom)return true;const d=new Date(t.dateFrom);return d.getMonth()===month&&d.getFullYear()===year;});
  return(
    <div style={{padding:"0 0 40px"}}>
      {confirmTrip&&<ConfirmModal message="למחוק את החופשה?" onConfirm={()=>doDeleteTrip(confirmTrip)} onCancel={()=>setConfirmTrip(null)}/>}
      {confirmItem&&<ConfirmModal message="למחוק פריט זה?" onConfirm={()=>doDeleteItem(confirmItem)} onCancel={()=>setConfirmItem(null)}/>}
      <div style={{padding:"16px 16px 0"}}><PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/></div>
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
                <Card key={trip.id} style={{cursor:"pointer"}} onClick={()=>setSel(trip.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"flex-start"}}>
                    <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:3}}>{trip.name}</div>{dateLabel&&<div style={{fontSize:12,color:T.textSub}}>{dateLabel}</div>}</div>
                    <ActionBtns onEdit={()=>openEditTrip(trip)} onDelete={()=>setConfirmTrip(trip.id)}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:18,fontWeight:600,fontFamily:T.display}}>{fmt(tot)}</div><div style={{fontSize:12,color:T.textSub}}>מתוך {fmt(trip.budget)}</div></div>
                  <PBar value={tot} max={trip.budget} color={trip.color||T.navy}/>
                  <div style={{marginTop:6,fontSize:12,fontWeight:600,color:over?T.danger:T.success}}>
                    {over?`חריגה של ${fmt(tot-trip.budget)}`:`נותר ${fmt(trip.budget-tot)}`}
                  </div>
                </Card>
              );
            })}
            {filteredTrips.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:32,fontSize:13}}>{showAll?"אין חופשות":`אין חופשות ב${MONTHS[month]} ${year}`}</div>}
          </>
        ):(selTrip&&(
          <div>
            <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:T.navy,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginBottom:14}}>← חזרה</button>
            <Card style={{marginBottom:12}}>
              <div style={{fontSize:22,fontWeight:300,fontFamily:T.display,marginBottom:4}}>{selTrip.name}</div>
              {(selTrip.dateFrom||selTrip.dateTo)&&<div style={{fontSize:12,color:T.textSub,marginBottom:12}}>{selTrip.dateFrom&&new Date(selTrip.dateFrom).toLocaleDateString("he-IL")}{selTrip.dateTo&&` – ${new Date(selTrip.dateTo).toLocaleDateString("he-IL")}`}</div>}
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div><div style={{fontSize:11,color:T.textSub}}>שולם</div><div style={{fontSize:22,fontWeight:600,fontFamily:T.display}}>{fmt(tripTotal(selTrip))}</div></div><div style={{textAlign:"left"}}><div style={{fontSize:11,color:T.textSub}}>תקציב</div><div style={{fontSize:22,fontWeight:600,fontFamily:T.display,color:T.navy}}>{fmt(selTrip.budget)}</div></div></div>
              <PBar value={tripTotal(selTrip)} max={selTrip.budget} h={6}/>
              <div style={{marginTop:8,fontSize:12,fontWeight:600,color:tripTotal(selTrip)>selTrip.budget?T.danger:T.success}}>
                {tripTotal(selTrip)>selTrip.budget?`חריגה של ${fmt(tripTotal(selTrip)-selTrip.budget)}`:`נותר ${fmt(selTrip.budget-tripTotal(selTrip))}`}
              </div>
            </Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"4px 0 8px"}}>
              <div style={{fontSize:13,fontWeight:600,color:T.text}}>פירוט הוצאות</div>
              <Btn onClick={openAddItem} style={{padding:"6px 12px",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={12} color="#fff"/>הוספה</Btn>
            </div>
            {showItem&&(
              <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight,marginBottom:10}}>
                <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:10}}>{editItemId?"עריכת פריט":"פריט חדש"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:11,color:T.textMid,fontWeight:600}}>קטגוריה</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TCAT.map(c=><button key={c} onClick={()=>setItf({...itf,cat:c})} style={{padding:"6px 12px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:500,cursor:"pointer",border:`1px solid ${itf.cat===c?T.navy:T.border}`,background:itf.cat===c?T.navyLight:"transparent",color:itf.cat===c?T.navy:T.textMid}}>{c}</button>)}</div>
                  <Inp placeholder="תיאור *" value={itf.label} onChange={e=>setItf({...itf,label:e.target.value})}/>
                  <CurrencyField currency={itf.currency} setCurrency={c=>setItf({...itf,currency:c})} rate={itf.rateUsed} setRate={r=>setItf({...itf,rateUsed:r})} amount={itf.amount}/>
                  <Inp type="number" placeholder="סכום" value={itf.amount} onChange={e=>setItf({...itf,amount:e.target.value})}/>
                  <div style={{display:"flex",gap:8}}><Btn onClick={saveItem} disabled={!itf.label||!itf.amount} style={{flex:1,padding:"11px"}}>שמירה</Btn><Btn variant="secondary" onClick={()=>{setShowItem(false);setEditItemId(null);}} style={{flex:1,padding:"11px"}}>ביטול</Btn></div>
                </div>
              </Card>
            )}
            {selTrip.items.map((item,i)=>{const cur=CURRENCIES.find(c=>c.code===item.currency)||CURRENCIES[0];return(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<selTrip.items.length-1?`1px solid ${T.border}`:"none"}}>
                <CatIcon icon={catIcon(item.cat)} color={T.navy} size={34}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:T.text}}>{item.label}</div>
                  <div style={{fontSize:11,color:T.textSub}}>{item.cat}{item.currency!=="ILS"?` · ${fmtCur(item.amount,cur.symbol)}`:""}</div>
                </div>
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

// ─── SECTION: דוחות ──────────────────────────────────────────────────────────
function ReportsSection({expenses,specialItems=[],cats,month,year,setMonth,setYear}){
  const [savingsGoal,setSavingsGoal]=useStorage("kp-savings-goal",3000);
  const [editGoal,setEditGoal]=useState(false);
  const [goalInput,setGoalInput]=useState("");
  const [drillCat,setDrillCat]=useState(null);
  const [reportTab,setReportTab]=useState("monthly"); // monthly | annual | split | insights

  // ── חישובים בסיסיים ─────────────────────────────────────────────────────
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

  // ── מגמה 6 חודשים ───────────────────────────────────────────────────────
  const trend=Array.from({length:6},(_, i)=>{
    const mi=(month-5+i+12)%12;const yi=month-5+i<0?year-1:year;
    const v=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi;}).reduce((s,e)=>s+e.amount,0)
           +specialItems.filter(i=>{const d=new Date(i.date);return d.getMonth()===mi&&d.getFullYear()===yi;}).reduce((s,i2)=>s+toILS(i2),0);
    return{label:MONTHS[mi].slice(0,3),v,current:mi===month&&yi===year};
  });
  const maxT=Math.max(...trend.map(t=>t.v),1);

  // ── סיכום שנתי ──────────────────────────────────────────────────────────
  const annualData=MONTHS.map((m,mi)=>{
    const v=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===year;}).reduce((s,e)=>s+e.amount,0)
           +specialItems.filter(i=>{const d=new Date(i.date);return d.getMonth()===mi&&d.getFullYear()===year;}).reduce((s,i2)=>s+toILS(i2),0);
    return{label:m.slice(0,3),v,mi};
  });
  const annualTotal=annualData.reduce((s,d)=>s+d.v,0);
  const annualAvg=annualTotal/12;
  const maxA=Math.max(...annualData.map(d=>d.v),1);

  // ── חלוקה אדיר/ספיר לאורך זמן ─────────────────────────────────────────
  const splitTrend=Array.from({length:6},(_,i)=>{
    const mi=(month-5+i+12)%12;const yi=month-5+i<0?year-1:year;
    const ae=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi&&e.who==="א";}).reduce((s,e)=>s+e.amount,0);
    const se=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi&&e.who==="ס";}).reduce((s,e)=>s+e.amount,0);
    return{label:MONTHS[mi].slice(0,3),a:ae,s:se,current:mi===month&&yi===year};
  });

  // ── תובנות חכמות ────────────────────────────────────────────────────────
  const prevMonthTotal=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===prevM&&d.getFullYear()===prevY;}).reduce((s,e)=>s+e.amount,0);
  const insights=[];
  if(grandTotal>totalBudget)insights.push({type:"warn",text:`חרגת ב-${fmt(grandTotal-totalBudget)} מהתקציב החודשי`});
  else insights.push({type:"good",text:`נותר ${fmt(remaining)} מהתקציב — ${Math.round((remaining/totalBudget)*100)}%`});
  if(prevMonthTotal>0){const diff=grandTotal-prevMonthTotal;if(Math.abs(diff)>200)insights.push({type:diff>0?"warn":"good",text:diff>0?`הוצאות גבוהות ב-${fmt(diff)} לעומת ${MONTHS[prevM]}`:`חסכת ${fmt(-diff)} לעומת ${MONTHS[prevM]}`});}
  const topCat=cats.map(c=>({...c,sp:catSpent(c.id)})).sort((a,b)=>b.sp-a.sp)[0];
  if(topCat?.sp>topCat?.budget)insights.push({type:"warn",text:`${topCat.label}: חריגה של ${fmt(topCat.sp-topCat.budget)}`});
  if(savedThisMonth>=savingsGoal)insights.push({type:"good",text:`יעד החיסכון הושג! ${fmt(savedThisMonth)} נחסכו החודש`});
  else if(savingsGoal>0)insights.push({type:"info",text:`נדרש עוד ${fmt(savingsGoal-savedThisMonth)} להשגת יעד החיסכון`});

  // ── drill-down ──────────────────────────────────────────────────────────
  const drillExpenses=drillCat?monthExpenses.filter(e=>e.catId===drillCat):[];
  const drillCatObj=cats.find(c=>c.id===drillCat);

  // ── ייצוא CSV ───────────────────────────────────────────────────────────
  const exportCSV=()=>{
    const rows=[["תאריך","תיאור","קטגוריה","מי שילם","סכום"],...monthExpenses.map(e=>{const c=cats.find(x=>x.id===e.catId);return[e.date,e.desc||"",c?.label||"",e.who==="א"?"אדיר":"ספיר",e.amount];}),...monthSpecial.map(i=>[i.date,i.desc,"מיוחד","",toILS(i).toFixed(0)])];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);a.download=`sinario-${MONTHS[month]}-${year}.csv`;a.click();
  };

  const tabBtn=(id,label)=><button onClick={()=>setReportTab(id)} style={{padding:"7px 14px",borderRadius:99,fontFamily:T.font,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${reportTab===id?T.navy:T.border}`,background:reportTab===id?T.navy:"transparent",color:reportTab===id?"#fff":T.textSub,flexShrink:0}}>{label}</button>;

  return(
    <div style={{padding:"0 0 40px"}}>
      <div style={{padding:"16px 16px 0"}}><PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/></div>
      <div style={{padding:"12px 16px 0",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
        {tabBtn("monthly","חודשי")}
        {tabBtn("annual","שנתי")}
        {tabBtn("split","חלוקה")}
        {tabBtn("insights","תובנות")}
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>

        {/* ═══ חודשי ═══ */}
        {reportTab==="monthly"&&(<>
          {/* כרטיס סיכום */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1,marginBottom:4}}>סה״כ {MONTHS[month]}</div>
                <div style={{fontSize:32,fontWeight:300,fontFamily:T.display,color:T.text,letterSpacing:-1}}>{fmt(grandTotal)}</div>
                <div style={{fontSize:12,color:T.textSub,marginTop:4}}>מתוך {fmt(totalBudget)}</div>
              </div>
              <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bg,color:T.textMid,fontSize:12,fontFamily:T.font,fontWeight:600,cursor:"pointer"}}>
                <Icon name="download" size={13} color={T.textMid}/>CSV
              </button>
            </div>
            <PBar value={grandTotal} max={totalBudget} h={6}/>
            <div style={{marginTop:8,fontSize:12,fontWeight:600,color:grandTotal>totalBudget?T.danger:T.success}}>
              {grandTotal>totalBudget?`חריגה של ${fmt(grandTotal-totalBudget)}`:`נותר ${fmt(remaining)}`}
            </div>
            {totalSpecial>0&&<div style={{marginTop:6,fontSize:11,color:T.textSub}}>הוצאות שוטפות {fmt(totalSpent)} + מיוחדות {fmt(totalSpecial)}</div>}
          </Card>

          {/* יעד חיסכון */}
          <Card style={{border:`1px solid ${T.navyBorder}`,background:T.navyLight}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="target" size={15} color={T.navy}/><div style={{fontSize:13,fontWeight:600,color:T.navy}}>יעד חיסכון חודשי</div></div>
              <button onClick={()=>{setEditGoal(v=>!v);setGoalInput(String(savingsGoal));}} style={{background:"none",border:`1px solid ${T.navyBorder}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,color:T.navy,fontFamily:T.font,fontWeight:600}}>{editGoal?"סגור":"עריכה"}</button>
            </div>
            {editGoal?(
              <div style={{display:"flex",gap:8}}>
                <Inp type="number" placeholder="יעד חיסכון ₪" value={goalInput} onChange={e=>setGoalInput(e.target.value)} style={{flex:1}}/>
                <Btn onClick={()=>{setSavingsGoal(+goalInput||0);setEditGoal(false);}} style={{padding:"10px 16px"}}>שמור</Btn>
              </div>
            ):(
              <>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:12,color:T.textMid}}>נחסך בפועל</span>
                  <span style={{fontSize:14,fontWeight:600,color:savedThisMonth>=savingsGoal?T.success:T.danger}}>{fmt(savedThisMonth)}</span>
                </div>
                <PBar value={savedThisMonth} max={savingsGoal||1} color={savedThisMonth>=savingsGoal?T.success:T.navy} h={6}/>
                <div style={{marginTop:6,fontSize:11,color:T.textMid}}>{savingsGoal>0?`יעד: ${fmt(savingsGoal)}`:"לא הוגדר יעד"}</div>
              </>
            )}
          </Card>

          {/* השוואה לחודש קודם */}
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>השוואה לחודש קודם</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1,textAlign:"center",padding:14,background:T.bg,borderRadius:12}}>
                <div style={{fontSize:11,color:T.textSub,marginBottom:4}}>{MONTHS[prevM]}</div>
                <div style={{fontSize:20,fontWeight:600,fontFamily:T.display,color:T.text}}>{fmt(prevMonthTotal)}</div>
              </div>
              <div style={{color:grandTotal>prevMonthTotal?T.danger:T.success,fontWeight:700,fontSize:18}}>{grandTotal>prevMonthTotal?"▲":"▼"}</div>
              <div style={{flex:1,textAlign:"center",padding:14,background:T.navyLight,borderRadius:12,border:`1px solid ${T.navyBorder}`}}>
                <div style={{fontSize:11,color:T.navy,marginBottom:4}}>{MONTHS[month]}</div>
                <div style={{fontSize:20,fontWeight:600,fontFamily:T.display,color:T.navy}}>{fmt(grandTotal)}</div>
              </div>
            </div>
          </Card>

          {/* מגמה 6 חודשים */}
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:16}}>מגמה — 6 חודשים</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:110}}>
              {trend.map((t,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{fontSize:9,color:t.current?T.navy:T.textSub,fontWeight:t.current?700:400,textAlign:"center"}}>{t.v>0?fmt(t.v):""}</div>
                  <div style={{width:"100%",background:T.bg,borderRadius:6,height:72,display:"flex",alignItems:"flex-end",overflow:"hidden",border:`1px solid ${T.border}`}}>
                    <div style={{width:"100%",height:`${(t.v/maxT)*100}%`,background:t.current?T.navy:"#c3d4e8",borderRadius:4,transition:"height .7s"}}/>
                  </div>
                  <span style={{fontSize:10,color:t.current?T.navy:T.textSub,fontWeight:t.current?700:400}}>{t.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* פירוט לפי קטגוריה עם drill-down */}
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>
              {drillCat?<><button onClick={()=>setDrillCat(null)} style={{background:"none",border:"none",color:T.navy,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:600}}>← חזרה</button><span style={{marginRight:8}}>{drillCatObj?.label}</span></>:"פירוט לפי קטגוריה"}
            </div>
            {!drillCat?(
              cats.map(c=>{const sp=catSpent(c.id);return(
                <div key={c.id} style={{marginBottom:14,cursor:"pointer"}} onClick={()=>setDrillCat(c.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><CatIcon icon={c.icon} color={c.color} size={30}/><div><div style={{fontSize:13,color:T.text,fontWeight:500}}>{c.label}</div><div style={{fontSize:11,color:T.textSub}}>{((sp/(totalSpent||1))*100).toFixed(0)}% מהכלל · לחץ לפירוט</div></div></div>
                    <div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:600,color:sp>c.budget?T.danger:T.text}}>{fmt(sp)}</div><div style={{fontSize:10,color:T.textSub}}>מתוך {fmt(c.budget)}</div></div>
                  </div>
                  <PBar value={sp} max={c.budget} color={c.color}/>
                </div>
              );})
            ):(
              <>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:20,fontWeight:300,fontFamily:T.display}}>{fmt(catSpent(drillCat))}</div>
                  <div style={{fontSize:12,color:T.textSub}}>מתוך {fmt(drillCatObj?.budget||0)} תקציב</div>
                </div>
                <PBar value={catSpent(drillCat)} max={drillCatObj?.budget||1} color={drillCatObj?.color||T.navy} h={6}/>
                <div style={{marginTop:14}}>
                  {drillExpenses.sort((a,b)=>new Date(b.date)-new Date(a.date)).map((e,i)=>(
                    <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<drillExpenses.length-1?`1px solid ${T.border}`:"none"}}>
                      <div><div style={{fontSize:13,fontWeight:500,color:T.text}}>{e.desc||"הוצאה"}</div><div style={{fontSize:11,color:T.textSub}}>{e.who==="א"?"אדיר":"ספיר"} · {new Date(e.date).toLocaleDateString("he-IL")}</div></div>
                      <div style={{fontSize:14,fontWeight:600,color:T.text}}>{fmt(e.amount)}</div>
                    </div>
                  ))}
                  {drillExpenses.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:16,fontSize:13}}>אין הוצאות בקטגוריה זו</div>}
                </div>
              </>
            )}
          </Card>
        </>)}

        {/* ═══ שנתי ═══ */}
        {reportTab==="annual"&&(<>
          <Card>
            <div style={{fontSize:11,color:T.textSub,fontWeight:600,letterSpacing:1,marginBottom:4}}>סה״כ {year}</div>
            <div style={{fontSize:32,fontWeight:300,fontFamily:T.display,color:T.text,letterSpacing:-1}}>{fmt(annualTotal)}</div>
            <div style={{fontSize:12,color:T.textSub,marginTop:4}}>ממוצע חודשי: {fmt(annualAvg)}</div>
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:16}}>הוצאות לאורך {year}</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:5,height:130}}>
              {annualData.map((d,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{fontSize:8,color:d.mi===month?T.navy:T.textSub,fontWeight:d.mi===month?700:400,textAlign:"center",writingMode:"vertical-rl",textOrientation:"mixed"}}>{d.v>0?`₪${Math.round(d.v/1000)}K`:""}</div>
                  <div style={{width:"100%",background:T.bg,borderRadius:4,height:90,display:"flex",alignItems:"flex-end",overflow:"hidden",border:`1px solid ${T.border}`}}>
                    <div style={{width:"100%",height:`${(d.v/maxA)*100}%`,background:d.mi===month?T.navy:"#c3d4e8",transition:"height .7s"}}/>
                  </div>
                  <span style={{fontSize:8,color:d.mi===month?T.navy:T.textSub,fontWeight:d.mi===month?700:400}}>{d.label}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>חודש לפי חודש</div>
            {annualData.filter(d=>d.v>0).sort((a,b)=>b.v-a.v).map((d,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:28,height:28,borderRadius:8,background:d.mi===month?T.navy:T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:d.mi===month?"#fff":T.textMid}}>{d.label.slice(0,2)}</div><span style={{fontSize:13,color:T.text,fontWeight:d.mi===month?600:400}}>{MONTHS[d.mi]}</span></div>
                <div style={{textAlign:"left"}}><div style={{fontSize:14,fontWeight:600,color:T.text}}>{fmt(d.v)}</div><div style={{fontSize:10,color:T.textSub}}>{((d.v/annualTotal)*100).toFixed(0)}%</div></div>
              </div>
            ))}
          </Card>
        </>)}

        {/* ═══ חלוקה ═══ */}
        {reportTab==="split"&&(<>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>חלוקה — {MONTHS[month]}</div>
            {[["אדיר","א"],["ספיר","ס"]].map(([name,who])=>{
              const amt=monthExpenses.filter(e=>e.who===who).reduce((s,e)=>s+e.amount,0);
              const pct=((amt/(totalSpent||1))*100).toFixed(0);
              return(
                <div key={who} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:T.text}}>{name}</span><span style={{fontSize:14,fontWeight:600,color:T.navy}}>{fmt(amt)} <span style={{fontSize:11,color:T.textSub,fontWeight:400}}>({pct}%)</span></span></div>
                  <PBar value={amt} max={totalSpent||1} color={T.navy} h={6}/>
                </div>
              );
            })}
            {Math.abs(monthExpenses.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0)-monthExpenses.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0))>5&&(
              <div style={{marginTop:8,background:T.navyLight,borderRadius:10,padding:12,border:`1px solid ${T.navyBorder}`}}>
                <div style={{fontSize:12,fontWeight:600,color:T.navy}}>
                  {monthExpenses.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0)>monthExpenses.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0)?"ספיר חייבת לאדיר":"אדיר חייב לספיר"}: {fmt(Math.abs(monthExpenses.filter(e=>e.who==="א").reduce((s,e)=>s+e.amount,0)-monthExpenses.filter(e=>e.who==="ס").reduce((s,e)=>s+e.amount,0))/2)}
                </div>
              </div>
            )}
          </Card>
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:16}}>חלוקה — 6 חודשים</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:120}}>
              {splitTrend.map((t,i)=>{const maxV=Math.max(...splitTrend.map(x=>x.a+x.s),1);return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:"100%",height:90,display:"flex",alignItems:"flex-end",gap:2}}>
                    <div style={{flex:1,background:T.navy,borderRadius:"3px 3px 0 0",height:`${(t.a/maxV)*90}px`,transition:"height .7s",opacity:t.current?1:.6}}/>
                    <div style={{flex:1,background:"#be185d",borderRadius:"3px 3px 0 0",height:`${(t.s/maxV)*90}px`,transition:"height .7s",opacity:t.current?1:.6}}/>
                  </div>
                  <span style={{fontSize:10,color:t.current?T.navy:T.textSub,fontWeight:t.current?700:400}}>{t.label}</span>
                </div>
              );})}
            </div>
            <div style={{display:"flex",gap:12,marginTop:8,fontSize:11,color:T.textSub}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:2,background:T.navy}}/> אדיר</div>
              <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:2,background:"#be185d"}}/> ספיר</div>
            </div>
          </Card>
        </>)}

        {/* ═══ תובנות ═══ */}
        {reportTab==="insights"&&(<>
          <Card>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Icon name="insights" size={15} color={T.navy}/><div style={{fontSize:14,fontWeight:600,color:T.text}}>תובנות חכמות — {MONTHS[month]}</div></div>
            {insights.map((ins,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:8,background:ins.type==="warn"?T.dangerBg:ins.type==="good"?T.successBg:T.navyLight,border:`1px solid ${ins.type==="warn"?T.dangerBorder:ins.type==="good"?"#bbf7d0":T.navyBorder}`}}>
                <span style={{fontSize:14}}>{ins.type==="warn"?"⚠️":ins.type==="good"?"✓":"→"}</span>
                <span style={{fontSize:13,color:T.text,lineHeight:1.5}}>{ins.text}</span>
              </div>
            ))}
            {insights.length===0&&<div style={{textAlign:"center",color:T.textSub,padding:20,fontSize:13}}>אין תובנות לחודש זה</div>}
          </Card>
          {/* מגמות חזרה */}
          <Card>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:14}}>קטגוריות עם חריגות חוזרות</div>
            {cats.map(c=>{
              const overMonths=Array.from({length:6},(_,i)=>{const mi=(month-5+i+12)%12;const yi=month-5+i<0?year-1:year;const sp=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi&&e.catId===c.id;}).reduce((s,e)=>s+e.amount,0);return sp>c.budget;}).filter(Boolean).length;
              if(overMonths<2)return null;
              return(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                  <CatIcon icon={c.icon} color={c.color} size={32}/>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:T.text}}>{c.label}</div><div style={{fontSize:11,color:T.danger}}>חריגה ב-{overMonths} מתוך 6 חודשים אחרונים</div></div>
                  <div style={{fontSize:12,color:T.textSub}}>תקציב {fmt(c.budget)}</div>
                </div>
              );
            })}
            {cats.every(c=>Array.from({length:6},(_,i)=>{const mi=(month-5+i+12)%12;const yi=month-5+i<0?year-1:year;return expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===mi&&d.getFullYear()===yi&&e.catId===c.id;}).reduce((s,e)=>s+e.amount,0)>c.budget;}).filter(Boolean).length<2)&&<div style={{textAlign:"center",color:T.textSub,padding:16,fontSize:13}}>אין חריגות חוזרות</div>}
          </Card>
        </>)}

      </div>
    </div>
  );
}

// ─── SECTION: השקעות (placeholder) ───────────────────────────────────────────
function InvestSection(){
  return(
    <div style={{padding:16}}>
      <Card style={{padding:40,textAlign:"center"}}>
        <Icon name="chart" size={32} color={T.navy}/>
        <div style={{fontSize:22,fontWeight:300,fontFamily:T.display,color:T.text,marginTop:16,marginBottom:8}}>ההשקעות שלנו</div>
        <div style={{fontSize:13,color:T.textSub,lineHeight:1.8,maxWidth:280,margin:"0 auto"}}>מעקב תיק מסחר, חדשות יומיות, ניתוח ביצועים וסוכן חכם — בפיתוח.</div>
        <div style={{marginTop:20,display:"inline-block",background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"5px 16px",fontSize:12,color:T.navy,fontWeight:600}}>בקרוב</div>
      </Card>
    </div>
  );
}

// ─── SECTION: הגדרות ─────────────────────────────────────────────────────────
function SettingsSection({cats,setCats,specialCatsList,setSpecialCatsList,menuConceptsList,setMenuConceptsList,monthlyBudget,setMonthlyBudget}){
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
        {[["system","מערכת"],["db","נתונים"]].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 18px",borderRadius:99,fontFamily:T.font,fontSize:13,fontWeight:600,cursor:"pointer",border:`1px solid ${tab===id?T.navy:T.border}`,background:tab===id?T.navy:"transparent",color:tab===id?"#fff":T.textSub}}>{l}</button>
        ))}
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {tab==="system"&&(<>
          {/* תקציב חודשי כולל */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Icon name="wallet" size={15} color={T.navy}/><div style={{fontSize:13,fontWeight:700,color:T.navy}}>תקציב חודשי כולל</div></div>
              <button onClick={()=>{setEditBudget(v=>!v);setBudgetInput(String(cats.reduce((s,c)=>s+c.budget,0)));}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,color:T.textMid,fontFamily:T.font,fontWeight:600}}>{editBudget?"סגור":"עריכה"}</button>
            </div>
            {editBudget?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontSize:12,color:T.textMid,marginBottom:4}}>הזן תקציב חודשי כולל — יחולק שווה בין הקטגוריות</div>
                <div style={{display:"flex",gap:8}}>
                  <Inp type="number" placeholder="תקציב ₪" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} style={{flex:1}}/>
                  <Btn onClick={()=>{
                    const total=+budgetInput||0;if(!total||cats.length===0)return;
                    const share=Math.round(total/cats.length);
                    setCats(cats.map(c=>({...c,budget:share})));
                    setEditBudget(false);
                  }} style={{padding:"10px 16px"}}>חלק</Btn>
                </div>
              </div>
            ):(
              <div style={{fontSize:24,fontWeight:300,fontFamily:T.display,color:T.text}}>{fmt(cats.reduce((s,c)=>s+c.budget,0))}</div>
            )}
          </Card>

          {/* קטגוריות הוצאות שוטפות */}
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:T.navy}}>קטגוריות הוצאות שוטפות</div>
              <Btn onClick={()=>{setEditId("__new__");setForm(blank);}} style={{padding:"6px 12px",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Icon name="plus" size={12} color="#fff"/>הוספה</Btn>
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
            {cats.map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                <CatIcon icon={c.icon} color={c.color} size={36}/>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{c.label}</div><div style={{fontSize:11,color:T.textSub}}>תקציב: {fmt(c.budget)}</div></div>
                <ActionBtns onEdit={()=>startEdit(c)} onDelete={()=>cats.length>1?setConfirmCatId(c.id):null}/>
              </div>
            ))}
          </Card>

          {/* קטגוריות מיוחדות */}
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>קטגוריות הוצאות מיוחדות</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{specialCatsList.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:4,background:T.bg,border:`1px solid ${T.border}`,borderRadius:99,padding:"5px 12px"}}><span style={{fontSize:12,color:T.text}}>{c.label}</span><button onClick={()=>setSpecialCatsList(specialCatsList.filter(x=>x.id!==c.id))} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button></div>))}</div>
            <div style={{display:"flex",gap:8}}>
              <Inp placeholder="קטגוריה חדשה" value={newSpecialCat} onChange={e=>setNewSpecialCat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newSpecialCat.trim()){setSpecialCatsList([...specialCatsList,{id:"sc"+uid(),label:newSpecialCat.trim()}]);setNewSpecialCat("");}}}/>
              <Btn onClick={()=>{if(newSpecialCat.trim()){setSpecialCatsList([...specialCatsList,{id:"sc"+uid(),label:newSpecialCat.trim()}]);setNewSpecialCat("");}}} style={{padding:"10px 14px",flexShrink:0}}><Icon name="plus" size={13} color="#fff"/></Btn>
            </div>
          </Card>

          {/* קונספטי תפריטים */}
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:T.navy,marginBottom:12}}>קונספטי תפריטים</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{menuConceptsList.map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"5px 12px"}}><span style={{fontSize:12,color:T.navy}}>{c}</span><button onClick={()=>setMenuConceptsList(menuConceptsList.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:T.navyMid,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button></div>))}</div>
            <div style={{display:"flex",gap:8}}>
              <Inp placeholder="קונספט חדש" value={newConcept} onChange={e=>setNewConcept(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newConcept.trim()){setMenuConceptsList([...menuConceptsList,newConcept.trim()]);setNewConcept("");}}}/>
              <Btn onClick={()=>{if(newConcept.trim()){setMenuConceptsList([...menuConceptsList,newConcept.trim()]);setNewConcept("");}}} style={{padding:"10px 14px",flexShrink:0}}><Icon name="plus" size={13} color="#fff"/></Btn>
            </div>
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
            {calConnected?(
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:T.successBg,borderRadius:10,border:"1px solid #bbf7d0"}}>
                <span style={{fontSize:13}}>✓</span><span style={{fontSize:13,color:T.success,fontWeight:600}}>מחובר בהצלחה</span>
                <button onClick={()=>setCalConnected(false)} style={{marginRight:"auto",background:"none",border:"none",color:T.textSub,cursor:"pointer",fontSize:12,fontFamily:T.font}}>ניתוק</button>
              </div>
            ):(
              <Btn style={{width:"100%",padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={()=>setCalConnected(true)}><Icon name="calendar" size={14} color="#fff"/>התחבר ל-Google Calendar</Btn>
            )}
          </Card>
        </>)}
      </div>
    </div>
  );
}

// ─── SECTIONS & TABS ─────────────────────────────────────────────────────────
const SECTIONS=[
  {id:"home",    label:"הבית שלנו",    icon:"home"},
  {id:"trips",   label:"החופשות שלנו", icon:"plane"},
  {id:"invest",  label:"ההשקעות שלנו", icon:"chart"},
  {id:"reports", label:"דוחות",        icon:"insights"},
  {id:"settings",label:"הגדרות",       icon:"settings"},
];
const HOME_TABS=[
  {id:"expenses",label:"הוצאות שוטפות"},
  {id:"special", label:"הוצאות מיוחדות"},
  {id:"grocery", label:"רשימת קניות"},
  {id:"recipes", label:"מתכונים/תפריטים"},
  {id:"notes",   label:"פתקים"},
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [authed,setAuthed]=useState(()=>{try{return sessionStorage.getItem("sinario_auth")==="1";}catch{return false;}});
  const [cats,             setCats]             =useStorage("sp-cats",         DEFAULT_CATS);
  const [expenses,         setExpenses]         =useStorage("sp-expenses",     SEED_EXPENSES);
  const [special,          setSpecial]          =useStorage("kp-special",      DEFAULT_SPECIAL);
  const [specialCatsList,  setSpecialCatsList]  =useStorage("sp-special-cats", DEFAULT_SPECIAL_CATS);
  const [menuConceptsList, setMenuConceptsList] =useStorage("sp-menu-concepts",DEFAULT_MENU_CONCEPTS);
  const [section,  setSection] =useState("home");
  const [homeTab,  setHomeTab] =useState("expenses");
  const [month,    setMonth]   =useState(new Date().getMonth());
  const [year,     setYear]    =useState(2026);

  const monthExp=expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===month&&d.getFullYear()===year;});
  const monthSpecialTotal=special.filter(i=>{const d=new Date(i.date);return d.getMonth()===month&&d.getFullYear()===year;}).reduce((s,i)=>s+toILS(i),0);

  if(!authed)return <PinScreen onUnlock={()=>setAuthed(true)}/>;

  return(
    <div style={{background:T.bg,minHeight:"100vh",width:"100%",fontFamily:T.font,direction:"rtl",color:T.text}}>
      <style>{globalCss}</style>
      {/* Header */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"12px 20px",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 0 rgba(0,0,0,.04)"}}>
        <div style={{maxWidth:720,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{background:T.navyLight,border:`1px solid ${T.navyBorder}`,borderRadius:99,padding:"5px 14px",fontSize:12,color:T.navy,fontWeight:600,flexShrink:0}}>{MONTHS[month]} {year}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:18,fontWeight:700,fontFamily:T.display,color:T.navy,letterSpacing:-.3}}>Sinario</div>
            <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${T.navy},${T.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${T.navy}33`}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="19" cy="6" r="3" fill="#f0c040" stroke="#fff" strokeWidth="1.2"/></svg>
            </div>
          </div>
        </div>
      </div>
      {/* Section nav */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,overflowX:"auto",scrollbarWidth:"none"}}>
        <div style={{maxWidth:720,margin:"0 auto",display:"flex",padding:"0 16px"}}>
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} style={{padding:"13px 14px",border:"none",background:"transparent",color:section===s.id?T.navy:T.textSub,fontFamily:T.font,fontSize:13,fontWeight:section===s.id?700:500,cursor:"pointer",whiteSpace:"nowrap",borderBottom:section===s.id?`2px solid ${T.navy}`:"2px solid transparent",marginBottom:-1,transition:"color .15s",display:"flex",alignItems:"center",gap:5}}>
              <Icon name={s.icon} size={13} color={section===s.id?T.navy:T.textSub}/>{s.label}
            </button>
          ))}
        </div>
      </div>
      {/* Home sub-tabs */}
      {section==="home"&&(
        <div style={{background:T.bg,borderBottom:`1px solid ${T.border}`,overflowX:"auto",scrollbarWidth:"none"}}>
          <div style={{maxWidth:720,margin:"0 auto",display:"flex",padding:"0 16px"}}>
            {HOME_TABS.map(t=>(
              <button key={t.id} onClick={()=>setHomeTab(t.id)} style={{padding:"9px 14px",border:"none",background:homeTab===t.id?T.surface:"transparent",color:homeTab===t.id?T.navy:T.textSub,fontFamily:T.font,fontSize:12,fontWeight:homeTab===t.id?700:500,cursor:"pointer",whiteSpace:"nowrap",borderBottom:homeTab===t.id?`2px solid ${T.navy}`:"2px solid transparent",marginBottom:-1,transition:"all .15s"}}>{t.label}</button>
            ))}
          </div>
        </div>
      )}
      {/* Period picker */}
      {section==="home"&&(
        <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"10px 16px"}}>
          <div style={{maxWidth:720,margin:"0 auto"}}><PeriodPicker month={month} year={year} setMonth={setMonth} setYear={setYear}/></div>
        </div>
      )}
      {/* Content */}
      <div style={{maxWidth:720,margin:"0 auto",padding:"16px 16px 40px"}}>
        {section==="home"&&homeTab==="expenses" &&<ExpensesTab expenses={monthExp} setExpenses={setExpenses} cats={cats} monthSpecialTotal={monthSpecialTotal}/>}
        {section==="home"&&homeTab==="special"  &&<SpecialTab month={month} year={year} specialCatsList={specialCatsList}/>}
        {section==="home"&&homeTab==="grocery"  &&<GroceryTab/>}
        {section==="home"&&homeTab==="recipes"  &&<RecipesTab menuConceptsList={menuConceptsList}/>}
        {section==="home"&&homeTab==="notes"    &&<NotesTab/>}
        {section==="trips"   &&<TripsSection month={month} year={year} setMonth={setMonth} setYear={setYear}/>}
        {section==="invest"  &&<InvestSection/>}
        {section==="reports" &&<ReportsSection expenses={expenses} specialItems={special} cats={cats} month={month} year={year} setMonth={setMonth} setYear={setYear}/>}
        {section==="settings"&&<SettingsSection cats={cats} setCats={setCats} specialCatsList={specialCatsList} setSpecialCatsList={setSpecialCatsList} menuConceptsList={menuConceptsList} setMenuConceptsList={setMenuConceptsList}/>}
      </div>
    </div>
  );
}
