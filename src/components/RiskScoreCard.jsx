export function RiskScoreCard({ risk }) {
    if (!risk) return null;

    const { overallScore, riskLevel, status } = risk;

    const colorMap = {
        GREEN: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
        YELLOW: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
        RED: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
    };

    const statusMap = {
        LIKELY_CLEAR: 'SAFE / PUBLIC DOMAIN',
        NOT_CLEAR_TO_OPERATE: 'CAUTION / LEGAL RISK',
        PATENT_PENDING_OR_ACTIVE: 'ACTIVE PATENT / CAUTION',
        PATENT_ENFORCED_HIGH_THREAT: 'CRITICAL / INFRINGEMENT RISK',
        RESTRICTED_DO_NOT_USE: 'DANGER / BIOTHREAT',
        NBA_BIOPIRACY_RESTRICTED: 'NBA SOVEREIGNTY RESTRICTION',
        TK_REGISTRY_MATCH: 'TRADITIONAL KNOWLEDGE (SEC 3P)',
        NOVELTY_LOST: 'PRIOR ART / NOVELTY DESTROYED',
        UNPATENTABLE_NATURE: 'SEC 3(c) / NATURALLY OCCURRING',
        CONSERVED_GENE_WARNING: 'CONSERVED SEQUENCE WARNING'
    };

    const colors = colorMap[riskLevel] || colorMap.GREEN;

    return (
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-100">Global Risk Profile</h2>
            
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Score:</span>
                        <span className="font-mono text-lg font-bold text-slate-800 leading-none">{overallScore}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status:</span>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border ${colors.border} ${colors.bg} ${colors.text}`}>
                            {riskLevel === 'GREEN' && "SAFE"}
                            {riskLevel === 'YELLOW' && "CAUTION"}
                            {riskLevel === 'RED' && "DANGER"}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Detail:</span>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${colors.text}`}>{statusMap[status] || status}</p>
                    </div>
                </div>

                {riskLevel !== 'GREEN' && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 font-medium leading-relaxed">
                        {status === 'PATENT_PENDING_OR_ACTIVE' && "Warning: Sequence matches active intellectual property. Legal clearance recommended."}
                        {status === 'PATENT_ENFORCED_HIGH_THREAT' && "CRITICAL: High-identity match to an Active Patent. High risk of literal infringement. Proceeding without a license is not recommended."}
                        {status === 'RESTRICTED_DO_NOT_USE' && "CRITICAL: Pathogenic signature detected. Matches restriction lists for select agents."}
                        {status === 'NBA_BIOPIRACY_RESTRICTED' && "CRITICAL: Sovereign Indian Biological Resource. Mandatory NBA disclosure before export."}
                        {status === 'TK_REGISTRY_MATCH' && "WARNING: Sequence flagged in Traditional Knowledge registry. High scrutiny applied."}
                        {status === 'NOVELTY_LOST' && "REJECTED: Novelty requirement 2(1)(j) failed due to recent academic/public disclosure."}
                        {status === 'UNPATENTABLE_NATURE' && "CAUTION: Naturally occurring sequences are non-patentable under Section 3(c)."}
                        {status === 'NOT_CLEAR_TO_OPERATE' && "Caution: Potential regulatory conflict in selected jurisdiction."}
                        {status === 'CONSERVED_GENE_WARNING' && "WARNING: Highly Conserved Sequence. Matches both unrestricted species and restricted Indian biota. If physical material was sourced from Indian territory, Form 3 is required. Ensure physical audit trail is verified."}
                        {status === 'AMBIGUOUS_TAXONOMY' && "CAUTION: Highly conserved sequence. This DNA perfectly matches multiple distinct species. Legal patentability and NBA clearance will depend entirely on your verified physical lab sourcing records."}
                    </div>
                )}
            </div>
        </div>
    );
}
