const { withClient } = require('./lib/db');

async function main() {
  const queries = ['톡톡크롭', '부츠 스위티리본', '스위티리본 레드 180'];

  await withClient(async (client) => {
    for (const q of queries) {
      console.log(`\n=== QUERY: ${q} ===`);
      const res = await client.query(
        `SELECT "고유키" AS id, "상품명" AS name, "바코드" AS barcode, "상품코드" AS sku, "옵션" AS option
         FROM public.products
         WHERE ("상품명" ILIKE $1 OR "옵션" ILIKE $1)
         ORDER BY "업로드일시" DESC
         LIMIT 20`,
        [`%${q}%`]
      );
      console.log('BASIC NAME_OPTION COUNT', res.rowCount);
      console.log(res.rows);

      const tokens = q.trim().split(/\s+/).map((token) => `%${token}%`);
      if (tokens.length > 1) {
        const conditions = tokens.map((_, idx) => `("상품명" ILIKE $${idx + 1} OR "옵션" ILIKE $${idx + 1})`).join(' AND ');
        const res2 = await client.query(
          `SELECT "고유키" AS id, "상품명" AS name, "바코드" AS barcode, "상품코드" AS sku, "옵션" AS option
           FROM public.products
           WHERE ${conditions}
           ORDER BY "업로드일시" DESC
           LIMIT 20`,
          tokens
        );
        console.log('TOKEN AND COUNT', res2.rowCount);
        console.log(res2.rows);
      }
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
