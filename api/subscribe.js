export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const subscription = req.body;
  
  // שמור ב-KV store של Vercel או קובץ זמני
  // כרגע נשמור ב-environment variable זמני
  console.log('New subscription:', JSON.stringify(subscription));
  
  // TODO: בעתיד — שמור ב-Supabase
  res.status(200).json({ success: true });
}