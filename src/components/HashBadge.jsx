import { useState, useEffect } from 'react';

export function HashBadge({ result }) {
    const hash = result?.hash || '';

    if (!hash) return null;

    return (
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col items-center shadow-inner">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">🛡️</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Liability Shield Fingerprint</span>
            </div>
            <code className="text-[10px] text-emerald-400 font-mono break-all text-center">
                SHA256: {hash}
            </code>
            <p className="text-[8px] text-slate-500 mt-2 italic">
                Cryptographically timestamped analysis for legal compliance and FTO provenance.
            </p>
        </div>
    );
}
