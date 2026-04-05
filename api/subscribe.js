import { createClient } from '@supabase/supabase-js';
const supabase=createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY||process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).end();
  const {device_id,owner,...subscription}=req.body;
  try{
    const {error}=await supabase.from('push_subscriptions').upsert({
      subscription:subscription,
      device_id:device_id||null,
      owner:owner||null,
      updated_at:new Date().toISOString()
    },{onConflict:'device_id'});
    if(error)throw error;
    res.status(200).json({success:true});
  }catch(e){
    res.status(500).json({error:'subscribe failed'});
  }
}
