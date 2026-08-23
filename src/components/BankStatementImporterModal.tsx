import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Sparkles, 
  Check,
  Building2,
  Filter
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { TransactionType } from '../types';

interface ParsedRow {
  id: string;
  selected: boolean;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export const BankStatementImporterModal: React.FC = () => {
  const { 
    isCSVImporterOpen, 
    setIsCSVImporterOpen, 
    addTransaction, 
    formatMoney, 
    currentCurrency,
    triggerCelebration 
  } = useFinancial();

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCSVImporterOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSVContent(text);
    };
    reader.readAsText(file);
  };

  const parseCSVContent = (content: string) => {
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      setIsProcessing(false);
      return;
    }

    // Detect delimiter: comma or semicolon
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    const rows: ParsedRow[] = [];

    // Parse each line (skip header if present)
    lines.slice(1).forEach((line, idx) => {
      const parts = line.split(delimiter).map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length < 2) return;

      // Extract date, description, amount
      let date = new Date().toISOString().split('T')[0];
      let desc = 'Movimiento Bancario';
      let amount = 0;
      let type: TransactionType = 'expense';
      let category = 'Otros Gastos';

      // Look for date pattern YYYY-MM-DD or DD/MM/YYYY
      const dateMatch = parts.find(p => /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(p));
      if (dateMatch) {
        if (dateMatch.includes('/')) {
          const segs = dateMatch.split('/');
          if (segs[0].length === 4) {
            date = `${segs[0]}-${segs[1].padStart(2, '0')}-${segs[2].padStart(2, '0')}`;
          } else {
            date = `${segs[2]}-${segs[1].padStart(2, '0')}-${segs[0].padStart(2, '0')}`;
          }
        } else {
          date = dateMatch;
        }
      }

      // Look for amount (clean currency symbols and parse)
      const numericParts = parts.filter(p => /^-?\$?\s*[\d.,]+$/.test(p));
      if (numericParts.length > 0) {
        const rawNumStr = numericParts[numericParts.length - 1].replace(/[^\d.-]/g, '');
        const parsedVal = parseFloat(rawNumStr);
        if (!isNaN(parsedVal)) {
          amount = Math.abs(parsedVal);
          type = parsedVal < 0 || line.toLowerCase().includes('cargo') || line.toLowerCase().includes('debito') ? 'expense' : 'income';
        }
      }

      // Description is longest non-numeric part
      const textParts = parts.filter(p => !/^-?\$?\s*[\d.,]+$/.test(p) && p !== dateMatch);
      if (textParts.length > 0) {
        desc = textParts[0];
      }

      // Category auto-guess
      const dLower = desc.toLowerCase();
      if (dLower.includes('super') || dLower.includes('lider') || dLower.includes('jumbo') || dLower.includes('unimarc')) {
        category = 'Supermercado';
      } else if (dLower.includes('enel') || dLower.includes('luz') || dLower.includes('aguas') || dLower.includes('gas') || dLower.includes('vtr') || dLower.includes('movistar') || dLower.includes('entel')) {
        category = 'Servicios Básicos';
      } else if (dLower.includes('uber') || dLower.includes('copec') || dLower.includes('shell') || dLower.includes('metro') || dLower.includes('bip')) {
        category = 'Transporte';
      } else if (dLower.includes('sueldo') || dLower.includes('remuneracion') || dLower.includes('honorario') || dLower.includes('transferencia recibida')) {
        category = 'Sueldo / Ingreso Principal';
        type = 'income';
      } else if (dLower.includes('restaurant') || dLower.includes('mcdonald') || dLower.includes('starbucks') || dLower.includes('pedidosya') || dLower.includes('rappi')) {
        category = 'Restaurantes & Salidas';
      }

      if (amount > 0) {
        rows.push({
          id: `csv-${idx}-${Date.now()}`,
          selected: true,
          date,
          description: desc,
          amount,
          type,
          category
        });
      }
    });

    setParsedRows(rows);
    setIsProcessing(false);
  };

  const handleToggleRow = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleToggleAll = (val: boolean) => {
    setParsedRows(prev => prev.map(r => ({ ...r, selected: val })));
  };

  const handleConfirmImport = () => {
    const selectedRows = parsedRows.filter(r => r.selected);
    if (selectedRows.length === 0) return;

    selectedRows.forEach(row => {
      addTransaction({
        type: row.type,
        amount: row.amount,
        category: row.category,
        description: row.description,
        date: row.date,
        paymentMethod: 'transfer',
        status: 'completed',
        isRecurring: false,
        tags: ['importado-banco'],
      });
    });

    setImportSuccess(true);
    triggerCelebration();
    setTimeout(() => {
      setImportSuccess(false);
      setIsCSVImporterOpen(false);
      setParsedRows([]);
      setFileName(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Importador Universal
                </span>
                <span className="text-[10px] text-slate-400">Bancos & Tarjetas</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                Importar Cartola Bancaria (CSV)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCSVImporterOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dropzone or Preview */}
        {parsedRows.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/60 space-y-4 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.txt"
              className="hidden"
            />
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-emerald">
              <Upload size={32} />
            </div>
            <div className="space-y-1.5">
              <p className="font-extrabold text-base text-white">
                Haz clic o arrastra aquí tu archivo CSV bancario
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Compatible con cartolas de BancoEstado, Banco de Chile, Santander, BCI, Scotiabank, Itaú y cualquier archivo CSV exportado.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Archivo: {fileName}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {parsedRows.filter(r => r.selected).length} de {parsedRows.length} seleccionados
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAll(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                >
                  Seleccionar Todo
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAll(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                >
                  Deseleccionar
                </button>
              </div>
            </div>

            {/* Rows Table */}
            <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800 text-xs">
              {parsedRows.map((row) => (
                <div 
                  key={row.id}
                  onClick={() => handleToggleRow(row.id)}
                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    row.selected ? 'bg-slate-900/90 hover:bg-slate-850' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={() => handleToggleRow(row.id)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{row.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{row.date} • {row.category}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`font-mono font-bold ${row.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {row.type === 'income' ? '+' : '-'}{formatMoney(row.amount)}
                    </span>
                    <span className="block text-[9px] uppercase font-bold text-slate-500">{row.type === 'income' ? 'Abono' : 'Cargo'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setParsedRows([]); setFileName(null); }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cargar Otro Archivo
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedRows.filter(r => r.selected).length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
                <span>Importar {parsedRows.filter(r => r.selected).length} Movimientos</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
