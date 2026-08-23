import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Building2, Car, Home, Wallet, Sparkles } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { Asset, AssetCategory } from '../types';

export const AssetModal: React.FC = () => {
  const { 
    isAssetModalOpen, 
    setIsAssetModalOpen, 
    editingAsset, 
    addAsset, 
    updateAsset, 
    formatInputLive, 
    parseRawFromDisplay, 
    currentCurrency 
  } = useFinancial();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('bank');
  const [institution, setInstitution] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingAsset) {
      setName(editingAsset.name);
      setCategory(editingAsset.category);
      setInstitution(editingAsset.institution || '');
      setDisplayValue(formatInputLive(editingAsset.value));
      setNotes(editingAsset.notes || '');
    } else {
      setName('');
      setCategory('bank');
      setInstitution('');
      setDisplayValue('');
      setNotes('');
    }
  }, [editingAsset, isAssetModalOpen]);

  if (!isAssetModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseRawFromDisplay(displayValue);
    if (rawVal <= 0 || !name.trim()) return;

    if (editingAsset) {
      updateAsset(editingAsset.id, {
        name: name.trim(),
        category,
        institution: institution.trim() || undefined,
        value: rawVal,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString()
      });
    } else {
      addAsset({
        name: name.trim(),
        category,
        institution: institution.trim() || undefined,
        value: rawVal,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString()
      });
    }

    setIsAssetModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Patrimonio & Activos
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">
                {editingAsset ? 'Editar Activo / Propiedad' : 'Registrar Nuevo Activo'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAssetModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Activo</label>
            <input
              type="text"
              required
              placeholder="Ej: Cuenta de Ahorro Santander, Auto Toyota, Depto..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="bank">Cuenta Bancaria / Depósito</option>
                <option value="cash">Efectivo / Caja Fuerte</option>
                <option value="investment">Inversiones / Fondos Mutuos / Acciones</option>
                <option value="real_estate">Bienes Raíces / Propiedades</option>
                <option value="vehicle">Vehículo / Maquinaria</option>
                <option value="crypto">Criptomonedas</option>
                <option value="other">Otro Activo de Valor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Institución / Ubicación</label>
              <input
                type="text"
                placeholder="Ej: Banco de Chile, Fintual..."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Valor Estimado ({currentCurrency.symbol})</label>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="0"
              value={displayValue}
              onChange={(e) => setDisplayValue(formatInputLive(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-black text-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Notas / Detalles (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Tasación comercial 2026, fondo a 360 días..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssetModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all cursor-pointer"
            >
              {editingAsset ? 'Actualizar Activo' : 'Guardar Activo'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
