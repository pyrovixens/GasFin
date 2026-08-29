// ==========================================
// GastFin - Live Network Economic & Currency API Service
// ==========================================

import { safeFetch } from './apiClient';

export interface EconomicIndicator {
  code: string;
  name: string;
  value: number;
  unit: string;
  date: string;
  changePercent?: number;
}

export interface LiveMarketRates {
  uf: EconomicIndicator;
  dolar: EconomicIndicator;
  euro: EconomicIndicator;
  utm: EconomicIndicator;
  ipc: EconomicIndicator;
  ratesToUSD: Record<string, number>;
  lastUpdated: string;
  isLive: boolean;
}

export const FALLBACK_INDICATORS: LiveMarketRates = {
  uf: { code: 'uf', name: 'Unidad de Fomento (UF)', value: 38450, unit: 'Pesos', date: new Date().toISOString() },
  dolar: { code: 'dolar', name: 'Dólar Observado (USD)', value: 948, unit: 'Pesos', date: new Date().toISOString() },
  euro: { code: 'euro', name: 'Euro (EUR)', value: 1032, unit: 'Pesos', date: new Date().toISOString() },
  utm: { code: 'utm', name: 'Unidad Tributaria Mensual (UTM)', value: 66200, unit: 'Pesos', date: new Date().toISOString() },
  ipc: { code: 'ipc', name: 'Índice de Precios al Consumidor (IPC)', value: 0.7, unit: 'Porcentaje', date: new Date().toISOString() },
  ratesToUSD: {
    USD: 1,
    CLP: 948,
    EUR: 0.92,
    ARS: 1250,
    COP: 4100,
    MXN: 18.5,
    BRL: 5.45,
    PEN: 3.75,
    GBP: 0.78,
  },
  lastUpdated: new Date().toISOString(),
  isLive: false,
};

const CACHE_KEY = 'gastfin_economic_indicators_v1';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache

export const fetchLiveEconomicIndicators = async (): Promise<LiveMarketRates> => {
  // 1. Check local storage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const age = Date.now() - new Date(parsed.lastUpdated).getTime();
      if (age < CACHE_TTL && parsed.isLive) {
        return parsed;
      }
    }
  } catch {}

  // 2. Safe concurrent fetch from mindicador.cl and open.er-api.com
  try {
    const [clRes, globalRes] = await Promise.all([
      safeFetch<any>('https://mindicador.cl/api', { timeoutMs: 6000, retries: 1 }),
      safeFetch<any>('https://open.er-api.com/v6/latest/USD', { timeoutMs: 6000, retries: 1 }),
    ]);

    let ufVal = 38450;
    let dolarVal = 948;
    let euroVal = 1032;
    let utmVal = 66200;
    let ipcVal = 0.7;
    let isLiveSuccess = false;

    if (clRes.data) {
      const clData = clRes.data;
      if (clData.uf?.valor) ufVal = clData.uf.valor;
      if (clData.dolar?.valor) dolarVal = clData.dolar.valor;
      if (clData.euro?.valor) euroVal = clData.euro.valor;
      if (clData.utm?.valor) utmVal = clData.utm.valor;
      if (clData.ipc?.valor) ipcVal = clData.ipc.valor;
      isLiveSuccess = true;
    }

    let ratesToUSD = { ...FALLBACK_INDICATORS.ratesToUSD };
    if (globalRes.data && globalRes.data.rates) {
      ratesToUSD = { ...ratesToUSD, ...globalRes.data.rates };
      isLiveSuccess = true;
    }

    const liveData: LiveMarketRates = {
      uf: { code: 'uf', name: 'Unidad de Fomento (UF)', value: ufVal, unit: 'Pesos', date: new Date().toISOString() },
      dolar: { code: 'dolar', name: 'Dólar Observado (USD)', value: dolarVal, unit: 'Pesos', date: new Date().toISOString() },
      euro: { code: 'euro', name: 'Euro (EUR)', value: euroVal, unit: 'Pesos', date: new Date().toISOString() },
      utm: { code: 'utm', name: 'Unidad Tributaria Mensual (UTM)', value: utmVal, unit: 'Pesos', date: new Date().toISOString() },
      ipc: { code: 'ipc', name: 'Índice de Precios al Consumidor (IPC)', value: ipcVal, unit: 'Porcentaje', date: new Date().toISOString() },
      ratesToUSD,
      lastUpdated: new Date().toISOString(),
      isLive: isLiveSuccess,
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(liveData));
    } catch {}

    return liveData;
  } catch (err) {
    console.warn('Network economic indicators fetch warning (using cache/fallback):', err);
    return FALLBACK_INDICATORS;
  }
};
