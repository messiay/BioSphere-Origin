import { useState, useCallback } from 'react';

export function UploadArea({ onAnalyze, isAnalyzing }) {
    const [textInput, setTextInput] = useState('');
    const [sanitationError, setSanitationError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);

    const sanitizeSequence = (input) => {
        // DEV TEST HOOK: allow __TEST_AMBIGUITY__ prefix to pass through
        const DEV_PREFIX = '__TEST_AMBIGUITY__';
        let devPrefix = '';
        let rawInput = input;
        if (input.startsWith(DEV_PREFIX)) {
            devPrefix = DEV_PREFIX;
            rawInput = input.slice(DEV_PREFIX.length);
        }

        // Strip FASTA headers if present
        const lines = rawInput.split('\n');
        let sequenceOnly = "";
        
        if (lines[0].trim().startsWith('>')) {
            sequenceOnly = lines.slice(1).join('');
        } else {
            sequenceOnly = lines.join('');
        }

        // 1. Strip Junk: Remove spaces, line breaks, numbers
        const clean = sequenceOnly.replace(/[\s\n\r0-9]/g, '').toUpperCase();
        
        // Update the textarea with the cleaned version (Visible Stripping)
        setTextInput(devPrefix + clean);

        // 2. ATCG Check: Find specific invalid characters
        const invalidChars = [...new Set(clean.match(/[^ATCG]/g) || [])];
        if (invalidChars.length > 0) {
            setSanitationError(`Invalid characters found: ${invalidChars.join(', ')}`);
            return null;
        }

        // 3. Length Gate: min 200bp
        if (clean.length < 200) {
            setSanitationError("Error: Sequence too short. A minimum of 200 base pairs is required for accurate taxonomic identification to prevent false positives.");
            return null;
        }

        setSanitationError('');
        return devPrefix + clean;
    };


    // Handle Drag Events
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    // Handle Drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const sanitized = sanitizeSequence(event.target.result);
                if (sanitized) {
                    if (sanitized.length < 200) {
                        setSanitationError("Error: Sequence too short. A minimum of 200 base pairs is required for accurate taxonomic identification to prevent false positives.");
                        return;
                    }
                    onAnalyze(sanitized);
                }
            };
            reader.readAsText(file);
        }
    }, [onAnalyze]);

    const handleChange = (e) => {
        setTextInput(e.target.value);
        if (sanitationError) setSanitationError('');
    };

    const handleManualSubmit = () => {
        const sanitized = sanitizeSequence(textInput);
        if (sanitized) {
            if (sanitized.length < 200) {
                setSanitationError("Error: Sequence too short. A minimum of 200 base pairs is required for accurate taxonomic identification to prevent false positives.");
                return;
            }
            onAnalyze(sanitized);
        }
    };

    return (
        <div className="bench-panel overflow-hidden md:col-span-12 animate-fade-in-up">
            {/* Header band */}
            <div className="px-6 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></div>
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Sequence Encoding Input</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">FASTA</span>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">RAW DNA</span>
                </div>
            </div>

            <div className="p-8 flex flex-col flex-1 gap-8">
                <div
                    className={`relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg transition-all duration-200 group ${dragActive ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="flex flex-col items-center text-center px-6 gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-1 transition-all ${dragActive ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400 shadow-sm'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">Drop Sequencing Data File</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">DNA (ATCG) · MIN 200BP</p>
                    </div>

                    {sanitationError && (
                        <div className="absolute inset-x-0 bottom-0 p-3 text-[10px] font-bold text-center rounded-b-lg bg-red-50 text-red-600 border-t border-red-100">
                            {sanitationError}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-[10px] uppercase font-bold tracking-[0.15em] text-slate-400">Manual Sequence Transcription</label>
                        {textInput && (
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-tighter">Attribution:</span>
                                <span className="data-stamp">{textInput.replace(/[^ATCGatcg]/g, '').length} BASE PAIRS</span>
                            </div>
                        )}
                    </div>
                    <textarea
                        className="w-full flex-1 min-h-[220px] p-5 rounded-lg bg-white border border-slate-200 font-mono text-xs leading-relaxed text-slate-700 placeholder-slate-300 resize-none transition-all focus:border-indigo-400 focus:outline-none mb-6"
                        placeholder={`>SEQUENCE_001\nATGCTAGCTAGCTAGCGTACGTAGCTCGA...`}
                        value={textInput}
                        onChange={handleChange}
                        spellCheck={false}
                    ></textarea>

                    <div className="space-y-6">
                        {/* Legal Disclaimer Panel */}
                        <div className="p-5 rounded-lg bg-red-50/50 border border-red-100 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-red-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest">Legal & Regulatory Disclaimer</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-tight text-red-800/70">1. Point-in-Time Accuracy</p>
                                    <p className="text-[9px] text-red-900/60 leading-relaxed font-medium">Database records are subject to latency, omissions, and retroactive updates. This report represents a snapshot in time.</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-tight text-red-800/70">2. Not Legal Advice</p>
                                    <p className="text-[9px] text-red-900/60 leading-relaxed font-medium">Risk Scores and 'Clear' statuses are for R&D triaging only and do not constitute formal legal advice or FTO opinion.</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-tight text-red-800/70">3. Source Limitations</p>
                                    <p className="text-[9px] text-red-900/60 leading-relaxed font-medium">This analysis does not evaluate the active enforcement status of corporate patents via paid databases (e.g., PatSeq).</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-tight text-red-800/70">4. Limitation of Liability</p>
                                    <p className="text-[9px] text-red-900/60 leading-relaxed font-medium">Bio-Provenance and founders assume zero liability for direct or indirect damages, litigation, or loss arising from reliance on this software.</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-red-100 flex items-center gap-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={isDisclaimerAccepted}
                                        onChange={(e) => setIsDisclaimerAccepted(e.target.checked)}
                                        className="h-4 w-4 rounded border-red-200 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                                    />
                                    <span className="text-[10px] font-bold text-red-800 group-hover:text-red-900 transition-colors uppercase tracking-tight">
                                        I have read and agree to the Bio-Provenance Legal Disclaimer
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-5 border-t border-slate-100">
                            <button
                                onClick={handleManualSubmit}
                                disabled={isAnalyzing || !textInput || !isDisclaimerAccepted}
                                className={`btn-primary px-10 py-3 uppercase tracking-[0.15em] text-[10px] flex items-center gap-3 ${isAnalyzing || !textInput || !isDisclaimerAccepted ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95 transition-all'}`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : "Execute"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
