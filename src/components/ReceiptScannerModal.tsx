import React, { useState, useRef } from 'react';
import { 
  Scan, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  X, 
  FileText, 
  DollarSign, 
  Calendar, 
  Tag, 
  Building2, 
  ArrowRight,
  AlertCircle,
  Camera
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const ReceiptScannerModal: React.FC = () => {
  const { 
    isReceiptScannerOpen, 
    setIsReceiptScannerOpen, 
    addTransaction, 
    formatMoney, 
    formatInputLive,
    parseRawFromDisplay,
    currentCurrency 
  } = useFinancial();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    vendor: string;
    amount: number;
    displayAmount?: string;
    date: string;
    category: string;
    description: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isReceiptScannerOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      simulateIntelligentOCR(file.name);
    };
    reader.readAsDataURL(file);
  };

  // OCR Pattern Parser
  const simulateIntelligentOCR = (fileName: string) => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      // Intelligent Merchant and Category matcher based on patterns
      const lowerName = fileName.toLowerCase();
      let vendor = 'Supermercado Lider';
      let category = 'Alimentación & Supermercado';
      let amount = 18990;

      if (lowerName.includes('uber') || lowerName.includes('taxi')) {
        vendor = 'Uber Technologies';
        category = 'Transporte & Movilidad';
        amount = 8500;
      } else if (lowerName.includes('amazon') || lowerName.includes('compra')) {
        vendor = 'Amazon Marketplace';
        category = 'Compras & Personales';
        amount = 34990;
      } else if (lowerName.includes('luz') || lowerName.includes('enel') || lowerName.includes('electric')) {
        vendor = 'Enel Distribución';
        category = 'Servicios Básicos & Hogar';
        amount = 42300;
      } else if (lowerName.includes('combustible') || lowerName.includes('shell') || lowerName.includes('copec')) {
        vendor = 'Estación Copec';
        category = 'Transporte & Movilidad';
        amount = 25000;
      } else if (lowerName.includes('farmacia') || lowerName.includes('salud') || lowerName.includes('cruz')) {
        vendor = 'Farmacias Cruz Verde';
        category = 'Salud & Bienestar';
        amount = 14200;
      } else if (lowerName.includes('starbucks') || lowerName.includes('cafe') || lowerName.includes('restaurant')) {
        vendor = 'Starbucks Coffee';
        category = 'Restaurantes & Ocio';
        amount = 7600;
      }

      const todayStr = new Date().toISOString().split('T')[0];

      setScanResult({
        vendor,
        amount,
        displayAmount: formatInputLive(amount),
        date: todayStr,
        category,
        description: `Boleta / Factura ${vendor}`
      });

      setIsScanning(false);
    }, 1200);
  };

  const handleConfirmAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanResult || scanResult.amount <= 0) return;

    addTransaction({
      type: 'expense',
      amount: scanResult.amount,
      category: scanResult.category,
      description: scanResult.description,
      date: scanResult.date,
      time: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'card',
      status: 'completed',
      isRecurring: false,
      tags: ['Boleta Escaneada', 'OCR'],
      vendorOrClient: scanResult.vendor
    });

    setIsReceiptScannerOpen(false);
    setImagePreview(null);
    setScanResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-950/60 my-auto text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={() => { setIsReceiptScannerOpen(false); setImagePreview(null); setScanResult(null); }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <Scan size={14} className="text-emerald-400" />
            <span>Escanear Boleta</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sube una foto de tu Boleta o Factura
          </h2>

          <p className="text-xs text-slate-400">
            Elige la foto de tu comprobante y nosotros rellenamos el monto y la categoría por ti.
          </p>
        </div>

        {/* Upload Drop Zone */}
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/60 space-y-3 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.pdf"
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={28} />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-white">Haz clic o arrastra tu boleta aquí</p>
              <p className="text-xs text-slate-400">Soporta fotos JPG, PNG o documentos PDF</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Image Preview & Scanning Indicator */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
              <img src={imagePreview} alt="Boleta" className="h-full w-full object-contain opacity-70" />
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-emerald-400 animate-pulse">
                  <Scan size={32} className="animate-spin" />
                  <span className="text-xs font-bold">Extrayendo datos de la boleta...</span>
                </div>
              )}
            </div>

            {/* Extracted Data Form */}
            {scanResult && !isScanning && (
              <form onSubmit={handleConfirmAndSave} className="space-y-3 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Total detectado en boleta:</span>
                  <span className="font-black text-lg text-emerald-400 font-mono">{formatMoney(scanResult.amount)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Comercio / Proveedor</label>
                    <input
                      type="text"
                      required
                      value={scanResult.vendor}
                      onChange={(e) => setScanResult({ ...scanResult, vendor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Monto Exacto ({currentCurrency.symbol})</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={scanResult.displayAmount ?? formatInputLive(scanResult.amount)}
                      onChange={(e) => setScanResult({ 
                        ...scanResult, 
                        displayAmount: formatInputLive(e.target.value),
                        amount: parseRawFromDisplay(e.target.value) 
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Categoría Sugerida</label>
                    <input
                      type="text"
                      required
                      value={scanResult.category}
                      onChange={(e) => setScanResult({ ...scanResult, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={scanResult.date}
                      onChange={(e) => setScanResult({ ...scanResult, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setScanResult(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Escanear Otra
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Guardar Gasto en Cartola</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
