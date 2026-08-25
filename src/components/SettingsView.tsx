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
  FileSpreadsheet,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  FileText
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
    logoutUser,
    isDarkMode,
    toggleDarkMode,
    isPrivacyMode,
    togglePrivacyMode,
    setIsReportPrintModalOpen,
    userPIN,
    setUserPIN,
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
  const [pinInput, setPinInput] = useState(userPIN || '');
  const [pinSavedStatus, setPinSavedStatus] = useState(false);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  useEffect(() => {
    setPinInput(userPIN || '');
  }, [userPIN]);

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
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow-indigo">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Configuración del Sistema & Seguridad</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Administra tu perfil, tema visual, seguridad y copias de seguridad.
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
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all cursor-pointer"
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

      {/* Theme & Visual Mode Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-400" />}
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Modo Visual</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isDarkMode ? 'Modo Oscuro de alto contraste activado.' : 'Modo Claro iluminado activado.'}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isDarkMode ? (
              <>
                <Sun size={16} className="text-amber-400" />
                <span>Cambiar a Modo Claro</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-indigo-400" />
                <span>Cambiar a Modo Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Privacy Stealth Mode Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              {isPrivacyMode ? <EyeOff size={18} className="text-amber-400" /> : <Eye size={18} className="text-slate-400" />}
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Modo Privacidad (Ocultar Saldos)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isPrivacyMode ? 'Todos los montos están ocultos con asteriscos ($ ••••••).' : 'Los montos y cifras se muestran visibles.'}
            </p>
          </div>

          <button
            type="button"
            onClick={togglePrivacyMode}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              isPrivacyMode 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-amber' 
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            {isPrivacyMode ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{isPrivacyMode ? 'Mostrar Saldos' : 'Ocultar Saldos'}</span>
          </button>
        </div>
      </div>

      {/* Quick 4-Digit Security PIN Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">PIN Rápido de Desbloqueo (4 Dígitos)</h3>
        </div>
        <p className="text-xs text-slate-400">
          Configura un código PIN numérico para desbloquear tu sesión en móvil y tablet rápidamente.
        </p>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (pinInput.length === 4) {
            setUserPIN(pinInput);
            setPinSavedStatus(true);
            setTimeout(() => setPinSavedStatus(false), 3000);
          }
        }} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="password"
            maxLength={4}
            pattern="\d{4}"
            inputMode="numeric"
            placeholder="PIN (4 dígitos)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            className="w-full sm:w-48 px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-mono font-black text-center text-lg tracking-widest focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={pinInput.length !== 4}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-emerald transition-all cursor-pointer disabled:opacity-50"
          >
            Guardar PIN
          </button>

          {userPIN && (
            <button
              type="button"
              onClick={() => {
                setUserPIN(null);
                setPinInput('');
              }}
              className="text-xs text-rose-400 hover:underline cursor-pointer"
            >
              Quitar PIN
            </button>
          )}

          {pinSavedStatus && (
            <span className="text-xs text-emerald-400 font-semibold animate-fade-in">
              ✓ ¡PIN guardado exitosamente!
            </span>
          )}
        </form>
      </div>

      {/* Cloud & Session Security Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Seguridad & Sesión</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Protección de datos con expiración automática de sesión por inactividad de 15 minutos.
            </p>
          </div>

          <button
            type="button"
            onClick={logoutUser}
            className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Currency Configuration */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Moneda Principal</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Moneda actual: <strong className="text-white font-mono">{currentCurrency.name} ({currentCurrency.symbol})</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={unlockCurrencySelector}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            Cambiar Moneda
          </button>
        </div>
      </div>

      {/* Backups: Excel and Certified Backup */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-card-soft space-y-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Auditoría & Descargas Ejecutivas</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={exportDataToExcel}
            className="px-4 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            <span>Exportar Libro Contable (.csv)</span>
          </button>

          <button
            type="button"
            onClick={exportDataAsJSON}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={16} className="text-emerald-400" />
            <span>Descargar Copia de Seguridad (.json)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload size={16} className="text-indigo-400" />
            <span>Restaurar Copia de Seguridad (.json)</span>
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
            <h4 className="text-xs font-bold text-white">Reiniciar Libro Contable a Cero</h4>
            <p className="text-[11px] text-slate-400">Restablece los saldos y transacciones para iniciar un nuevo ciclo contable.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsConfirmingClearAll(true)}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reiniciar Libro Mayor</span>
          </button>
        </div>
      </div>

      {/* Floating Confirmation Modal for Resetting Everything */}
      {isConfirmingClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Reiniciar Todo a Cero?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta acción vaciará movimientos, deudas y presupuestos para que comiences desde cero.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllDataToZero();
                  setIsConfirmingClearAll(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-glow-rose cursor-pointer"
              >
                Confirmar y Vaciar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
