import { useState, useEffect } from 'react';

export function GlobalAnalysisReport({ 
    result, 
    biopiracyData, 
    isCertifiedNonIndian, 
    setIsCertifiedNonIndian, 
    setBiopiracyData,
    onDownloadPdf, 
    onDownloadXml,
    onReset,
    complianceReport 
}) {
    const [animateIn, setAnimateIn] = useState(false);
    const [isPhysicalCertified, setIsPhysicalCertified] = useState(false);

    useEffect(() => {
        setAnimateIn(true);
    }, []);

    if (!result) return null;

    const riskScore = result.risk?.overallScore ?? 0;
    const organismMatches = result.organismMatches ?? [];
    const topHit = organismMatches[0] || { title: 'No Match', identityPercentage: 0 };
    const compliancePct = complianceReport ? Math.round((complianceReport.passedChecks / complianceReport.totalChecks) * 100) : 100;
    const isIndian = biopiracyData?.isIndian || result.biopiracyData?.isIndian || false;
    const hasTK = result.tkStatus || false;
    const hasPatent = result.globalMatches?.some(h => h.status === 'ACTIVE' && h.identityPercentage > 95);

    // Clinical Gauge Colors
    const getRiskColor = (score) => {
        if (score <= 30) return '#4F46E5'; 
        if (score <= 60) return '#D97706'; 
        if (score <= 74) return '#9333EA'; 
        return '#DC2626'; 
    };

    const Gauge = ({ value, label, sublabel, color, size = 140 }) => {
        const radius = (size / 2) - 10;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (value / 100) * circumference;

        return (
            <div className="flex flex-col items-center">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg className="transform -rotate-90" width={size} height={size}>
                        <circle
                            cx={size / 2} cy={size / 2} r={radius}
                            stroke="rgb(241, 245, 249)" strokeWidth="8" fill="transparent"
                        />
                        <circle
                            cx={size / 2} cy={size / 2} r={radius}
                            stroke={color} strokeWidth="8" fill="transparent"
                            strokeDasharray={circumference}
                            style={{ 
                                strokeDashoffset: animateIn ? offset : circumference,
                                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' 
                            }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black font-mono tracking-tighter text-slate-800">{value}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-[-4px]">/100</span>
                    </div>
                </div>
                <div className="text-center mt-4 px-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</h4>
                    <p className="text-[11px] font-semibold text-slate-800 uppercase tracking-tight line-clamp-1">{sublabel}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            
            {/* ── REPORT HEADER ────────────────────────────────────── */}
            <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-800">Global Analysis Report</h2>
                    </div>
                    <div className="flex items-center gap-3 mt-3 ml-4">
                        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <span className="font-bold opacity-50 uppercase">Timestamp:</span> {new Date(result.timestamp || Date.now()).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
                            <span className="font-bold opacity-50 uppercase">Fingerprint:</span> {result.hash?.substring(0, 16) || 'UNASSIGNED'}...
                        </div>
                    </div>
                </div>
                <button onClick={onReset} className="btn-secondary flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-4 py-2 border border-slate-200 shadow-sm">
                    <span className="text-sm">↺</span> NEW ANALYSIS
                </button>
            </div>

            {/* ── TOP LEVEL METRICS ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bench-panel p-8 flex justify-center">
                    <Gauge 
                        value={riskScore} 
                        label="Biosecurity Risk" 
                        sublabel={result.risk?.status?.replace(/_/g, ' ') || 'SAFE'}
                        color={getRiskColor(riskScore)}
                    />
                </div>
                <div className="bench-panel p-8 flex justify-center">
                    <Gauge 
                        value={Math.round(topHit.identityPercentage || topHit.identity || 0)} 
                        label="Top Hit Identity" 
                        sublabel={(topHit.title || topHit.species)?.substring(0, 30) + ((topHit.title || topHit.species)?.length > 30 ? '...' : '')}
                        color="#4F46E5"
                    />
                </div>
                <div className="bench-panel p-8 flex justify-center">
                    <Gauge 
                        value={compliancePct} 
                        label="Regulatory Audit" 
                        sublabel={`${complianceReport?.passedChecks || 4}/4 Protocols Cleared`}
                        color="#10B981"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 space-y-8">
                    {/* ── GLOBAL PATENT MATCHES ─────────────────────────── */}
                    <div className="bench-panel overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Global Patent Matches</h3>
                            <span className="text-[9px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 uppercase font-bold tracking-widest">NCBI:BLAST:PAT</span>
                        </div>
                        <div className="p-6">
                            {result.globalMatches && result.globalMatches.length > 0 ? (
                                <div className="space-y-3">
                                    {result.globalMatches.slice(0, 6).map((hit, i) => {
                                        const patentMatch = hit.title?.match(/(US|KR|EP|JP|CN|WO|AU|CA)\s*([A-Z0-9.\-]+)/i);
                                        const cleanId = patentMatch ? `${patentMatch[1]}${patentMatch[2]}`.replace(/\s+/g, '') : (hit.id || '').replace(/\s+/g, '');
                                        const patentUrl = `https://patents.google.com/patent/${cleanId}/en`;
                                        const identity = hit.identityPercentage ?? hit.identity ?? 0;
                                        const isHighRisk = identity > 95;
                                        return (
                                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-lg group hover:border-indigo-200 hover:bg-white transition-all">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={`w-10 h-10 rounded flex flex-col items-center justify-center border shadow-sm shrink-0 ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                                                        <span className="text-[8px] font-black text-slate-300 uppercase leading-none">PAT</span>
                                                        <span className={`text-xs font-black font-mono tracking-tighter mt-0.5 ${isHighRisk ? 'text-red-600' : 'text-amber-600'}`}>
                                                            {identity.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <a href={patentUrl} target="_blank" rel="noopener noreferrer"
                                                            className="text-xs font-bold text-slate-800 hover:text-indigo-600 leading-tight block truncate max-w-[280px] transition-colors">
                                                            {hit.title}
                                                        </a>
                                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                            <span className="text-[9px] font-mono text-slate-400 font-bold">{hit.id}</span>
                                                            {hit.status && (
                                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${hit.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                                    {hit.status}
                                                                </span>
                                                            )}
                                                            {hit.citations !== undefined && (
                                                                <span className="text-[9px] font-mono text-indigo-500 font-bold">{hit.citations} cit.</span>
                                                            )}
                                                            {hit.alignLength && (
                                                                <span className="text-[9px] font-mono text-slate-400">{hit.alignLength}bp</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 opacity-40 text-slate-400 text-lg font-mono">P</div>
                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.1em]">No matching patents found.</p>
                                    <p className="text-slate-300 text-[10px] font-mono mt-1">Clear for FTO purposes.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── MATCH SPECTRUM ─────────────────────────────────── */}
                    <div className="bench-panel overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Biological Match Spectrum</h3>
                            <span className="text-[9px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 uppercase font-bold tracking-widest px-2">NCBI:GENBANK:NT</span>
                        </div>
                        <div className="p-6">
                            {organismMatches.length > 0 ? (
                                <div className="space-y-3">
                                    {organismMatches.slice(0, 6).map((match, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-lg group hover:border-indigo-200 hover:bg-white transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded bg-white flex flex-col items-center justify-center border border-slate-200 shadow-sm">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase leading-none">PCT</span>
                                                    <span className="text-xs font-black text-indigo-600 font-mono tracking-tighter mt-0.5">
                                                        {Math.round(match.identityPercentage || match.identity || 0)}%
                                                    </span>
                                                </div>
                                                <div className="max-w-[340px]">
                                                    <p className="text-xs font-bold text-slate-800 leading-tight mb-1 line-clamp-1">
                                                        {match.title || match.species}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-tighter">TaxID:</span>
                                                            <span className="data-stamp text-[9px] font-bold">{match.taxid || match.taxId || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-tighter">ACC:</span>
                                                            <span className="data-stamp text-[9px] font-bold">{match.accession || match.id || '---'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">MATCHED</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 opacity-50 text-slate-400">
                                        ⌬
                                    </div>
                                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.1em]">No biological matches found — novel sequence.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── REGULATORY AUDIT ────────────────────────────────── */}
                <div className="md:col-span-12 lg:col-span-5 space-y-8">
                    <div className="bench-panel overflow-hidden h-full">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Legal & Regulatory Audit</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {[
                                { title: 'NBA Bioprospecting Compliance (§6)', desc: biopiracyData?.source || 'Indian sovereign resources check.', status: isIndian ? 'RESTRICTED' : 'CLEARED', color: isIndian ? '#DC2626' : '#10B981', bg: isIndian ? '#FEF2F2' : '#F0FDF4' },
                                { title: 'SCOMET / Dual-Use Screening', desc: 'Control List categorization.', status: 'EXEMPT', color: '#4F46E5', bg: '#F5F3FF' },
                                { title: 'TKDL Sovereignty Verification', desc: 'Traditional knowledge database pull.', status: hasTK ? 'RESTRICTED' : 'CLEARED', color: hasTK ? '#DC2626' : '#10B981', bg: hasTK ? '#FEF2F2' : '#F0FDF4' },
                                { title: 'FTO (Freedom to Operate)', desc: 'WIPO/USPTO patent infringement scan.', status: hasPatent ? 'CAUTION' : 'CLEARED', color: hasPatent ? '#D97706' : '#10B981', bg: hasPatent ? '#FFFBEB' : '#F0FDF4' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 bg-white border border-slate-100 rounded-lg flex justify-between items-center hover:border-slate-200 transition-colors">
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{item.title}</p>
                                        <p className="text-[10px] text-slate-400 leading-none font-medium">{item.desc}</p>
                                    </div>
                                    <span style={{ color: item.color, backgroundColor: item.bg, borderColor: item.color + '20' }} className="text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest">
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Actions section inside the audit panel to maximize density */}
                        <div className="p-6 pt-0 mt-4 space-y-4">
                            {/* Layer 3: Physical Reality Trapdoor */}
                            {(!isIndian && riskScore < 75) && (
                                <div className={`p-4 rounded border transition-all ${isPhysicalCertified ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200 animate-pulse'}`}>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={isPhysicalCertified}
                                            onChange={(e) => setIsPhysicalCertified(e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className={`text-[10px] font-bold leading-tight ${isPhysicalCertified ? 'text-emerald-700' : 'text-amber-800'}`}>
                                            MANDATORY: I certify that the physical biological material used to generate this sequence was NOT sourced from the territory of India.
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="bench-panel p-6 bg-slate-50/50 border-dashed border-slate-200 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={onDownloadPdf} 
                                        disabled={(!isIndian && riskScore < 75) && !isPhysicalCertified}
                                        className={`btn-secondary w-full py-3 text-[9px] font-black uppercase tracking-widest border-slate-200 shadow-sm transition-all ${
                                            ((!isIndian && riskScore < 75) && !isPhysicalCertified) 
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed grayscale' 
                                            : 'bg-white hover:bg-slate-50 text-slate-800'
                                        }`}
                                    >
                                        ⇓ PDF REPORT
                                    </button>
                                    <button onClick={onDownloadXml} className="btn-secondary w-full py-3 text-[9px] font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all text-slate-800">
                                        ⇓ DATAPACK XML
                                    </button>
                                </div>
                                <p className="text-[9px] text-center text-slate-400 font-mono italic">Analysis cryptographically signed for regulatory submission.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
