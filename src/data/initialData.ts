import { Transaction, Debt, Goal, SavingsTip, CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { 
    code: 'CLP', 
    symbol: '$', 
    name: 'Peso Chileno (CLP)', 
    country: 'Chile',
    locale: 'es-CL', 
    decimals: 0,
    thousandSeparator: '.',
    decimalSeparator: ',',
    example: '$ 1.200.000',
    rateToUSD: 940.0 
  },
  { 
    code: 'USD', 
    symbol: '$', 
    name: 'Dólar Estadounidense (USD)', 
    country: 'Internacional / USA',
    locale: 'en-US', 
    decimals: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    example: '$ 12.95',
    rateToUSD: 1.0 
  },
  { 
    code: 'EUR', 
    symbol: '€', 
    name: 'Euro (EUR)', 
    country: 'Unión Europea',
    locale: 'es-ES', 
    decimals: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    example: '1.200,00 €',
    rateToUSD: 0.92 
  },
  { 
    code: 'MXN', 
    symbol: '$', 
    name: 'Peso Mexicano (MXN)', 
    country: 'México',
    locale: 'es-MX', 
    decimals: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    example: '$ 1,250.00',
    rateToUSD: 19.5 
  },
  { 
    code: 'COP', 
    symbol: '$', 
    name: 'Peso Colombiano (COP)', 
    country: 'Colombia',
    locale: 'es-CO', 
    decimals: 0,
    thousandSeparator: '.',
    decimalSeparator: ',',
    example: '$ 1.200.000',
    rateToUSD: 4150.0 
  },
  { 
    code: 'PEN', 
    symbol: 'S/', 
    name: 'Sol Peruano (PEN)', 
    country: 'Perú',
    locale: 'es-PE', 
    decimals: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    example: 'S/ 1,250.00',
    rateToUSD: 3.75 
  },
  { 
    code: 'ARS', 
    symbol: '$', 
    name: 'Peso Argentino (ARS)', 
    country: 'Argentina',
    locale: 'es-AR', 
    decimals: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
    example: '$ 1.200,00',
    rateToUSD: 980.0 
  },
];

// Default categories requested by the user
export const DEFAULT_INCOME_CATEGORIES = [
  'Sueldo / Salario',
  'Ventas & Clientes',
  'Honorarios / Servicios',
  'Inversiones & Dividendos',
  'Arriendos Cobrados',
  'Bonos & Comisiones',
  'Otros Ingresos'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Arriendo / Hipoteca',
  'Luz & Electricidad',
  'Agua Potable',
  'Gas',
  'Internet & Teléfono',
  'Supermercado & Alimentos',
  'Recreación & Salidas',
  'Transporte & Combustible',
  'Salud & Seguros',
  'Educación & Cursos',
  'Suscripciones & Streaming',
  'Nómina & Talento',
  'Infraestructura & Cloud',
  'Marketing & Publicidad',
  'Mantenimiento & Hogar',
  'Impuestos',
  'Amortización de Deuda',
  'Otros Gastos'
];

// Realistic starter savings tips written in natural, relatable Spanish
export const STARTER_SAVINGS_TIPS: SavingsTip[] = [
  {
    id: 'tip-starter-1',
    title: 'Revisa las suscripciones que ya no ocupas',
    category: 'Suscripciones & Streaming',
    description: 'Revisa Netflix, Spotify, gimnasio o apps que pagas todos los meses pero casi no abres. Cancelar un par te libera plata de inmediato.',
    estimatedMonthlySavings: 25000,
    estimatedAnnualSavings: 300000,
    difficulty: 'easy',
    actionType: 'subscription_audit',
    isApplied: false
  },
  {
    id: 'tip-starter-2',
    title: 'Apaga luces y desenchufa lo que no uses',
    category: 'Luz & Electricidad',
    description: 'Dejar cargadores enchufados, luces prendidas o la calefacción al máximo todo el día suma bastante en la cuenta a fin de mes.',
    estimatedMonthlySavings: 18000,
    estimatedAnnualSavings: 216000,
    difficulty: 'easy',
    actionType: 'energy_telecom',
    isApplied: false
  },
  {
    id: 'tip-starter-3',
    title: 'Llama a tu compañía de internet y teléfono',
    category: 'Internet & Teléfono',
    description: 'Si llevas más de un año con el mismo plan, llama para pedir una rebaja o amenaza con cambiarte. Casi siempre te ofrecen un descuento del 20% al 30%.',
    estimatedMonthlySavings: 15000,
    estimatedAnnualSavings: 180000,
    difficulty: 'medium',
    actionType: 'supplier_renegotiation',
    isApplied: false
  },
  {
    id: 'tip-starter-4',
    title: 'Ve al supermercado con lista y sin hambre',
    category: 'Supermercado & Alimentos',
    description: 'Comprar con una lista clara y comprar cosas no perecibles por mayor o en oferta evita compras por impulso y rinde mucho más.',
    estimatedMonthlySavings: 45000,
    estimatedAnnualSavings: 540000,
    difficulty: 'medium',
    actionType: 'operational_efficiency',
    isApplied: false
  },
  {
    id: 'tip-starter-5',
    title: 'La regla de las 48 horas para caprichos',
    category: 'Recreación & Salidas',
    description: 'Cuando veas algo que quieras comprarte por impulso, espera 2 días. Si después de 48 horas aún lo necesitas, cómpralo; si no, te ahorraste esa plata.',
    estimatedMonthlySavings: 35000,
    estimatedAnnualSavings: 420000,
    difficulty: 'easy',
    actionType: 'discretionary_cut',
    isApplied: false
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_DEBTS: Debt[] = [];
export const INITIAL_GOALS: Goal[] = [];
export const INITIAL_SAVINGS_TIPS: SavingsTip[] = STARTER_SAVINGS_TIPS;

export const CATEGORY_COLORS: Record<string, string> = {
  'Sueldo / Salario': '#10B981',
  'Ventas & Clientes': '#059669',
  'Honorarios / Servicios': '#3B82F6',
  'Inversiones & Dividendos': '#8B5CF6',
  'Arriendos Cobrados': '#06B6D4',
  'Otros Ingresos': '#14B8A6',
  
  'Arriendo / Hipoteca': '#F43F5E',
  'Luz & Electricidad': '#F59E0B',
  'Agua Potable': '#06B6D4',
  'Gas': '#FB923C',
  'Internet & Teléfono': '#8B5CF6',
  'Supermercado & Alimentos': '#EC4899',
  'Recreación & Salidas': '#A855F7',
  'Transporte & Combustible': '#64748B',
  'Salud & Seguros': '#EF4444',
  'Educación & Cursos': '#3B82F6',
  'Suscripciones & Streaming': '#6366F1',
  'Nómina & Talento': '#E11D48',
  'Infraestructura & Cloud': '#D97706',
  'Marketing & Publicidad': '#BE185D',
  'Amortización de Deuda': '#EAB308',
  'Otros Gastos': '#94A3B8',
};

/**
 * Live formatter for currency inputs with dynamic dots/commas as the user types.
 */
export const formatCurrencyInputLive = (valStr: string | number | undefined | null, currCode: string = 'CLP'): string => {
  if (valStr === undefined || valStr === null || valStr === '') return '';
  const str = typeof valStr === 'number' ? (isNaN(valStr) ? '' : valStr.toString()) : valStr;

  // Currencies using dot '.' as thousand separator and comma ',' as decimal separator (CLP, COP, EUR, ARS)
  if (currCode === 'CLP' || currCode === 'COP' || currCode === 'EUR' || currCode === 'ARS') {
    const clean = str.replace(/[^\d,]/g, '');
    const parts = clean.split(',');
    const intPart = (parts[0] || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (parts.length > 1) {
      return `${intPart},${parts[1].slice(0, 2)}`;
    }
    return intPart;
  }

  // Currencies using comma ',' as thousand separator and dot '.' as decimal separator (USD, MXN, PEN)
  const clean = str.replace(/[^\d.]/g, '');
  const parts = clean.split('.');
  const intPart = (parts[0] || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) {
    return `${intPart}.${parts[1].slice(0, 2)}`;
  }
  return intPart;
};

/**
 * Parser from live formatted input string to clean numeric float.
 */
export const parseCurrencyInputRaw = (valStr: string | number | undefined | null, currCode: string = 'CLP'): number => {
  if (valStr === undefined || valStr === null || valStr === '') return 0;
  if (typeof valStr === 'number') return isNaN(valStr) ? 0 : valStr;

  if (currCode === 'CLP' || currCode === 'COP' || currCode === 'EUR' || currCode === 'ARS') {
    const normalized = valStr.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }
  const normalized = valStr.replace(/,/g, '');
  return parseFloat(normalized) || 0;
};
