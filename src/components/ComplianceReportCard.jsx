import { STATUS_LABELS, SEVERITY_LEVELS } from '../data/regulations';

export function ComplianceReportCard({ complianceReport }) {
    if (!complianceReport) return null;

    const { jurisdiction, flagIcon, authority, status, severity, overallRisk, violations, summary } = complianceReport;

    // Color mapping based on severity
    const severityColors = {
        CRITICAL: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-900',
            badge: 'bg-red-600',
            icon: 'text-red-600'
        },
        HIGH: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-900',
            badge: 'bg-orange-600',
            icon: 'text-orange-600'
        },
        MEDIUM: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-900',
            badge: 'bg-yellow-600',
            icon: 'text-yellow-600'
        },
        LOW: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-900',
            badge: 'bg-green-600',
            icon: 'text-green-600'
        }
    };

    const colors = severityColors[severity] || severityColors.LOW;

    return (
        <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 shadow-lg`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">{flagIcon}</span>
                    <div>
                        <h3 className={`text-lg font-bold ${colors.text}`}>{jurisdiction}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">{authority}</p>
                    </div>
                </div>
                <div className={`${colors.badge} px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wide`}>
                    {SEVERITY_LEVELS[severity]?.label || severity}
                </div>
            </div>

            {/* Risk Score */}
            <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase">Compliance Risk</span>
                    <span className={`text-2xl font-extrabold ${colors.text}`}>{overallRisk}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                        className={`h-full ${colors.badge} transition-all duration-500`}
                        style={{ width: `${overallRisk}%` }}
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200">
                <p className={`text-sm font-medium ${colors.text}`}>{summary}</p>
            </div>

            {/* Violations Details */}
            {violations.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Regulatory Violations</h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {violations.map((violation, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                {/* Organism Name */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-900 text-sm">{violation.organism}</h5>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Accession: {violation.accession} • Match: {violation.identityPercentage.toFixed(1)}%
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold ${colors.text} px-2 py-1 rounded ${colors.bg}`}>
                                        {STATUS_LABELS[violation.status] || violation.status}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-slate-700 mb-2">{violation.description}</p>

                                {/* Citation */}
                                <div className="bg-slate-50 rounded p-2 mb-2">
                                    <p className="text-xs font-mono text-slate-600">
                                        <span className="font-bold">Citation:</span> {violation.citation}
                                    </p>
                                </div>

                                {/* Guidance */}
                                <p className="text-xs text-slate-600 italic mb-2">{violation.guidance}</p>

                                {/* Learn More Link */}
                                {violation.link && (
                                    <a
                                        href={violation.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-600 hover:text-indigo-800 underline font-semibold"
                                    >
                                        Learn More →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Clear Status Message */}
            {violations.length === 0 && (
                <div className="text-center py-6">
                    <div className="text-5xl mb-2">✓</div>
                    <p className="text-lg font-bold text-green-700">Clear to Operate</p>
                    <p className="text-sm text-slate-600 mt-1">No regulated agents detected for this jurisdiction.</p>
                </div>
            )}

            {/* Footer Disclaimer */}
            <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                    ⚖️ This is a <span className="font-semibold">preliminary assessment</span> and does not constitute legal advice.
                    Consult with regulatory authorities for official guidance.
                </p>
            </div>
        </div>
    );
}
