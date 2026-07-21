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
    const job = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      barcode: payload.barcode || '0000000000000',
      quantity: Number(payload.quantity || 1),
      note: payload.note || '',
      sku: payload.sku || '',
      option: payload.option || '',
      source: payload.source || 'mobile',
      status: 'pending'
    };

    const createdAt = new Date();

    await withClient((client) =>
      client.query(
        `INSERT INTO public.print_jobs (id, barcode, quantity, note, sku, option, source, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [job.id, job.barcode, job.quantity, job.note, job.sku, job.option, job.source, job.status, createdAt]
      )
    );

    res.status(201).json({ ...job, createdAt: createdAt.toISOString() });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
