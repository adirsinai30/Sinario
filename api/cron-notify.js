import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushNotification(sub, { title, body }) {
  try {
    await webpush.sendNotification(
      sub.subscription,
      JSON.stringify({ title, body })
    );
  } catch (e) {
    console.error('push error:', e);
  }
}

export default async function handler(req, res) {
  // וודא שזה קריאה מ-Vercel Cron
  const validAuth=req.headers.authorization===`Bearer ${process.env.CRON_SECRET}`;
  const validTest=req.query.secret===process.env.CRON_SECRET;
  if(!validAuth&&!validTest){
    return res.status(401).end();
  }

  try {
    const {data:assetsData}=await supabase
      .from('assets').select('id,security,alert_pct,alert_direction').not('alert_pct','is',null);
    const {data:snapshotsData}=await supabase
      .from('price_snapshots').select('*');

    if(assetsData?.length&&snapshotsData?.length){
      const snapMap={};
      snapshotsData.forEach(s=>{snapMap[s.ticker]=+s.price;});

      const tickers=[...new Set(assetsData.map(a=>{
        const m=a.security.match(/\(([^)]+)\)/);
        return m?m[1]:a.security.split(' ')[0];
      }))];

      const priceRes=await fetch(`https://sinario.vercel.app/api/prices`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({tickers})
      });

      if(priceRes.ok){
        const currentPrices=await priceRes.json();
        const triggered=[];

        assetsData.forEach(a=>{
          const m=a.security.match(/\(([^)]+)\)/);
          const ticker=m?m[1]:a.security.split(' ')[0];
          const current=currentPrices[ticker];
          const snapshot=snapMap[ticker];
          if(!current||!snapshot||!a.alert_pct)return;
          const changePct=((current-snapshot)/snapshot)*100;
          const absOk=Math.abs(changePct)>=a.alert_pct;
          const direction=a.alert_direction||'both';
          const dirOk=direction==='both'
            ||(direction==='up'&&changePct>0)
            ||(direction==='down'&&changePct<0);
          if(absOk&&dirOk){
            const dir=changePct>0?"↑ עלה":"↓ ירד";
            triggered.push({msg:`${a.security} ${dir} ${Math.abs(changePct).toFixed(2)}%`});
          }
        });

        if(triggered.length){
          const {data:subs}=await supabase.from('push_subscriptions').select('*');
          if(subs?.length){
            for(const sub of subs){
              await sendPushNotification(sub,{
                title:'התראת מחיר — Sinario',
                body:triggered.map(t=>t.msg).join(' | ')
              });
            }
          }
        }
      }
    }
  } catch(e){
    console.error('price alert error:',e);
  }

  // ── התראת "מי מעביר למי" — ב-5 לחודש בלבד ──
  const todayDate=new Date();
  if(todayDate.getDate()===5){
    try{
      const now=new Date();
      const year=now.getFullYear();
      const month=now.getMonth();
      const startOfMonth=new Date(year,month,1).toISOString().slice(0,10);
      const endOfMonth=new Date(year,month+1,0).toISOString().slice(0,10);

      const [{data:expData},{data:spData}]=await Promise.all([
        supabase.from('expenses').select('amount,who')
          .gte('date',startOfMonth).lte('date',endOfMonth),
        supabase.from('special_expenses').select('amount,currency,rate_used,who')
          .gte('date',startOfMonth).lte('date',endOfMonth)
      ]);

      const adirTotal=(expData||[]).filter(e=>e.who==="א").reduce((s,e)=>s+(+e.amount),0)
        +(spData||[]).filter(e=>e.who==="א").reduce((s,e)=>s+(+e.amount)*(+e.rate_used||1),0);
      const sapirTotal=(expData||[]).filter(e=>e.who==="ס").reduce((s,e)=>s+(+e.amount),0)
        +(spData||[]).filter(e=>e.who==="ס").reduce((s,e)=>s+(+e.amount)*(+e.rate_used||1),0);

      const diff=Math.abs(adirTotal-sapirTotal)/2;
      if(diff>5){
        const from=adirTotal>sapirTotal?"ספיר":"אדיר";
        const to=from==="אדיר"?"ספיר":"אדיר";
        const verb=from==="ספיר"?"מעבירה":"מעביר";
        const MONTHS_HE=["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

        const {data:subs}=await supabase.from('push_subscriptions').select('*');
        if(subs?.length){
          for(const sub of subs){
            await sendPushNotification(sub,{
              title:`Sinario — חלוקת הוצאות ${MONTHS_HE[month]}`,
              body:`${from} ${verb} ל${to}: ₪${Math.round(diff).toLocaleString('he-IL')}`
            });
          }
        }
      }
    }catch(e){
      console.error('split notification error:',e);
    }
  }

  res.status(200).json({ sent: true });
}
