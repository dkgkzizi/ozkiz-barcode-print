const { withClient } = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const result = await withClient((client) =>
      client.query(
        `SELECT id, barcode, quantity, note, sku, option, source, status, created_at AS "createdAt"
         FROM public.print_jobs
         WHERE status <> 'printed'
         ORDER BY created_at DESC`
      )
    );
    res.status(200).json(result.rows);
    return;
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    const barcode = payload.barcode || '0000000000000';
    const quantity = Number(payload.quantity || 1);
    const note = payload.note || '';
    const sku = payload.sku || '';
    const option = payload.option || '';
    const source = payload.source || 'mobile';

    const job = await withClient(async (client) => {
      const existing = await client.query(
        `SELECT id, quantity, created_at AS "createdAt"
         FROM public.print_jobs
         WHERE barcode = $1 AND status = 'pending'
         LIMIT 1`,
        [barcode]
      );

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        const nextQuantity = row.quantity + quantity;
        await client.query(`UPDATE public.print_jobs SET quantity = $2 WHERE id = $1`, [row.id, nextQuantity]);
        return { id: row.id, barcode, quantity: nextQuantity, note, sku, option, source, status: 'pending', createdAt: row.createdAt };
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = new Date();
      await client.query(
        `INSERT INTO public.print_jobs (id, barcode, quantity, note, sku, option, source, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8)`,
        [id, barcode, quantity, note, sku, option, source, createdAt]
      );
      return { id, barcode, quantity, note, sku, option, source, status: 'pending', createdAt: createdAt.toISOString() };
    });

    res.status(201).json(job);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
