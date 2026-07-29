const { withClient } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const date = String(req.query.date || '').trim();
    const dateParam = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;

    const result = await withClient(async (client) => {
      await client.query(`DELETE FROM public.print_logs WHERE printed_at < now() - interval '7 days'`);
      return client.query(
        `SELECT id, barcode, note, sku, option, source, printed_at AS "printedAt", print_count AS "printCount"
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

  if (req.method === 'PATCH') {
    const payload = req.body || {};
    const id = String(payload.id || '');
    if (!id) {
      res.status(400).json({ error: 'id is required' });
      return;
    }

    const result = await withClient((client) =>
      client.query(
        `UPDATE public.print_logs SET print_count = print_count + 1 WHERE id = $1 RETURNING print_count AS "printCount"`,
        [id]
      )
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Log not found' });
      return;
    }

    res.status(200).json({ ok: true, printCount: result.rows[0].printCount });
    return;
  }

  if (req.method === 'DELETE') {
    await withClient((client) => client.query('DELETE FROM public.print_logs'));
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
