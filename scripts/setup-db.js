const { withClient } = require('../lib/db');

async function main() {
  await withClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.print_jobs (
        id text PRIMARY KEY,
        barcode text NOT NULL,
        quantity integer NOT NULL DEFAULT 1,
        note text DEFAULT '',
        sku text DEFAULT '',
        option text DEFAULT '',
        source text DEFAULT 'mobile',
        status text NOT NULL DEFAULT 'pending',
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.print_logs (
        id text PRIMARY KEY,
        barcode text NOT NULL,
        note text DEFAULT '',
        sku text DEFAULT '',
        option text DEFAULT '',
        source text DEFAULT 'mobile',
        printed_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  });

  console.log('print_jobs / print_logs tables ready');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
