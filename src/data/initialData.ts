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

// Realistic starter savings tips that show up in Asesor IA
export const STARTER_SAVINGS_TIPS: SavingsTip[] = [
  {
    id: 'tip-starter-1',
    title: 'Auditoría de Suscripciones & Streaming',
    category: 'Suscripciones & Streaming',
    description: 'Revisa cuentas de streaming, software y apps que no utilices semanalmente. Cancelar 2 suscripciones genera un alivio inmediato.',
    estimatedMonthlySavings: 25000,
    estimatedAnnualSavings: 300000,
    difficulty: 'easy',
    actionType: 'subscription_audit',
    isApplied: false
  },
  {
    id: 'tip-starter-2',
    title: 'Eficiencia en Luz & Servicios Básicos',
    category: 'Luz & Electricidad',
    description: 'Desconectar electrodomésticos en modo stand-by y optimizar el uso de climatización/calefacción reduce hasta un 15% de la cuenta mensual.',
    estimatedMonthlySavings: 18000,
    estimatedAnnualSavings: 216000,
    difficulty: 'easy',
    actionType: 'energy_telecom',
    isApplied: false
  },
  {
    id: 'tip-starter-3',
    title: 'Renegociación de Plan de Internet y Celular',
    category: 'Internet & Teléfono',
    description: 'Llama a tu proveedor de telecomunicaciones cada 12 meses; habitualmente ofrecen planes de retención con 20% a 30% de descuento.',
    estimatedMonthlySavings: 15000,
    estimatedAnnualSavings: 180000,
    difficulty: 'medium',
    actionType: 'supplier_renegotiation',
    isApplied: false
  },
  {
    id: 'tip-starter-4',
    title: 'Compras Planificadas de Supermercado al por Mayor',
    category: 'Supermercado & Alimentos',
    description: 'Comprar alimentos no perecibles en distribuidoras mayoristas reduce el costo por unidad entre un 12% y un 22%.',
    estimatedMonthlySavings: 45000,
    estimatedAnnualSavings: 540000,
    difficulty: 'medium',
    actionType: 'operational_efficiency',
    isApplied: false
  },
  {
    id: 'tip-starter-5',
    title: 'Tope Presupuestario para Recreación & Salidas',
    category: 'Recreación & Salidas',
    description: 'Establecer un límite semanal para salidas a restaurantes y delivery permite disfrutar sin desbalancear el flujo de caja.',
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
