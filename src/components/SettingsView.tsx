import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Coins, 
  Database,
  FileCode,
  Sparkles,
  Lock,
  CheckCircle2,
  User,
  Cloud,
  FileSpreadsheet
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { SUPPORTED_CURRENCIES } from '../data/initialData';

export const SettingsView: React.FC = () => {
  const { 
    userName,
    setUserName,
    currentCurrency, 
    setCurrency, 
    lockAndSetCurrencyAndName,
    unlockCurrencySelector,
    exportDataAsJSON, 
    exportDataToExcel,
    importDataFromJSON, 
    clearAllDataToZero,
    supabaseUser,
    isCloudConnected,
    setIsAuthModalOpen,
    syncLocalToCloud,
    logoutSupabase,
    transactions,
    debts,
    goals,
    savingsTips,
    formatMoney 
  } = useFinancial();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [tempName, setTempName] = useState(userName);
  const [nameSavedStatus, setNameSavedStatus] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataFromJSON(content);
      if (success) {
        setImportStatus('¡Datos importados con éxito!');
      } else {
        setImportStatus('Error al leer el archivo JSON. Verifica el formato.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setNameSavedStatus(true);
      setTimeout(() => setNameSavedStatus(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow-indigo">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Configuración del Sistema & Perfil</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Administra tu nombre de usuario, divisa fija y copias de seguridad en Excel y JSON.
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center gap-2">
          <User size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Perfil de Usuario</h3>
        </div>

        <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Tu nombre o empresa..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all"
          >
            Actualizar Nombre
          </button>

          {nameSavedStatus && (
            <span className="text-xs text-emerald-400 font-semibold animate-fade-in">
              ✓ ¡Nombre guardado!
            </span>
          )}
        </form>
      </div>

      {/* Primary Locked Currency */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Divisa Principal Fija</h3>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <Lock size={12} />
            <span>Fijada y Protegida</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Esta divisa se mantiene fija en todos tus cálculos, reportes y dashboards con sus reglas oficiales de puntos y decimales:
        </p>

        {/* Selected Currency Highlight Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/30 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400">Moneda activa:</span>
            <h4 className="text-lg font-black text-white mt-0.5">
              {currentCurrency.code} — {currentCurrency.name}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Ejemplo de formato: <strong className="font-mono text-emerald-400">{formatMoney(1200000)}</strong>
            </p>
          </div>

          <button
            onClick={unlockCurrencySelector}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-emerald-500 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Cambiar Divisa Principal</span>
          </button>
        </div>

        {/* Currency Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = curr.code === currentCurrency.code;
            return (
              <button
                key={curr.code}
                onClick={() => lockAndSetCurrencyAndName(curr.code, userName)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-glow-emerald text-white'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-white">{curr.code} ({curr.symbol})</span>
                  {isSelected && <CheckCircle2 size={16} className="text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-400 truncate">{curr.name}</p>
                <p className="text-[11px] font-mono text-emerald-400/90 mt-2">{curr.example}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cloud Database & Supabase Multi-user Sync */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Base de Datos en la Nube (Supabase)</h3>
          </div>
          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
            supabaseUser 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {supabaseUser ? '🟢 En Línea' : '⚪ Modo Local / Offline'}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          {supabaseUser 
            ? `Conectado como ${supabaseUser.email}. Todos tus movimientos, presupuestos y metas se sincronizan en tiempo real con Supabase PostgreSQL.` 
            : 'Conecta tu cuenta para guardar tus finanzas en la nube y acceder desde tu PC, teléfono Android o iPhone.'}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {supabaseUser ? (
            <>
              <button
                onClick={syncLocalToCloud}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-2"
              >
                <Database size={15} />
                <span>Forzar Sincronización a la Nube</span>
              </button>
              <button
                onClick={logoutSupabase}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-slate-700 transition-colors"
              >
                Cerrar Sesión Cloud
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-2"
            >
              <Cloud size={15} />
              <span>Iniciar Sesión o Crear Cuenta Cloud</span>
            </button>
          )}
        </div>
      </div>

      {/* Backup & Export to Excel & JSON */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Database size={18} className="text-teal-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Exportación y Copia de Seguridad</h3>
        </div>
        <p className="text-xs text-slate-400">
          Tus datos se guardan de forma privada y permanente en tu navegador. Puedes generar hojas de cálculo de Excel o respaldos JSON en cualquier momento.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={exportDataToExcel}
            className="px-4 py-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 font-bold text-xs border border-emerald-500/40 shadow-glow-emerald transition-all flex items-center justify-center gap-2"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            <span>Descargar en Excel (.csv)</span>
          </button>

          <button
            onClick={exportDataAsJSON}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
          >
            <Download size={16} className="text-emerald-400" />
            <span>Descargar Respaldo JSON</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-indigo-500 transition-all flex items-center justify-center gap-2"
          >
            <Upload size={16} className="text-indigo-400" />
            <span>Restaurar Archivo JSON</span>
          </button>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            {importStatus}
          </div>
        )}
      </div>

      {/* Database Reset */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="text-xs font-bold text-white">Vaciar y Limpiar Todo a Cero</h4>
            <p className="text-[11px] text-slate-400">Elimina todos los registros para reiniciar el libro mayor.</p>
          </div>

          <button
            onClick={() => {
              if (confirm('¿Vaciar y dejar todo en cero para iniciar de nuevo?')) {
                clearAllDataToZero();
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>Limpiar Todo a Cero</span>
          </button>
        </div>
      </div>

    </div>
  );
};
