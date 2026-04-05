export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code } = req.body;
  const envCode = process.env.ACCESS_CODE;
  console.log("=== VERIFY ACCESS ===");
  console.log("Received code:", JSON.stringify(code));
  console.log("Env ACCESS_CODE:", JSON.stringify(envCode));
  console.log("Match:", code === envCode);
  const valid = code === envCode;
  res.status(200).json({ valid });
}
