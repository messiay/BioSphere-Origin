import { useState } from 'react';

const QUICK_REF = [
    { label: 'NBA Act Section 3',  text: 'Access to biological resources requires prior approval of the National Biodiversity Authority.' },
    { label: 'NBA Act Section 6',  text: 'Any patent application relating to a bio-resource must get NBA clearance before filing.' },
    { label: 'SCOMET Category',    text: 'Biological agents and toxins are controlled under SCOMET DGFT regulations in India.' },
    { label: 'WIPO ST.26',         text: 'Standard for nucleotide & amino acid sequence listings in patent applications (Jan 2022+).' },
    { label: '200 bp Minimum',     text: 'Sequences shorter than 200bp cannot be accurately attributed to a single taxon (BioSphere policy).' },
];

const NCBI_LINKS = [
    { label: 'NCBI BLAST',       url: 'https://blast.ncbi.nlm.nih.gov/',      desc: 'Sequence alignment tool' },
    { label: 'GenBank',          url: 'https://www.ncbi.nlm.nih.gov/genbank/', desc: 'Nucleotide sequence DB' },
    { label: 'Taxonomy Browser', url: 'https://www.ncbi.nlm.nih.gov/taxonomy', desc: 'TaxID lookup' },
    { label: 'IPO India',        url: 'https://ipindia.gov.in/',               desc: 'Indian Patent Office' },
    { label: 'NBA India',        url: 'http://nbaindia.org/',                  desc: 'National Biodiversity Authority' },
    { label: 'WIPO PatentScope', url: 'https://patentscope.wipo.int/',         desc: 'International patents' },
];

const RISK_LEVELS = [
    { label: 'SAFE',      score: '0–30',   color: '#059669', desc: 'Clear to operate. Low IP and sovereignty risk.' },
    { label: 'CAUTION',   score: '31–60',  color: '#D97706', desc: 'Review required. Potential IP conflicts.' },
    { label: 'AMBIGUOUS', score: '61–74',  color: '#9333EA', desc: 'Tie detected. Lab sourcing records needed.' },
    { label: 'HIGH RISK', score: '75–89',  color: '#DC2626', desc: 'Significant legal exposure. NBA review mandatory.' },
    { label: 'CRITICAL',  score: '90–100', color: '#B91C1C', desc: 'NBA Sovereign Biopiracy. Do not file without clearance.' },
];

const NavItem = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full group relative flex items-center justify-center py-4 transition-all duration-300 ${
            isActive ? 'bg-indigo-50 border-r-2 border-indigo-600' : 'hover:bg-slate-50'
        }`}
        title={label}
    >
        <div className={`transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {icon}
        </div>
    </button>
);

export function BioSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activePanel, setActivePanel] = useState('quick-ref');

    const navItems = [
        { 
            id: 'quick-ref', 
            label: 'Quick Reference',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="4" y1="7" x2="20" y2="7"></line>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="17" x2="20" y2="17"></line>
                </svg>
            )
        },
        { 
            id: 'links', 
            label: 'Resources & Links',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
            )
        },
        { 
            id: 'risk-key',
            label: 'Risk Score Key',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z"></path>
                    <polyline points="12 22 12 12 21 7.5"></polyline>
                    <polyline points="12 12 3 7.5"></polyline>
                </svg>
            )
        },
    ];

    const navClick = (id) => {
        if (activePanel === id && isOpen) {
            setIsOpen(false);
        } else {
            setActivePanel(id);
            setIsOpen(true);
        }
    };

    return (
        <div className="flex sticky top-12 h-[calc(100vh-48px)] z-30 shrink-0">
            {/* ── Icon Rail ───────────────── */}
            <div className="w-14 flex flex-col items-center pt-4 pb-3 bg-white border-r border-slate-200">
                {navItems.map(item => (
                    <NavItem 
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activePanel === item.id && isOpen}
                        onClick={() => navClick(item.id)}
                    />
                ))}
                <div className="mt-auto text-[9px] font-bold text-slate-400 text-center tracking-widest pb-4">
                    V2.2
                </div>
            </div>

            {/* ── Slide-out Panel ─────────── */}
            {isOpen && (
                <div className="w-[280px] flex flex-col bg-white border-r border-slate-200 animate-slide-in-left shadow-[4px_0_12px_rgba(0,0,0,0.03)]">
                    <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            {navItems.find(n => n.id === activePanel)?.label}
                        </span>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold"
                        >✕</button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {activePanel === 'quick-ref' && QUICK_REF.map((ref, i) => (
                            <div key={i} className="p-4 bg-white border border-slate-100 rounded-lg hover:border-indigo-100 transition-colors">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">{ref.label}</p>
                                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{ref.text}</p>
                            </div>
                        ))}

                        {activePanel === 'links' && NCBI_LINKS.map((link, i) => (
                            <a 
                                key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                className="group flex items-start justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-white transition-all"
                            >
                                <div>
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{link.label}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{link.desc}</p>
                                </div>
                                <span className="text-indigo-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all font-bold">↗</span>
                            </a>
                        ))}

                        {activePanel === 'risk-key' && (
                            <div className="space-y-2">
                                {RISK_LEVELS.map((lvl, i) => (
                                    <div key={i} className="p-4 bg-white border border-slate-100 border-l-4 rounded-r-lg" style={{ borderLeftColor: lvl.color }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: lvl.color }}>{lvl.label}</span>
                                            <span className="text-[9px] font-mono font-bold bg-slate-50 px-2 py-0.5 rounded text-slate-500 border border-slate-100">{lvl.score}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-snug font-medium">{lvl.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
