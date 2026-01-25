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
        <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <span className="text-3xl">{colors.icon}</span>
                    <div>
                        <h3 className={`text-2xl font-bold ${colors.text}`}>{riskLevel} RISK</h3>
                        <p className={`text-sm font-medium ${colors.text} opacity-80`}>{statusMap[status] || status}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-4xl font-bold ${colors.text}`}>{overallScore}%</div>
                    <div className={`text-xs uppercase tracking-wider ${colors.text} opacity-70`}>Risk Score</div>
                </div>
            </div>

            {riskLevel === 'YELLOW' && (
                <div className="bg-white/50 p-3 rounded mt-2 text-sm text-yellow-800">
                    <strong>PATENT INFRINGEMENT RISK:</strong> Sequence is owned by a corporation/university.
                    Commercial licensing required.
                </div>
            )}
            {riskLevel === 'RED' && (
                <div className="bg-white/50 p-3 rounded mt-2 text-sm text-red-800">
                    <strong>BIOSECURITY ALERT:</strong> Matches a known pathogen/weapon.
                    Do not synthesize. Possession may be a federal crime.
                </div>
            )}
        </div>
    );
}
