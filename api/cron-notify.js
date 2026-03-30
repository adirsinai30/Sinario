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
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  try {
    const {data:assetsData}=await supabase
      .from('assets').select('id,security,alert_pct').not('alert_pct','is',null);
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
          if(Math.abs(changePct)>=a.alert_pct){
            const dir=current>snapshot?"עלה":"ירד";
            triggered.push(`${a.security} ${dir} ${changePct.toFixed(2)}%`);
          }
        });

        if(triggered.length){
          const {data:subs}=await supabase.from('push_subscriptions').select('*');
          if(subs?.length){
            for(const sub of subs){
              await sendPushNotification(sub,{
                title:'התראת מחיר — Sinario',
                body:triggered.join(' | ')
              });
            }
          }
        }
      }
    }
  } catch(e){
    console.error('price alert error:',e);
  }

  res.status(200).json({ sent: true });
}
