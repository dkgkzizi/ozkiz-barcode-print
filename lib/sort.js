function parseOptionParts(option) {
  const raw = String(option || '').trim();
  if (!raw) {
    return { color: '', sizeText: '', sizeNumber: NaN };
  }

  const normalized = raw.replace(/[;：]/g, ',').replace(/\s+/g, ' ').trim();
  const parts = normalized.split(',').map((part) => part.trim()).filter(Boolean);

  let color = '';
  let sizeText = '';
  if (parts.length === 1) {
    const text = parts[0];
    const sizeMatch = text.match(/(\d+(?:\.\d+)?)/);
    if (sizeMatch) {
      sizeText = sizeMatch[0];
      color = text.replace(sizeMatch[0], '').replace(/[:\-]/g, '').trim();
    } else {
      color = text;
    }
  } else {
    color = parts[0] || '';
    sizeText = parts[1] || '';
  }

  const sizeNumber = parseFloat(sizeText.replace(/[^0-9.]/g, ''));
  return { color, sizeText, sizeNumber };
}

function compareProductsByOption(a, b) {
  const nameCompare = String(a.name || '').localeCompare(String(b.name || ''), 'ko');
  if (nameCompare !== 0) return nameCompare;

  const optionA = parseOptionParts(a.option);
  const optionB = parseOptionParts(b.option);

  const colorCompare = optionA.color.localeCompare(optionB.color, 'ko');
  if (colorCompare !== 0) return colorCompare;

  const hasSizeA = !Number.isNaN(optionA.sizeNumber);
  const hasSizeB = !Number.isNaN(optionB.sizeNumber);
  if (hasSizeA && hasSizeB) return optionA.sizeNumber - optionB.sizeNumber;
  if (hasSizeA !== hasSizeB) return hasSizeA ? -1 : 1;
  return optionA.sizeText.localeCompare(optionB.sizeText, 'ko');
}

module.exports = { parseOptionParts, compareProductsByOption };
