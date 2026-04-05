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
        <div className="bg-white border border-slate-200 rounded-md shadow-sm mb-4">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legal & Regulatory Audits</h2>
            </div>
            
            <div className="divide-y divide-slate-100">
                {/* 1. NBA Biopiracy Badge */}
                {biopiracyData && (
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-800">NBA Biopiracy Compliance (Section 6)</span>
                            <span className="text-[10px] text-slate-500 leading-tight">
                                {biopiracyData.isIndian 
                                    ? `Identified as an Indian Sovereign Asset (${biopiracyData.source}).` 
                                    : "No matches to Indian endemic species found."}
                            </span>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-bold tracking-widest border ${biopiracyData.isIndian ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {biopiracyData.isIndian ? 'RESTRICTED / SOVEREIGN' : 'CLEARED'}
                        </div>
                    </div>
                )}

                {/* 2. Nature vs Lab Badge */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-800">Section 3(c) / (j) Subject Matter Audit</span>
                        <span className="text-[10px] text-slate-500 leading-tight">
                            {natureCheck?.isNatural ? 'Naturally Occurring. Unpatentable under Indian Law.' : 'Synthetic / Engineered. Eligible for Patent Screening.'}
                        </span>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-bold tracking-widest border ${natureCheck?.isNatural ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {natureCheck?.isNatural ? 'NATURAL' : 'SYNTHETIC'}
                    </div>
                </div>

                {/* 3. Traditional Knowledge Badge */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-800">Section 3(p) TK Registry Check</span>
                        <span className="text-[10px] text-slate-500 leading-tight">
                            {tkStatus ? 'Matches Indian medicinal plant registry.' : 'Not found in Section 3p Traditional Knowledge databases.'}
                        </span>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-bold tracking-widest border ${tkStatus ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {tkStatus ? 'TK MATCH FOUND' : 'CLEAR'}
                    </div>
                </div>

                {/* 4. Novelty Check */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-800">Section 2(1)(j) Novelty Prior Art Search</span>
                        <span className="text-[10px] text-slate-500 leading-tight">
                            {noveltyCheck?.reason || 'Cross-referenced with recent PubMed/GenBank publications.'}
                        </span>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-bold tracking-widest border ${noveltyCheck?.status === 'RED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {noveltyCheck?.status === 'RED' ? 'NOVELTY DESTROYED' : 'NOVEL'}
                    </div>
                </div>

                {/* 5. Prior Art / Academic FTO */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-800">Academic FTO Alignments</span>
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">NCBI:GENBANK</span>
                    </div>
                    {organismMatches && organismMatches.length > 0 ? (
                        <div className="space-y-2">
                            {organismMatches.slice(0, 2).map((match, i) => (
                                <div key={i} className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                                    <a 
                                        href={`https://www.ncbi.nlm.nih.gov/nuccore/${match.accession}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 italic flex items-center gap-1.5 text-slate-700 hover:text-blue-600 group"
                                    >
                                        <span className="font-semibold not-italic">Ref:</span>
                                        {match.title.substring(0, 60)}...
                                    </a>
                                    <span className="font-mono font-bold text-slate-700 whitespace-nowrap ml-4">
                                        {match.identityPercentage.toFixed(1)}% MAP
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] text-slate-400 italic">No academic prior art found. Sequence appears novel.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
