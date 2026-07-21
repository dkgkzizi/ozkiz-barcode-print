const { withClient } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const result = await withClient((client) =>
      client.query(
        `SELECT id, barcode, note, sku, option, source, printed_at AS "printedAt"
         FROM public.print_logs
         ORDER BY printed_at DESC
         LIMIT 200`
      )
    );

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
