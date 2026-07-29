const { withClient } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const date = String(req.query.date || '').trim();
    const dateParam = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;

    const result = await withClient(async (client) => {
      await client.query(`DELETE FROM public.print_logs WHERE printed_at < now() - interval '7 days'`);
      return client.query(
        `SELECT id, barcode, note, sku, option, source, printed_at AS "printedAt"
         FROM public.print_logs
         WHERE (printed_at AT TIME ZONE 'Asia/Seoul')::date = COALESCE($1::date, (now() AT TIME ZONE 'Asia/Seoul')::date)
         ORDER BY printed_at DESC
         LIMIT 200`,
        [dateParam]
      );
    });

    res.status(200).json(result.rows);
    return;
  }

  if (req.method === 'DELETE') {
    await withClient((client) => client.query('DELETE FROM public.print_logs'));
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
