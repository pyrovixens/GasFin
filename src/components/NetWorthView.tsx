import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Building2, 
  Wallet, 
  Car, 
  Home, 
  Coins, 
  ShieldCheck, 
  Sparkles,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Asset, AssetCategory } from '../types';

export const NetWorthView: React.FC = () => {
  const { 
    assets, 
    debts, 
    metrics, 
    formatMoney, 
    openAssetModal, 
    deleteAsset, 
    openDebtModal,
    currentCurrency 
  } = useFinancial();

  // Calculated totals
  const totalAssets = useMemo(() => {
    return assets.reduce((acc, a) => acc + a.value, 0);
  }, [assets]);

  const totalLiabilities = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.remainingAmount, 0);
  }, [debts]);

  const netWorth = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'bank': return <Building2 size={16} className="text-sky-400" />;
      case 'cash': return <Wallet size={16} className="text-emerald-400" />;
      case 'investment': return <TrendingUp size={16} className="text-indigo-400" />;
      case 'real_estate': return <Home size={16} className="text-amber-400" />;
      case 'vehicle': return <Car size={16} className="text-rose-400" />;
      case 'crypto': return <Coins size={16} className="text-purple-400" />;
      default: return <Sparkles size={16} className="text-teal-400" />;
    }
  };

  const getCategoryLabel = (cat: AssetCategory) => {
    switch (cat) {
      case 'bank': return 'Cuenta Bancaria';
      case 'cash': return 'Efectivo';
      case 'investment': return 'Inversión';
      case 'real_estate': return 'Bienes Raíces';
      case 'vehicle': return 'Vehículo';
      case 'crypto': return 'Cripto';
      default: return 'Otro Activo';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Monitor de Patrimonio Neto Real</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Activos − Pasivos
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mide tu riqueza neta real calculando todos tus bienes financieros frente a tus compromisos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAssetModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>+ Registrar Activo</span>
            </button>
          </div>
        </div>

        {/* Master Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-emerald-400" />
              <span>Total en Activos & Bienes</span>
            </span>
            <p className="text-2xl font-black text-emerald-400">{formatMoney(totalAssets)}</p>
            <span className="text-[11px] text-slate-400">{assets.length} activos registrados</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
              <ArrowDownRight size={14} className="text-rose-400" />
              <span>Total en Pasivos & Deudas</span>
            </span>
            <p className="text-2xl font-black text-rose-400">{formatMoney(totalLiabilities)}</p>
            <span className="text-[11px] text-slate-400">{debts.length} compromisos deudores</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-1">
            <span className="text-xs text-indigo-300 font-bold flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Patrimonio Neto Consolidado</span>
            </span>
            <p className={`text-2xl font-black ${netWorth >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatMoney(netWorth)}
            </p>
            <span className="text-[11px] text-indigo-200">
              Razón Deuda / Activo: {debtToAssetRatio.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Assets List vs Liabilities List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Assets Section */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Wallet size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tus Activos Registrados</h3>
                <span className="text-xs text-slate-400 font-mono">Suma: {formatMoney(totalAssets)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAssetModal()}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
            >
              + Añadir
            </button>
          </div>

          {assets.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">Aún no has registrado activos o cuentas de ahorro.</p>
              <button
                type="button"
                onClick={() => openAssetModal()}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
              >
                + Registrar Primer Activo
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {assets.map((asset) => (
                <div 
                  key={asset.id}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 group hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex-shrink-0">
                      {getCategoryIcon(asset.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">{asset.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {getCategoryLabel(asset.category)} {asset.institution ? `• ${asset.institution}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-400 text-sm">{formatMoney(asset.value)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openAssetModal(asset)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAsset(asset.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liabilities Section */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <TrendingDown size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tus Pasivos & Deudas</h3>
                <span className="text-xs text-slate-400 font-mono">Suma: {formatMoney(totalLiabilities)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openDebtModal()}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
            >
              + Añadir Deuda
            </button>
          </div>

          {debts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
              <p className="text-xs text-emerald-400 font-bold">¡Libre de deudas registradas! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {debts.map((debt) => (
                <div 
                  key={debt.id}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 group hover:border-rose-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-rose-400 flex-shrink-0">
                      <TrendingDown size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">{debt.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        Tasa: {debt.interestRate}% • Cuota: {formatMoney(debt.minimumPayment)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-rose-400 text-sm">{formatMoney(debt.remainingAmount)}</p>
                    <span className="text-[10px] text-slate-500">Saldo pendiente</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
