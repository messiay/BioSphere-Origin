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
        RESTRICTED_DO_NOT_USE: 'DANGER / ILLEGAL'
    };

    const colors = colorMap[riskLevel] || colorMap.GREEN;

    return (
        <div className={`${colors.bg} border-l-4 ${colors.border} rounded-md p-5 shadow-sm`}>
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
                        <h3 className={`text-lg font-bold ${colors.text} tracking-tight`}>{riskLevel} RISK DETECTED</h3>
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
                    <p className={`text-xs font-medium ${colors.text} leading-relaxed`}>
                        {riskLevel === 'YELLOW' && "Warning: High similarity to patented sequences associated with corporate usage rights."}
                        {riskLevel === 'RED' && "CRITICAL: Pathogenic signature detected. Matches restriction lists for select agents."}
                    </p>
                </div>
            )}
        </div>
    );
}
