export function MatchDetails({ matches }) {
    if (!matches || matches.length === 0) {
        return (
            <div className="mt-8 text-center text-gray-500">
                No known compliance issues found in the checked registries.
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Compliance Matches Found</h3>
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">{matches.length} Matches</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Registry ID</th>
                            <th className="px-6 py-3 font-medium">Matched Entity</th>
                            <th className="px-6 py-3 font-medium">Owner / Authority</th>
                            <th className="px-6 py-3 font-medium text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {matches.map((m, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${m.type.includes('BIO') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {m.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{m.entry.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{m.entry.name || m.entry.organism}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{m.entry.owner || m.entry.regulatoryBodies?.join(', ')}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{(m.score * 100).toFixed(0)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
