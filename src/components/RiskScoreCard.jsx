export function RiskScoreCard({ risk }) {
    if (!risk) return null;

    const { overallScore, riskLevel, status } = risk;

    const colorMap = {
        GREEN: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', icon: '✅' },
        YELLOW: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-900', icon: '⚠️' },
        RED: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900', icon: '⛔' }
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
        UNPATENTABLE_NATURE: 'SEC 3(c) / NATURALLY OCCURRING'
    };

    const colors = colorMap[riskLevel] || colorMap.GREEN;

    return (
        <div className={`${colors.bg} border-l-4 ${colors.border} rounded-md p-5 shadow-sm`}>
            {/* Same layout... */}
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    {/* Icon Block */}
                    <div className={`p-2 rounded-full border bg-white ${colors.border}`}>
                        {riskLevel === 'GREEN' && (
                            <svg className={`w-6 h-6 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {riskLevel === 'YELLOW' && (
                            <svg className={`w-6 h-6 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                        {riskLevel === 'RED' && (
                            <svg className={`w-6 h-6 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                    </div>

                    <div>
                        <h3 className={`text-lg font-bold ${colors.text} tracking-tight`}>
                            {riskLevel === 'GREEN' ? 'NO RISK DETECTED' : `${riskLevel} RISK DETECTED`}
                        </h3>
                        <p className={`text-xs font-bold ${colors.text} opacity-80 mt-1 uppercase tracking-wide`}>{statusMap[status] || status}</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className={`text-3xl font-bold ${colors.text} font-mono leading-none`}>{overallScore}</div>
                    <div className={`text-[10px] uppercase font-bold ${colors.text} opacity-60 mt-1`}>Risk Score</div>
                </div>
            </div>

            {riskLevel !== 'GREEN' && (
                <div className="mt-4 pt-3 border-t border-black/5">
                    <p className={`text-[10px] font-bold ${colors.text} leading-relaxed uppercase tracking-tight`}>
                        {status === 'PATENT_PENDING_OR_ACTIVE' && "Warning: Sequence matches active intellectual property. Legal clearance recommended."}
                        {status === 'PATENT_ENFORCED_HIGH_THREAT' && "CRITICAL: High-identity match to an Active Patent. High risk of literal infringement. Proceeding without a license is not recommended."}
                        {status === 'RESTRICTED_DO_NOT_USE' && "CRITICAL: Pathogenic signature detected. Matches restriction lists for select agents."}
                        {status === 'NBA_BIOPIRACY_RESTRICTED' && "CRITICAL: Sovereign Indian Biological Resource. Mandatory NBA disclosure before export."}
                        {status === 'TK_REGISTRY_MATCH' && "WARNING: Sequence flagged in Traditional Knowledge registry. High scrutiny applied."}
                        {status === 'NOVELTY_LOST' && "REJECTED: Novelty requirement 2(1)(j) failed due to recent academic/public disclosure."}
                        {status === 'UNPATENTABLE_NATURE' && "CAUTION: Naturally occurring sequences are non-patentable under Section 3(c)."}
                        {status === 'NOT_CLEAR_TO_OPERATE' && "Caution: Potential regulatory conflict in selected jurisdiction."}
                    </p>
                </div>
            )}
        </div>
    );
}
