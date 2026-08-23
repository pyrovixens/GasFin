export interface ParsedReceipt {
  vendor: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  detectedTotalLine?: string;
  rawExtractedLines: string[];
}

/**
 * Clean a numeric string from receipts (supports CLP, USD, EUR formats, points and commas)
 */
export function cleanNumericAmount(rawStr: string): number {
  if (!rawStr) return 0;
  
  // Remove currency symbols, dashes, and extra spaces
  let cleaned = rawStr.replace(/[\$\€\£\s\-]/g, '').trim();

  // If format is like 15.990,00 or 15,990.00
  if (/\d+[.,]\d{3}[.,]\d{2}$/.test(cleaned)) {
    // Has thousands separator and 2 decimal places
    cleaned = cleaned.replace(/[.,](\d{2})$/, '@$1'); // mark decimals
    cleaned = cleaned.replace(/[.,]/g, ''); // remove thousand separators
    cleaned = cleaned.replace('@', '.'); // restore decimal
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.round(parsed);
  }

  // If format is like 15.990 or 15,990 (Chilean standard without decimals)
  if (/^\d{1,3}([.,]\d{3})+$/.test(cleaned)) {
    cleaned = cleaned.replace(/[.,]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  // If format is plain integer or decimal like 15990 or 15.50
  cleaned = cleaned.replace(/[.,]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extract numbers from a line
 */
function extractNumbersFromLine(line: string): number[] {
  const numberMatches = Array.from(line.matchAll(/(?:\$\s*)?([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]{2,10})/g));
  const results: number[] = [];
  
  for (const m of numberMatches) {
    const val = cleanNumericAmount(m[1]);
    // Ignore small quantities (1-4) or large timestamps/years/rut unless reasonable
    if (val >= 50 && val < 500000000 && val !== 2024 && val !== 2025 && val !== 2026) {
      results.push(val);
    }
  }
  return results;
}

/**
 * Master parser for raw OCR receipt text
 */
export function parseReceiptText(rawText: string): ParsedReceipt {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let vendor = 'Comercio / Proveedor';
  let amount = 0;
  let date = new Date().toISOString().split('T')[0];
  let category = 'Otros Gastos';
  let detectedTotalLine: string | undefined;

  // -------------------------------------------------------------
  // 1. VENDOR / MERCHANT DETECTION
  // -------------------------------------------------------------
  const headerIgnoreWords = /rut|boleta|factura|ticket|electronica|sii|giro|fecha|hora|caja|cajero|folio|atendido|bienvenido|gracias|compra|venta|numero|sucursal|direccion|telefono|tel\.|av\.|calle/i;
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    if (line.length >= 3 && !/^\d+$/.test(line) && !headerIgnoreWords.test(line)) {
      const cleanVendor = line.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.&-]/g, '').trim();
      if (cleanVendor.length >= 3 && !/^\d+$/.test(cleanVendor)) {
        vendor = cleanVendor;
        break;
      }
    }
  }

  // -------------------------------------------------------------
  // 2. REAL DATE DETECTION (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
  // -------------------------------------------------------------
  const dateRegex = /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b|\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      try {
        if (match[1] && match[2] && match[3]) {
          let day = parseInt(match[1], 10);
          let month = parseInt(match[2], 10);
          let year = parseInt(match[3], 10);
          if (year < 100) year += 2000;
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2050) {
            date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            break;
          }
        } else if (match[4] && match[5] && match[6]) {
          let year = parseInt(match[4], 10);
          let month = parseInt(match[5], 10);
          let day = parseInt(match[6], 10);
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2050) {
            date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            break;
          }
        }
      } catch {
        // keep default date
      }
    }
  }

  // -------------------------------------------------------------
  // 3. REAL AMOUNT DETECTION (THE "TOTAL" GOLDEN RULE)
  // -------------------------------------------------------------
  
  // High-priority Grand Total indicators (Excludes SUBTOTAL, EXENTO, IVA)
  // Regex matches: TOTAL A PAGAR, TOTAL FINAL, MONTO TOTAL, VALOR TOTAL, TOTAL COMPRA, TOTAL VENTA, TOTAL CLP, TOTAL $, TOTAL:, T0TAL, TOT4L, T O T A L
  const grandTotalRegex = /(?:TOTAL\s*A\s*PAGAR|TOTAL\s*FINAL|MONTO\s*TOTAL|VALOR\s*TOTAL|TOTAL\s*COMPRA|TOTAL\s*VENTA|TOTAL\s*BOLETA|TOTAL\s*PAGADO|IMPORTE\s*TOTAL|SALDO\s*TOTAL|TOTAL\s*CLP|TOTAL\s*\$|TOTAL\s*:|\bT[O0o][T4]A[LlI1]\b|\bT\s*O\s*T\s*A\s*L\b)/i;

  const subtotalRegex = /SUBTOTAL|SUB-TOTAL|SUB\s*TOTAL|EXENTO|NETO|IVA|DESCUENTO/i;

  // Search from bottom up or top down, preferring pure GRAND TOTAL lines over SUBTOTAL lines
  let candidates: Array<{ line: string; amount: number; score: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : undefined;

    const isGrandTotal = grandTotalRegex.test(line) && !subtotalRegex.test(line);
    const isSubtotal = subtotalRegex.test(line);

    if (isGrandTotal || isSubtotal) {
      // 1. Same line check
      const lineNumbers = extractNumbersFromLine(line);
      if (lineNumbers.length > 0) {
        const lastVal = lineNumbers[lineNumbers.length - 1];
        candidates.push({
          line,
          amount: lastVal,
          score: isGrandTotal ? 100 : 20
        });
      } else if (nextLine) {
        // 2. Next line check
        const nextLineNumbers = extractNumbersFromLine(nextLine);
        if (nextLineNumbers.length > 0) {
          const lastVal = nextLineNumbers[nextLineNumbers.length - 1];
          candidates.push({
            line: `${line} -> ${nextLine}`,
            amount: lastVal,
            score: isGrandTotal ? 90 : 10
          });
        }
      }
    }
  }

  // Sort candidates by score (highest score first). If tied, pick the last one in the receipt (final summary)
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    // If top candidates have highest score, pick the one lowest down on the receipt
    const highestScore = candidates[0].score;
    const topScored = candidates.filter(c => c.score === highestScore);
    const chosen = topScored[topScored.length - 1];
    
    amount = chosen.amount;
    detectedTotalLine = chosen.line;
  }

  // Phase C: Fallback to largest reasonable number if no keywords matched
  if (amount === 0) {
    const candidateNumbers: number[] = [];
    for (const line of lines) {
      const lineNums = extractNumbersFromLine(line);
      candidateNumbers.push(...lineNums);
    }
    if (candidateNumbers.length > 0) {
      amount = Math.max(...candidateNumbers);
      detectedTotalLine = `Cifra máxima detectada: $ ${amount}`;
    }
  }

  // -------------------------------------------------------------
  // 4. REAL CATEGORY CLASSIFICATION
  // -------------------------------------------------------------
  const lowerFull = rawText.toLowerCase();
  
  if (
    lowerFull.includes('super') || 
    lowerFull.includes('lider') || 
    lowerFull.includes('jumbo') || 
    lowerFull.includes('unimarc') || 
    lowerFull.includes('santa isabel') || 
    lowerFull.includes('tottus') || 
    lowerFull.includes('mayorista') || 
    lowerFull.includes('albarrote') || 
    lowerFull.includes('panaderia') || 
    lowerFull.includes('lacteo') || 
    lowerFull.includes('carniceria') || 
    lowerFull.includes('verdura') || 
    lowerFull.includes('alimento') || 
    lowerFull.includes('coca cola') || 
    lowerFull.includes('arroz') || 
    lowerFull.includes('aceite')
  ) {
    category = 'Supermercado & Alimentos';
  } else if (
    lowerFull.includes('copec') || 
    lowerFull.includes('shell') || 
    lowerFull.includes('petrobras') || 
    lowerFull.includes('combustible') || 
    lowerFull.includes('gasolina') || 
    lowerFull.includes('93 oct') || 
    lowerFull.includes('95 oct') || 
    lowerFull.includes('97 oct') || 
    lowerFull.includes('diesel') || 
    lowerFull.includes('uber') || 
    lowerFull.includes('didi') || 
    lowerFull.includes('cabify') || 
    lowerFull.includes('peaje') || 
    lowerFull.includes('tag') || 
    lowerFull.includes('estacionamiento') || 
    lowerFull.includes('metro') || 
    lowerFull.includes('autopista')
  ) {
    category = 'Transporte & Combustible';
  } else if (
    lowerFull.includes('farmacia') || 
    lowerFull.includes('cruz verde') || 
    lowerFull.includes('ahumada') || 
    lowerFull.includes('salcobrand') || 
    lowerFull.includes('dr simi') || 
    lowerFull.includes('medicamento') || 
    lowerFull.includes('remedio') || 
    lowerFull.includes('paracetamol') || 
    lowerFull.includes('ibuprofeno') || 
    lowerFull.includes('doctor') || 
    lowerFull.includes('clinica') || 
    lowerFull.includes('hospital') || 
    lowerFull.includes('dental')
  ) {
    category = 'Salud & Farmacia';
  } else if (
    lowerFull.includes('restaurant') || 
    lowerFull.includes('cafe') || 
    lowerFull.includes('bar') || 
    lowerFull.includes('starbucks') || 
    lowerFull.includes('mcdonald') || 
    lowerFull.includes('burger king') || 
    lowerFull.includes('pizza') || 
    lowerFull.includes('sushi') || 
    lowerFull.includes('pedidosya') || 
    lowerFull.includes('rappi') || 
    lowerFull.includes('uber eats') || 
    lowerFull.includes('cerveza') || 
    lowerFull.includes('propina')
  ) {
    category = 'Restaurantes & Ocio';
  } else if (
    lowerFull.includes('enel') || 
    lowerFull.includes('cge') || 
    lowerFull.includes('chilquinta') || 
    lowerFull.includes('luz') || 
    lowerFull.includes('electricidad') || 
    lowerFull.includes('aguas andinas') || 
    lowerFull.includes('esval') || 
    lowerFull.includes('essbio') || 
    lowerFull.includes('gasco') || 
    lowerFull.includes('lipigas') || 
    lowerFull.includes('abastible') || 
    lowerFull.includes('metrogas') || 
    lowerFull.includes('vtr') || 
    lowerFull.includes('movistar') || 
    lowerFull.includes('entel') || 
    lowerFull.includes('claro') || 
    lowerFull.includes('wom')
  ) {
    category = 'Servicios Básicos & Cuentas';
  } else if (
    lowerFull.includes('falabella') || 
    lowerFull.includes('ripley') || 
    lowerFull.includes('paris') || 
    lowerFull.includes('h&m') || 
    lowerFull.includes('zara') || 
    lowerFull.includes('ropa') || 
    lowerFull.includes('calzado') || 
    lowerFull.includes('sodimac') || 
    lowerFull.includes('easy') || 
    lowerFull.includes('construmart') || 
    lowerFull.includes('amazon') || 
    lowerFull.includes('aliexpress') || 
    lowerFull.includes('mercadolibre')
  ) {
    category = 'Compras & Tiendas';
  }

  return {
    vendor: vendor || 'Comercio',
    amount,
    date,
    category,
    description: `Gasto en ${vendor || 'Comercio'}`,
    detectedTotalLine,
    rawExtractedLines: lines
  };
}
