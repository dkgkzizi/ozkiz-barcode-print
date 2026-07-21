const { withClient } = require('./lib/db');

async function search(client, q) {
  const result = await client.query(
    `SELECT "상품명", "바코드", "상품코드", "고유키" FROM public.products
     WHERE ("상품명" ILIKE '%' || $1 || '%' OR "상품코드" ILIKE '%' || $1 || '%' OR "바코드" ILIKE '%' || $1 || '%')
     LIMIT 100`,
    [q]
  );
  console.log('QUERY:', q, 'COUNT:', result.rows.length);
  console.log(result.rows.slice(0, 20));
}

withClient(async (client) => {
  await search(client, '세트-두근하트');
  await search(client, '상의-톡톡크롭');
  await search(client, '상의');
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
