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
  Camera,
  Eye,
  RefreshCw,
  Layers,
  Check
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useFinancial } from '../context/FinancialContext';
import { parseReceiptText, ParsedReceipt } from '../services/receiptParser';

export const ReceiptScannerModal: React.FC = () => {
  const { 
    isReceiptScannerOpen, 
    setIsReceiptScannerOpen, 
    addTransaction, 
    formatMoney, 
    formatInputLive,
    parseRawFromDisplay,
    currentCurrency,
    triggerCelebration
  } = useFinancial();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('Iniciando lector OCR...');
  const [extractedRawText, setExtractedRawText] = useState<string>('');
  const [showRawText, setShowRawText] = useState(false);

  const [scanResult, setScanResult] = useState<{
    vendor: string;
    amount: number;
    displayAmount?: string;
    date: string;
    category: string;
    description: string;
    detectedTotalLine?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isReceiptScannerOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      processRealOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Real Tesseract OCR Processing Engine
  const processRealOCR = async (imageSrc: string) => {
    setIsScanning(true);
    setScanProgress(0);
    setProgressStatus('Iniciando motor de reconocimiento óptico...');
    setScanResult(null);
    setExtractedRawText('');

    try {
      const result = await Tesseract.recognize(
        imageSrc,
        'spa+eng', // Spanish & English recognition
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setScanProgress(Math.round(m.progress * 100));
              setProgressStatus(`Leyendo caracteres y montos (${Math.round(m.progress * 100)}%)...`);
            } else if (m.status === 'loading tesseract core') {
              setProgressStatus('Iniciando inteligencia visual...');
            }
          }
        }
      );

      const fullText = result.data.text || '';
      setExtractedRawText(fullText);
      
      // Parse using trained golden TOTAL rule parser
      const parsed: ParsedReceipt = parseReceiptText(fullText);
      
      setScanResult({
        vendor: parsed.vendor,
        amount: parsed.amount,
        displayAmount: formatInputLive(parsed.amount),
        date: parsed.date,
        category: parsed.category,
        description: parsed.description,
        detectedTotalLine: parsed.detectedTotalLine
      });

    } catch (err) {
      console.error('Error durante OCR:', err);
      const parsed = parseReceiptText('');
      setScanResult({
        vendor: parsed.vendor,
        amount: parsed.amount,
        displayAmount: formatInputLive(parsed.amount),
        date: parsed.date,
        category: parsed.category,
        description: parsed.description
      });
    } finally {
      setIsScanning(false);
    }
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
      tags: ['Boleta OCR Real'],
      vendorOrClient: scanResult.vendor
    });

    triggerCelebration();
    setIsReceiptScannerOpen(false);
    setImagePreview(null);
    setScanResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-950/60 my-auto text-slate-100 space-y-4">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={() => { setIsReceiptScannerOpen(false); setImagePreview(null); setScanResult(null); }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
            <Scan size={14} className="text-emerald-400" />
            <span>Escáner OCR Real</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Escaneo de Boleta o Factura
          </h2>

          <p className="text-xs text-slate-400">
            Sube o toma una foto y nuestro lector OCR procesará el texto real de tu comprobante.
          </p>
        </div>

        {/* Upload / Camera Drop Zone */}
        {!imagePreview ? (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/60 space-y-3 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-emerald">
                <Upload size={28} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-white">Haz clic para subir una foto de tu boleta</p>
                <p className="text-xs text-slate-400">Soporta JPG, PNG, WEBP o capturas de pantalla</p>
              </div>
            </div>

            {/* Direct Camera Button (Mobile & Tablet) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-2.5 px-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Camera size={16} />
                <span>Tomar Foto</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload size={16} />
                <span>Elegir Archivo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Image Preview & Scanning Indicator */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
              <img src={imagePreview} alt="Boleta" className="h-full w-full object-contain" />
              
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 p-4 text-emerald-400 text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <div className="space-y-1 w-full max-w-xs">
                    <p className="text-xs font-bold text-white">{progressStatus}</p>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Data Form */}
            {scanResult && !isScanning && (
              <form onSubmit={handleConfirmAndSave} className="space-y-3 pt-1">
                
                {/* Result Total Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-300 block">Total detectado en boleta:</span>
                    {scanResult.detectedTotalLine ? (
                      <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[200px] block">
                        Línea: {scanResult.detectedTotalLine}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-mono">Lectura óptica directa</span>
                    )}
                  </div>
                  <span className="font-black text-xl text-emerald-400 font-mono">
                    {formatMoney(scanResult.amount)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Comercio / Proveedor</label>
                    <input
                      type="text"
                      required
                      value={scanResult.vendor}
                      onChange={(e) => setScanResult({ ...scanResult, vendor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Monto ({currentCurrency.symbol})</label>
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Categoría</label>
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

                {/* Raw OCR Text Dropdown */}
                {extractedRawText && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRawText(!showRawText)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>{showRawText ? 'Ocultar texto OCR extraído' : 'Ver texto real leído por el escáner'}</span>
                    </button>
                    {showRawText && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono max-h-28 overflow-y-auto whitespace-pre-wrap">
                        {extractedRawText}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setScanResult(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Escanear Otra
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
