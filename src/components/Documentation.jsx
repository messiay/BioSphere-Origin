import { useState } from 'react';

export function Documentation({ onClose }) {
    const [activeTab, setActiveTab] = useState('risk');

    const tabs = [
        { id: 'risk', label: 'Risk Signals', icon: '🚦' },
        { id: 'compliance', label: 'Compliance Engine', icon: '⚖️' },
        { id: 'performance', label: 'Performance', icon: '⚡' },
        { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50/95 backdrop-blur-sm p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden min-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 text-white px-8 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">How BioSphere Works</h2>
                        <p className="text-indigo-300 mt-1">Transparency regarding our analysis logic, compliance, and privacy.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">

                    {/* RISK SIGNALS TAB */}
                    {activeTab === 'risk' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="prose max-w-none text-slate-700">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Understanding the Traffic Light System</h3>
                                <p>BioSphere Origin simplifies complex biological risk into a clear, three-tier "Traffic Light" system designed for rapid decision-making.</p>
                            </div>

                            <div className="grid gap-6">
                                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
                                        <h4 className="text-lg font-bold text-red-900">RED: Critical Danger</h4>
                                    </div>
                                    <p className="text-red-800 mb-2 font-medium">Restricted / Prohibited Agents Detected</p>
                                    <p className="text-sm text-red-700">
                                        <span className="font-bold">Trigger:</span> Matches a known pathogen (e.g., Anthrax, Ebola) or a sequence restricted by your selected jurisdiction's laws.
                                    </p>
                                    <p className="text-sm text-red-700 mt-1">
                                        <span className="font-bold">Action:</span> Verify authorization immediately. Do not synthesize or export without specific licenses.
                                    </p>
                                </div>

                                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <h4 className="text-lg font-bold text-yellow-900">YELLOW: Warning / Caution</h4>
                                    </div>
                                    <p className="text-yellow-800 mb-2 font-medium">Patent Overlap or Dual-Use Concern</p>
                                    <p className="text-sm text-yellow-700">
                                        <span className="font-bold">Trigger:</span> High similarity (>80%) to existing patented sequences or "dual-use" items that require export controls.
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        <span className="font-bold">Action:</span> Review patent ownership. Check export license requirements if shipping internationally.
                                    </p>
                                </div>

                                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <h4 className="text-lg font-bold text-green-900">GREEN: Clear</h4>
                                    </div>
                                    <p className="text-green-800 mb-2 font-medium">Likely Safe / No Restrictions Found</p>
                                    <p className="text-sm text-green-700">
                                        <span className="font-bold">Trigger:</span> Matches harmless organisms (e.g., standard lab strains) or no matches in patent/pathogen databases.
                                    </p>
                                    <p className="text-sm text-green-700 mt-1">
                                        <span className="font-bold">Action:</span> Proceed with standard laboratory safety protocols.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* COMPLIANCE ENGINE TAB */}
                    {activeTab === 'compliance' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="prose max-w-none text-slate-700">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Zonal Compliance Engine</h3>
                                <p>
                                    Biology does not respect borders, but the law does. A sequence that is perfectly legal to study in one country may be a federally restricted agent in another.
                                    Our <strong>Compliance Engine</strong> solves this by cross-referencing your DNA sequence against country-specific legal frameworks.
                                </p>

                                <h4 className="text-lg font-bold text-slate-900 mt-6">How It Works:</h4>
                                <ol className="list-decimal pl-5 space-y-2">
                                    <li><strong>Identification:</strong> We use NCBI BLAST to identify the organism your sequence codes for.</li>
                                    <li><strong>Jurisdiction Selection:</strong> You select your operating region (e.g., US, EU, China) via the Country Selector.</li>
                                    <li><strong>Regulatory Cross-Check:</strong> Our engine checks the identified organism against that specific country's prohibited list (e.g., US Select Agent Program, EU Dual-Use Regulation).</li>
                                </ol>

                                <h4 className="text-lg font-bold text-slate-900 mt-6">Supported Frameworks:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <FrameworkCard
                                        country="United States"
                                        law="CDC/USDA Select Agent Program"
                                        link="https://www.selectagents.gov/"
                                        desc="Regulates possession, use, and transfer of biological agents and toxins."
                                    />
                                    <FrameworkCard
                                        country="European Union"
                                        law="EU Dual-Use Regulation (2021/821)"
                                        link="https://ec.europa.eu/trade/import-and-export-rules/export-from-eu/dual-use-controls/"
                                        desc="Controls exports of items including software and technology that can have both civil and military applications."
                                    />
                                    <FrameworkCard
                                        country="United Kingdom"
                                        law="Export Control Joint Unit (ECJU)"
                                        link="https://www.gov.uk/government/organisations/export-control-joint-unit"
                                        desc="Manages strategic export controls and licensing for military and dual-use items."
                                    />
                                    <FrameworkCard
                                        country="China"
                                        law="Biosecurity Law (2021)"
                                        link="http://english.mofcom.gov.cn/"
                                        desc="Holistic national security framework governing pathogenic microbiology and genetic resources."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PERFORMANCE TAB */}
                    {activeTab === 'performance' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="prose max-w-none text-slate-700">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Why does analysis take time?</h3>
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                                    <p className="font-semibold text-blue-900">
                                        Real-time analysis typically takes 10–30 seconds. Here is the honest technical reason why:
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">1</div>
                                        <div>
                                            <h5 className="font-bold text-slate-900">The "Billions" Problem</h5>
                                            <p className="text-sm text-slate-600 mt-1">
                                                We are not just checking a small list. We are querying the <strong>NCBI Global Database</strong>, which contains over <strong>2.4 Billion</strong> nucleotide sequences. This ensures we don't miss anything, but searching a dataset that large takes raw computing power.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">2</div>
                                        <div>
                                            <h5 className="font-bold text-slate-900">Public Public Queue</h5>
                                            <p className="text-sm text-slate-600 mt-1">
                                                To keep this tool free and accessible, we utilize the public NCBI BLAST Cloud. This is a shared resource used by scientists worldwide. During peak hours, your request joins a queue.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">3</div>
                                        <div>
                                            <h5 className="font-bold text-slate-900">Adaptive Polling (Optimization)</h5>
                                            <p className="text-sm text-slate-600 mt-1">
                                                We have optimized our system to "poll" (check for results) intelligently. We start checking quickly (every 5s) and then back off if the server is busy, ensuring you get results as soon as they are ready without spamming the network.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mt-4">
                                        <h5 className="font-bold text-slate-900 mb-2">Does a shorter sequence run faster?</h5>
                                        <p className="text-sm text-slate-600">
                                            <strong>Not necessarily.</strong> While shorter sequences take less time to compute, the main wait time is the <strong>Public Queue</strong>.
                                            Whether you send 100 letters or 1,000 letters, you still have to wait in line for an available server slot.
                                            <br /><br />
                                            <em>Tip: Extremely short sequences (under 20 letters) may actually fail or take longer because they match too many random things!</em>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <h4 className="font-bold text-slate-900 mb-2">Want Instant Speed?</h4>
                                    <p className="text-sm text-slate-600">
                                        We cache results locally in your browser. If you (or your team) analyze the same sequence twice,
                                        the second time is <strong>instant (0s)</strong> because we securely retrieve the previous safety report.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRIVACY POLICY TAB */}
                    {activeTab === 'privacy' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="prose max-w-none text-slate-700">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Privacy & Data Security</h3>
                                <p className="text-lg leading-relaxed mb-6">
                                    We operate on a <strong>"Transient Analysis"</strong> model. We believe your genetic IP is yours alone.
                                </p>

                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-2">🔒 No Long-Term Storage</h4>
                                        <p className="text-sm text-slate-600">
                                            We do not store your uploaded DNA sequences in any central database.
                                            Once analysis is complete and you close your session, the data is flushed from our working memory.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-2">🛡️ Local Caching Only</h4>
                                        <p className="text-sm text-slate-600">
                                            "Instant Results" are powered by your own browser's local storage.
                                            This cache lives on <strong>your device</strong>, not our servers. You can clear it anytime by clearing browser data.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-2">📡 Secure Proxying</h4>
                                        <p className="text-sm text-slate-600">
                                            When querying NCBI, we act as a blind proxy. We forward the sequence for analysis and return the result.
                                            NCBI's own privacy policy applies to the search queries processed on their cloud.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-2">🕵️ No IP Mining</h4>
                                        <p className="text-sm text-slate-600">
                                            Unlike some competitors, we do not mine your search history to build proprietary datasets or claim ownership of your discoveries.
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 mt-8 border-t border-slate-100 pt-4">
                                    Last Updated: February 2026. This policy represents our commitment to "Privacy by Design" principles.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function FrameworkCard({ country, law, link, desc }) {
    return (
        <div className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
            <h5 className="font-bold text-slate-900">{country}</h5>
            <p className="text-xs font-semibold text-indigo-600 mt-1">{law}</p>
            <p className="text-sm text-slate-600 mt-2 mb-3">{desc}</p>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 group"
            >
                View Official Regulation
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
        </div>
    );
}
