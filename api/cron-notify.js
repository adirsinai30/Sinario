import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  // וודא שזה קריאה מ-Vercel Cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const payload = JSON.stringify({
    title: 'Sinario — סיכום חודשי',
    body: 'זמן לעדכן את הוצאות החודש 💰'
  });

  // TODO: בעתיד — קרא subscriptions מ-Supabase
  // כרגע — placeholder
  res.status(200).json({ sent: true });
}