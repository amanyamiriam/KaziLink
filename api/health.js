export default async function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    app: 'KaziLink API',
    database: process.env.SUPABASE_URL ? 'supabase' : 'memory',
  });
}
