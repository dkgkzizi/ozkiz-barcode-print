const { withClient } = require('./lib/db');

withClient(async (client) => {
  console.log('CONNECTED');
  const columns = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' ORDER BY ordinal_position");
  console.log('COLUMNS');
  console.log(JSON.stringify(columns.rows, null, 2));
  const sample = await client.query('SELECT * FROM public.products LIMIT 10');
  console.log('SAMPLE');
  console.log(JSON.stringify(sample.rows, null, 2));
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
