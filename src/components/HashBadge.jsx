import { useState, useEffect } from 'react';

export function HashBadge({ result }) {
    const hash = result?.hash || '';

    if (!hash) return null;

    return (
        <div className="mt-4 bg-white border border-slate-200 rounded-md p-4 shadow-sm flex flex-col items-start">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Liability Shield Fingerprint</h3>
            <div className="w-full flex items-center bg-slate-100 border border-slate-200 rounded px-2 py-1.5 overflow-hidden">
                <code className="text-[10px] text-slate-700 font-mono break-all leading-tight">
                    SHA256: {hash}
                </code>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                Cryptographically timestamped analysis for legal compliance and FTO provenance.
            </p>
        </div>
    );
}
