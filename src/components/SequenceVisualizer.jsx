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

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Sequence Coverage Map</h3>
            <div className="relative overflow-x-auto">
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
                    <text x={margin.left} y={height / 2 + 25} className="text-xs fill-slate-400" textAnchor="start">1 bp</text>
                    <text x={width - margin.right} y={height / 2 + 25} className="text-xs fill-slate-400" textAnchor="end">{sequenceLength} bp</text>

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
                                opacity={0.7}
                                className="group-hover:opacity-100 transition-opacity"
                            />
                            {/* Label on bar */}
                            <text
                                x={margin.left + match.x + (match.w / 2)}
                                y={height / 2 - 14}
                                textAnchor="middle"
                                className="text-[10px] fill-slate-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono"
                                fontSize="10"
                            >
                                {match.queryFrom}-{match.queryTo}
                            </text>

                            {/* Simple Tooltip on Hover via Title tag (native) */}
                            <title>{`${match.title} (${match.identityPercentage.toFixed(1)}%) \nRange: ${match.queryFrom} - ${match.queryTo}`}</title>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="mt-2 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded mr-2"></span>
                    <span className="text-slate-600">High Identity (>95%)</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded mr-2"></span>
                    <span className="text-slate-600">Partial Match (>80%)</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-slate-200 rounded mr-2"></span>
                    <span className="text-slate-600">Safe Region</span>
                </div>
            </div>
        </div>
    );
}
