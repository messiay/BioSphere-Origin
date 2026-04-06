import { motion } from 'framer-motion';
import { History, Trash2, ChevronRight, Clock, Fingerprint } from 'lucide-react';

export function AnalysisHistory({ history, onLoad, onClear }) {
    if (!history || history.length === 0) {
        return (
            <div className="bench-panel p-6 bg-slate-50/50 border-dashed border-slate-200">
                <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <History className="w-4 h-4 text-slate-300" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No cached runs</p>
                    <p className="text-[9px] text-slate-400 mt-1">Previous analyses will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bench-panel overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <History className="w-3 h-3 text-slate-400" />
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Analysis History</h3>
                </div>
                <button 
                    onClick={onClear}
                    className="text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 uppercase tracking-tighter"
                >
                    <Trash2 className="w-3 h-3" /> Clear
                </button>
            </div>
            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                {history.map((item, index) => (
                    <motion.button
                        key={item.hash || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onLoad(item)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group text-left"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="flex flex-col items-center shrink-0">
                                <div 
                                    className="w-10 h-10 rounded border flex items-center justify-center shadow-sm"
                                    style={{ 
                                        borderColor: getRiskColor(item.riskScore) + '40',
                                        backgroundColor: getRiskColor(item.riskScore) + '08'
                                    }}
                                >
                                    <span 
                                        className="text-xs font-black font-mono tracking-tighter"
                                        style={{ color: getRiskColor(item.riskScore) }}
                                    >
                                        {item.riskScore}
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 truncate mb-1 uppercase tracking-tight">
                                    {item.label || 'Unknown Sequence'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-[9px] font-medium text-slate-400">
                                        <Clock className="w-2.5 h-2.5 opacity-50" />
                                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 uppercase font-black tracking-tighter">
                                        <Fingerprint className="w-2.5 h-2.5 opacity-50" />
                                        <span>{item.hash?.substring(0, 8)}...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

function getRiskColor(score) {
    if (score <= 30) return '#10B981'; // Emerald
    if (score <= 60) return '#4F46E5'; // Indigo
    if (score <= 74) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
}
