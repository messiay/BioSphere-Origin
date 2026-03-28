import { useMemo } from 'react';

export function SequenceVisualizer({ sequenceLength, matches }) {
    // Canvas dimensions
    const width = 800;
    const height = 120;
    const margin = { top: 30, right: 20, bottom: 20, left: 20 };

    // Scale factor: pixels per base pair
    const scale = (width - margin.left - margin.right) / sequenceLength;

    const processedMatches = useMemo(() => {
        if (!matches) return [];
        // Flatten both global patents and organism matches if passed in a mixed array, 
        // OR just handle the specific list passed to this component.
        // Assuming 'matches' involves standardized hit objects with queryFrom/queryTo

        return matches.map(match => ({
            ...match,
            x: match.queryFrom * scale,
            w: Math.max((match.queryTo - match.queryFrom) * scale, 2), // Ensure at least 2px width
            color: match.identityPercentage > 95 ? '#ef4444' : '#eab308', // Red for exact/high, Yellow for risk
            type: match.identityPercentage > 95 ? 'CRITICAL' : 'WARNING'
        })).sort((a, b) => b.identityPercentage - a.identityPercentage); // Draw high risk on top
    }, [matches, scale]);

    const coverage = useMemo(() => {
        if (!matches || matches.length === 0) return 0;
        // Simple approximation of unique coverage
        const sorted = [...matches].sort((a, b) => a.queryFrom - b.queryFrom);
        let total = 0;
        let lastEnd = 0;
        for (const m of sorted) {
            if (m.queryTo > lastEnd) {
                total += m.queryTo - Math.max(m.queryFrom, lastEnd);
                lastEnd = m.queryTo;
            }
        }
        const result = ((total / sequenceLength) * 100);
        return (result > 100 ? 100 : result).toFixed(1);
    }, [matches, sequenceLength]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Alignment Visualizer</h3>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Query Coverage</span>
                    <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{coverage}%</span>
                </div>
            </div>

            <div className="relative overflow-x-auto py-4">
                <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="w-full">
                    {/* Background Track */}
                    <rect
                        x={margin.left}
                        y={height / 2 - 4}
                        width={width - margin.left - margin.right}
                        height={8}
                        fill="#f1f5f9"
                        rx={4}
                    />

                    {/* Sequence Length Markers */}
                    <text x={margin.left} y={height / 2 + 25} className="text-[10px] font-bold fill-slate-300 font-mono" textAnchor="start">1 bp</text>
                    <text x={width - margin.right} y={height / 2 + 25} className="text-[10px] font-bold fill-slate-300 font-mono" textAnchor="end">{sequenceLength} bp</text>

                    {/* Matches */}
                    {processedMatches.map((match, i) => (
                        <g key={i} className="group cursor-pointer">
                            <rect
                                x={margin.left + match.x}
                                y={height / 2 - 10}
                                width={match.w}
                                height={20}
                                fill={match.color}
                                rx={2}
                                opacity={0.6}
                                className="group-hover:opacity-100 transition-opacity"
                            />
                            {/* Hotspot Pulse */}
                            {match.identityPercentage > 98 && (
                                <rect
                                    x={margin.left + match.x}
                                    y={height / 2 - 10}
                                    width={match.w}
                                    height={20}
                                    fill="none"
                                    stroke={match.color}
                                    strokeWidth="1"
                                    rx={2}
                                    className="animate-pulse"
                                />
                            )}
                            
                            <title>{`${match.title} (${match.identityPercentage.toFixed(1)}%) \nRange: ${match.queryFrom} - ${match.queryTo}`}</title>
                        </g>
                    ))}
                </svg>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-tight">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-sm shadow-sm"></span>
                    <span className="text-slate-500">Pathogen/Patent Hit (&gt;95%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-sm shadow-sm"></span>
                    <span className="text-slate-500">Regulatory Concern (&gt;80%)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                    <span className="w-3 h-3 bg-slate-100 border border-slate-200 rounded-sm"></span>
                    <span>Novel Synthesis Zone</span>
                </div>
            </div>
        </div>
    );
}
