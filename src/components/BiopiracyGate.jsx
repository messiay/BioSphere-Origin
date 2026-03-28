import { useState } from 'react';

export function BiopiracyGate({ onProceed }) {
    const [isIndian, setIsIndian] = useState(null);
    const [hasForeignVC, setHasForeignVC] = useState(null);

    const isTriggered = isIndian === true && hasForeignVC === true;

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="text-lg">⚖️</span> NBA Biopiracy Screening
            </h3>

            <div className="space-y-4">
                <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                        1. Does this genetic resource originate from Indian biological diversity?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsIndian(true)}
                            className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${isIndian === true ? 'bg-teal-600 text-white border-teal-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            YES
                        </button>
                        <button
                            onClick={() => setIsIndian(false)}
                            className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${isIndian === false ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            NO
                        </button>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                        2. Does your entity have any foreign investment or shareholding?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setHasForeignVC(true)}
                            className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${hasForeignVC === true ? 'bg-teal-600 text-white border-teal-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            YES
                        </button>
                        <button
                            onClick={() => setHasForeignVC(false)}
                            className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${hasForeignVC === false ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            NO
                        </button>
                    </div>
                </div>

                {isTriggered && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 animate-shake">
                        <h4 className="text-[10px] font-bold text-red-800 flex items-center gap-2 mb-1">
                            ⚠️ NBA ALERT: FORM 3 REQUIRED
                        </h4>
                        <p className="text-[10px] text-red-700 leading-tight">
                            Under Section 6 of the Biological Diversity Act (2002), any person/entity with foreign participation requires **Form 3 Clearance** before applying for a patent on Indian biological resources. 
                        </p>
                        <a 
                            href="http://nbaindia.org/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] text-red-800 font-bold underline mt-1 inline-block"
                        >
                            Visit National Biodiversity Authority (NBA) →
                        </a>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        onClick={() => onProceed({ isIndian, hasForeignVC, isTriggered })}
                        disabled={isIndian === null || hasForeignVC === null || isTriggered}
                        className={`w-full py-2 rounded text-xs font-bold transition-all ${isIndian === null || hasForeignVC === null || isTriggered ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'}`}
                    >
                        CONFIRM & PROCEED TO SCAN
                    </button>
                </div>
            </div>
        </div>
    );
}
