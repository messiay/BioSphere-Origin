import { STATUS_LABELS, SEVERITY_LEVELS } from '../data/regulations';

export function ComplianceReportCard({ complianceReport }) {
    if (!complianceReport) return null;

    const { jurisdiction, flagIcon, authority, severity, overallRisk, violations, summary } = complianceReport;

    // Strict Subtle Enterprise Color Mapping based on severity
    const severityColors = {
        CRITICAL: {
            bg: 'bg-white',
            border: 'border-slate-200',
            text: 'text-slate-900',
            badge: 'bg-red-50 text-red-700 border-red-200',
            progress: 'bg-red-600'
        },
        HIGH: {
            bg: 'bg-white',
            border: 'border-slate-200',
            text: 'text-slate-900',
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
            progress: 'bg-amber-600'
        },
        MEDIUM: {
            bg: 'bg-white',
            border: 'border-slate-200',
            text: 'text-slate-900',
            badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            progress: 'bg-yellow-500'
        },
        LOW: {
            bg: 'bg-white',
            border: 'border-slate-200',
            text: 'text-slate-900',
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            progress: 'bg-emerald-600'
        }
    };

    const colors = severityColors[severity] || severityColors.LOW;

    return (
        <div className={`bg-white border border-slate-200 rounded-md shadow-sm mb-6`}>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{flagIcon}</span>
                    <div className="flex flex-col">
                        <h3 className={`text-sm font-semibold tracking-wide ${colors.text}`}>{jurisdiction}</h3>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{authority}</p>
                    </div>
                </div>
                <div className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-widest ${colors.badge}`}>
                    {SEVERITY_LEVELS[severity]?.label || severity}
                </div>
            </div>

            {/* Risk Score */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-6">
                <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Compliance Threat Level</span>
                        <span className={`text-xs font-mono font-bold ${colors.text}`}>{overallRisk}% MATCH</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-sm h-1.5 overflow-hidden">
                        <div
                            className={`h-full ${colors.progress} transition-all duration-500`}
                            style={{ width: `${overallRisk}%` }}
                        />
                    </div>
                </div>
                
                <div className="w-1/2 p-2 bg-white rounded border border-slate-200">
                    <p className={`text-[10px] font-medium leading-tight text-slate-700`}>{summary}</p>
                </div>
            </div>

            {/* Violations Details */}
            {violations.length > 0 && (
                <div>
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Regulatory Violations ({violations.length})</h4>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                        {violations.map((violation, idx) => (
                            <div key={idx} className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors">
                                {/* Organism Name & Status */}
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h5 className="font-semibold text-slate-900 text-sm">{violation.organism}</h5>
                                        <div className="flex items-center gap-3 text-xs mt-1">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Accession:</span>
                                                <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">{violation.accession}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Identity:</span>
                                                <span className="font-mono text-[10px] font-bold text-slate-700">{violation.identityPercentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-700 border-red-200 whitespace-nowrap`}>
                                        {STATUS_LABELS[violation.status] || violation.status}
                                    </span>
                                </div>

                                {/* Description & Citation Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-1">
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Violation Detail</span>
                                        <p className="text-slate-700 leading-relaxed">{violation.description}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Legal Citation</span>
                                        <p className="font-mono text-[10px] text-slate-600 bg-slate-100 p-1.5 rounded border border-slate-200">
                                            {violation.citation}
                                        </p>
                                    </div>
                                </div>

                                {/* Guidance */}
                                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 border-dashed">
                                    <p className="text-[10px] text-slate-500 font-medium italic">
                                        Action/Guidance: {violation.guidance}
                                    </p>
                                    {violation.link && (
                                        <a
                                            href={violation.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 hover:text-indigo-800"
                                        >
                                            View Regulation 
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Clear Status Message */}
            {violations.length === 0 && (
                <div className="text-center py-6 px-4">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-1">Clear to Operate</p>
                    <p className="text-[10px] text-slate-500 font-medium">No regulated agents detected for this region's operational jurisdiction.</p>
                </div>
            )}

            {/* Footer Disclaimer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                <p className="text-[9px] text-slate-500 text-center font-mono uppercase tracking-widest">
                    This is a preliminary evaluation. Does not constitute binding legal counsel.
                </p>
            </div>
        </div>
    );
}
