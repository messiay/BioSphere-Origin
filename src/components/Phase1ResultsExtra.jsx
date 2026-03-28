export function Phase1ResultsExtra({ 
    organismMatches, 
    natureCheck, 
    biopiracyData, 
    tkStatus,
    noveltyCheck,
    isCertifiedNonIndian, 
    onCertifyChange,
    onInvestmentChange,
    onDownloadPdf,
    onDownloadXml
}) {
    return (
        <div className="space-y-4 mb-6">
            {/* 1. NBA Biopiracy Badge */}
            {biopiracyData && (
                <div className={`p-3 rounded-lg border flex items-center justify-between ${biopiracyData.isIndian ? 'bg-red-50 border-red-200 text-red-900 shadow-sm animate-pulse' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{biopiracyData.isIndian ? '⚠️' : '✅'}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">NBA Biopiracy Check</span>
                                {biopiracyData?.isIndian ? (
                                    <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[8px] font-bold border border-red-200 uppercase tracking-tighter">
                                        Sovereignty Triggered
                                    </span>
                                ) : (
                                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-bold border border-emerald-200 uppercase tracking-tighter">
                                        Cleared (Digital Audit)
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-600 leading-tight">
                                {biopiracyData?.isIndian 
                                    ? `Automated Detection: Sequence identified as an Indian Sovereign Asset (${biopiracyData.source}). Section 6 compliance required.` 
                                    : "Forensic Audit: No matches to Indian endemic species or GenBank geographic metadata identifiers found."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2. Nature vs Lab Badge */}
                <div className={`p-3 rounded-lg border ${natureCheck?.isNatural ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Section 3(c) / (j) Audit</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{natureCheck?.isNatural ? '🌿' : '🧬'}</span>
                        <div className="leading-tight">
                            <p className="text-xs font-bold text-slate-900">{natureCheck?.isNatural ? 'Naturally Occurring' : 'Synthetic / Engineered'}</p>
                            <p className="text-[9px] text-slate-500">{natureCheck?.isNatural ? 'Unpatentable under Indian Law' : 'Eligible for Patent Screening'}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Traditional Knowledge Badge */}
                <div className={`p-3 rounded-lg border ${tkStatus ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Section 3(p) TK Check</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{tkStatus ? '🕌' : '🔬'}</span>
                        <div className="leading-tight">
                            <p className="text-xs font-bold text-slate-900">{tkStatus ? 'Regulated Traditional Knowledge' : 'No TK Matches Found'}</p>
                            <p className="text-[9px] text-slate-500">{tkStatus ? 'Matches Indian medicinal plant registry' : 'Not found in Section 3p registry'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Novelty Check */}
            <div className={`p-3 rounded-lg border ${noveltyCheck?.status === 'RED' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex justify-between">
                    <span>Section 2(1)(j) Novelty status</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${noveltyCheck?.status === 'RED' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {noveltyCheck?.status === 'RED' ? 'NOVELTY LOST' : 'NOVEL'}
                    </span>
                </h4>
                <div className="flex items-center gap-2">
                    <span className="text-lg">{noveltyCheck?.status === 'RED' ? '❌' : '✨'}</span>
                    <div className="leading-tight">
                        <p className="text-xs font-bold text-slate-900">{noveltyCheck?.reason || 'No recent publications found.'}</p>
                        <p className="text-[9px] text-slate-500">Cross-referenced with PubMed/GenBank publication dates (2020-2025)</p>
                    </div>
                </div>
            </div>

            {/* 5. Prior Art / Academic FTO */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex justify-between">
                    <span>Prior Art / Academic FTO Check</span>
                    <span className="text-blue-600 font-mono tracking-tighter">NCBI GENBANK</span>
                </h4>
                {organismMatches && organismMatches.length > 0 ? (
                    <div className="space-y-2">
                        {organismMatches.slice(0, 2).map((match, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded border border-slate-100 hover:bg-slate-100 transition-colors">
                                <a 
                                    href={`https://www.ncbi.nlm.nih.gov/nuccore/${match.accession}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 italic flex items-center gap-1 text-slate-700 hover:text-blue-600 group"
                                >
                                    <span className="font-bold not-italic">PubMed/GenBank: </span>
                                    {match.title.substring(0, 40)}...
                                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                                <span className="text-emerald-700 font-bold whitespace-nowrap bg-emerald-50 px-1 rounded border border-emerald-100">
                                    {match.identityPercentage.toFixed(1)}% FTO COVERAGE
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-400 italic">No academic prior art found. Sequence appears novel.</p>
                )}
            </div>
        </div>
    );
}
