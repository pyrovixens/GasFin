import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Users, Cloud, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';

export const UserProfileMenu: React.FC = () => {
  const { currentUser, openAuthModal, logout, savedAccounts, switchAccount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <button
        onClick={openAuthModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-glow-emerald hover:brightness-110 transition-all active:scale-95"
      >
        <User size={14} />
        <span>Iniciar Sesión</span>
      </button>
    );
  }

  const isCloud = isFirebaseConfigured();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-200 text-xs font-bold transition-all shadow-sm group"
        title="Perfil de usuario y cambio de cuentas"
      >
        {/* Avatar */}
        {currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt={currentUser.displayName} 
            className="w-6 h-6 rounded-full object-cover border border-emerald-500/50" 
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden sm:flex flex-col text-left">
          <span className="truncate max-w-[100px] text-white leading-tight font-extrabold">{currentUser.displayName}</span>
          <span className="text-[9px] text-emerald-400 font-mono leading-none flex items-center gap-0.5">
            <Cloud size={9} />
            <span>{isCloud ? 'Cloud Synced' : 'Base de datos activa'}</span>
          </span>
        </div>

        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-slide-up text-slate-200 text-xs">
          
          {/* User Header */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-2">
            <p className="font-extrabold text-white text-sm">{currentUser.displayName}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
            <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-700/50 text-[10px]">
              <span className="text-slate-400">Tipo de Cuenta:</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                {currentUser.provider}
              </span>
            </div>
          </div>

          {/* Switch Accounts List if multiple accounts exist */}
          {savedAccounts.length > 1 && (
            <div className="mb-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Cambiar de Usuario:</span>
              {savedAccounts
                .filter(a => a.uid !== currentUser.uid)
                .slice(0, 3)
                .map(acc => (
                  <button
                    key={acc.uid}
                    onClick={() => { switchAccount(acc.uid); setIsOpen(false); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-[10px]">
                        {acc.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[130px] font-semibold">{acc.displayName}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Cambiar</span>
                  </button>
                ))}
            </div>
          )}

          {/* Action Links */}
          <button
            onClick={() => { openAuthModal(); setIsOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 font-medium transition-colors"
          >
            <Users size={15} className="text-emerald-400" />
            <span>Gestionar Cuentas / Login</span>
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-300 font-bold transition-colors"
          >
            <LogOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};
