const { withClient } = require('../lib/db');
const { compareProductsByOption } = require('../lib/sort');
const { sampleProducts, searchProducts } = require('../lib/productSearch');

function buildSearchTokens(query = '') {
  return String(query || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const SIZE_TOKEN_PATTERN = /^(\d{2,4}|XXS|XS|S|M|L|XL|XXL|FREE|F)$/i;

function isSizeToken(token) {
  return SIZE_TOKEN_PATTERN.test(token);
}

function escapeRegex(token) {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function fetchProductByBarcode(barcode) {
  return withClient(async (client) => {
    const result = await client.query(
      `SELECT
        "고유키" AS id,
        "상품명" AS name,
        "바코드" AS barcode,
        "상품코드" AS sku,
        "옵션" AS option
      FROM public.products
      WHERE "바코드" = $1
      ORDER BY "업로드일시" DESC
      LIMIT 5`,
      [barcode]
    );

    return (result.rows || []).map((row) => ({
      id: row.id || '',
      name: row.name || '',
      barcode: row.barcode || '',
      sku: row.sku || '',
      option: row.option || ''
    }));
  });
}

async function fetchProductsFromSupabase(query) {
  const tokens = buildSearchTokens(query);
  if (!tokens.length) {
    return [];
  }

  return withClient(async (client) => {
    const whereClauses = tokens.map((token, index) => {
      const paramIndex = index + 1;
      if (isSizeToken(token)) {
        return `"옵션" ~* $${paramIndex}`;
      }
      return `("상품명" ILIKE $${paramIndex} OR "옵션" ILIKE $${paramIndex})`;
    }).join(' AND ');

    const isLatinQuery = /[A-Za-z]/.test(query);
    const excludeArtworkClause = isLatinQuery ? ` AND "상품명" NOT ILIKE '%아트웍%'` : '';

    const params = tokens.map((token) => {
      if (isSizeToken(token)) {
        return `(^|[^A-Za-z0-9])${escapeRegex(token)}($|[^A-Za-z0-9])`;
      }
      return `%${token}%`;
    });
    const result = await client.query(
      `SELECT
        "고유키" AS id,
        "상품명" AS name,
        "바코드" AS barcode,
        "상품코드" AS sku,
        "옵션" AS option
      FROM public.products
      WHERE ${whereClauses}${excludeArtworkClause}
      ORDER BY "업로드일시" DESC
      LIMIT 30`,
      params
    );

    const products = (result.rows || []).map((row) => ({
      id: row.id || '',
      name: row.name || '',
      barcode: row.barcode || '',
      sku: row.sku || '',
      option: row.option || ''
    }));

    products.sort(compareProductsByOption);
    return products;
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const barcode = String(req.query.barcode || '').trim();
  if (barcode) {
    try {
      const products = await fetchProductByBarcode(barcode);
      res.status(200).json({ products, source: products.length ? 'supabase' : 'none' });
    } catch (error) {
      console.error('Supabase barcode lookup failed:', error.message);
      res.status(200).json({ products: [], source: 'none' });
    }
    return;
  }

  const query = String(req.query.query || '');
  if (!query.trim()) {
    res.status(200).json({ products: [], source: 'none' });
    return;
  }

  try {
    const products = await fetchProductsFromSupabase(query);
    if (products.length > 0) {
      res.status(200).json({ products, source: 'supabase' });
      return;
    }
  } catch (error) {
    console.error('Supabase lookup failed, falling back to sample data:', error.message);
  }

  res.status(200).json({ products: searchProducts(sampleProducts, query), source: 'sample' });
};
