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
    const subscription = typeof sub.subscription === 'string'
      ? JSON.parse(sub.subscription)
      : sub.subscription;
    if(!subscription?.endpoint) return;
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body })
    );
    console.log('push sent successfully to:',subscription.endpoint?.slice(0,50));
  } catch (e) {
    console.error('push error:', e.message);
  }
}

export default async function handler(req, res) {
  console.log('cron-notify handler started, method:', req.method);
  console.log('VAPID email:', process.env.VAPID_EMAIL);
  console.log('VAPID public key exists:', !!process.env.VAPID_PUBLIC_KEY);
  console.log('VAPID private key exists:', !!process.env.VAPID_PRIVATE_KEY);
  // וודא שזה קריאה מ-Vercel Cron
  const validAuth=req.headers.authorization===`Bearer ${process.env.CRON_SECRET}`;
  const validTest=req.query.secret===process.env.CRON_SECRET;
  if(!validAuth&&!validTest){
    return res.status(401).end();
  }
  // אפשר POST בלבד לVercel Cron, GET רק לבדיקות
  if(req.method!=="POST"&&req.method!=="GET"){
    return res.status(405).end();
  }
  res.setHeader('Cache-Control','no-store');
  console.log('auth passed, starting price alerts');

  try {
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
            const absOk=true; // TEST MODE
            const direction=a.alert_direction||'both';
            const dirOk=direction==='both'
              ||(direction==='up'&&changePct>0)
              ||(direction==='down'&&changePct<0);
            if(absOk&&dirOk){
              const dir=changePct>0?" ↑":" ↓";
              triggered.push({msg:`${a.security}: ${Math.abs(changePct).toFixed(2)}%${dir}`,deviceId:a.alert_device_id||'all',ticker});
            }
          });

          if(triggered.length){
            const {data:subs}=await supabase.from('push_subscriptions').select('*');
            if(subs?.length){
              // קבץ התראות לפי device_id
              const byDevice={};
              triggered.forEach(t=>{
                const did=t.deviceId||'all';
                if(!byDevice[did])byDevice[did]=[];
                byDevice[did].push(t.msg);
              });
              for(const [deviceId,msgs] of Object.entries(byDevice)){
                const targets=deviceId==='all'?subs:subs.filter(s=>s.device_id===deviceId);
                for(const sub of targets){
                  await sendPushNotification(sub,{title:`שינוי במחירי ניירות (${msgs.length})`,body:msgs.join('\n')});
                }
              }
            }
            // אפס snapshots שהתראה נשלחה עליהם
            const resetUpserts=triggered.map(t=>{
              const price=currentPrices[t.ticker];
              return t.ticker&&price?{ticker:t.ticker,price,updated_at:new Date().toISOString()}:null;
            }).filter(Boolean);
            if(resetUpserts.length) await supabase.from('price_snapshots').upsert(resetUpserts,{onConflict:'ticker'});
          }
        }
      }
    } catch(e){
      console.error('price alert error:',e);
    }
    console.log('price alerts done, checking split notification');

    // ── התראת "מי מעביר למי" — ב-5 לחודש בלבד ──
    const todayDate=new Date();
    const forceRun=req.query.force==="1";
    if(forceRun||todayDate.getDate()===5){
      console.log('its the 5th, running split notification');
      try{
        console.log('fetching expenses for split...');
        const now=new Date();
        const year=now.getFullYear();
        // חודש קודם
        const month=now.getMonth()===0?11:now.getMonth()-1;
        const year2=now.getMonth()===0?now.getFullYear()-1:now.getFullYear();
        const startOfMonth=new Date(year2,month,1).toISOString().slice(0,10);
        const endOfMonth=new Date(year2,month+1,0).toISOString().slice(0,10);

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

          const {data:subs,error:subsError}=await supabase.from('push_subscriptions').select('*');
          console.log('subs count:',subs?.length,'error:',subsError);
          if(subs?.length){
            for(const sub of subs){
              console.log('sending to device:',sub.device_id,'owner:',sub.owner);
              await sendPushNotification(sub,{
                title:`חלוקת הוצאות - ${MONTHS_HE[month]}`,
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
  } catch(e) {
    console.error('cron-notify fatal error:', e.message, e.stack);
    return res.status(500).json({error: e.message});
  }
}
