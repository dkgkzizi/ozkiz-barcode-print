const sampleProducts = [
  { id: 'sample-001', name: '삼성 갤럭시 배터리', barcode: '8801234567890', sku: 'BAT-001' },
  { id: 'sample-002', name: '애플 에어팟 케이스', barcode: '8809876543210', sku: 'CASE-002' },
  { id: 'sample-003', name: '로지텍 무선 마우스', barcode: '8801111222233', sku: 'MOUSE-003' },
  { id: 'sample-004', name: '한성 노트북 거치대', barcode: '8805555666677', sku: 'STAND-004' },
  { id: 'sample-005', name: 'LG 스피커', barcode: '8804444333322', sku: 'SPEAKER-005' }
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9가-힣\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDisplayName(item) {
  return item.name || item.product_name || item.productName || item.item_name || item.goods_name || item.title || '상품명 없음';
}

function getBarcode(item) {
  return item.barcode || item.barcode_no || item.barcodeNumber || item.barcode_number || item.code || '';
}

function getSku(item) {
  return item.sku || item.product_code || item.code || item.item_code || '';
}

function normalizeProduct(item) {
  return {
    id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: getDisplayName(item),
    barcode: getBarcode(item),
    sku: getSku(item),
    raw: item
  };
}

function searchProducts(items, query = '') {
  const normalizedQuery = normalizeText(query);
  const sourceItems = Array.isArray(items) ? items : [];

  if (!normalizedQuery) {
    return sourceItems.slice(0, 10).map(normalizeProduct);
  }

  const matches = sourceItems.filter((item) => {
    const name = normalizeText(getDisplayName(item));
    const barcode = normalizeText(getBarcode(item));
    const sku = normalizeText(getSku(item));
    const searchable = `${name} ${barcode} ${sku}`;
    return searchable.includes(normalizedQuery);
  });

  return matches.slice(0, 20).map(normalizeProduct);
}

module.exports = {
  sampleProducts,
  searchProducts,
  normalizeText,
  normalizeProduct
};
