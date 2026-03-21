export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code } = req.body;
  const valid = code === process.env.ACCESS_CODE;
  res.status(200).json({ valid });
}