const { withClient } = require('../../lib/db');

module.exports = async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const payload = req.body || {};

    if (payload.action === 'printing' || payload.action === 'pending') {
      const result = await withClient((client) =>
        client.query(`UPDATE public.print_jobs SET status = $2 WHERE id = $1`, [id, payload.action])
      );
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (payload.action === 'printed') {
      const moved = await withClient(async (client) => {
        const found = await client.query(`SELECT * FROM public.print_jobs WHERE id = $1`, [id]);
        if (found.rows.length === 0) {
          return false;
        }
        const row = found.rows[0];
        await client.query(
          `INSERT INTO public.print_logs (id, barcode, note, sku, option, source) VALUES ($1,$2,$3,$4,$5,$6)`,
          [row.id, row.barcode, row.note, row.sku, row.option, row.source]
        );
        await client.query(`DELETE FROM public.print_jobs WHERE id = $1`, [id]);
        return true;
      });

      if (!moved) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: 'Unknown action' });
    return;
  }

  if (req.method === 'DELETE') {
    const result = await withClient((client) => client.query(`DELETE FROM public.print_jobs WHERE id = $1`, [id]));
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
