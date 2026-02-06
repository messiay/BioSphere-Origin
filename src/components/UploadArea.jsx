import { useState, useCallback } from 'react';

export function UploadArea({ onAnalyze, isAnalyzing }) {
    const [textInput, setTextInput] = useState('');
    const [dragActive, setDragActive] = useState(false);

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
                onAnalyze(event.target.result);
            };
            reader.readAsText(file);
        }
    }, [onAnalyze]);

    const handleChange = (e) => {
        setTextInput(e.target.value);
    };

    const handleManualSubmit = () => {
        onAnalyze(textInput);
    };

    return (
        <div className="card p-6 h-full flex flex-col">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-6 border-b border-slate-100 pb-2">Sequence Input</h2>

            <div
                className={`relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-md transition-colors duration-200 ease-in-out ${dragActive ? 'border-teal-500 bg-teal-50/10' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center text-slate-500">
                    <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium text-sm">Drag FASTA / TXT file</p>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Or paste sequence manually</label>
                    <div className="space-x-2">
                        <span className="text-xs text-slate-500 mr-1">TRIAL MODE:</span>
                        <button
                            onClick={() => setTextInput("ATGAGTAAAGGATCTCCAGGCACCAACTGC")}
                            className="text-[10px] font-mono px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 transition-colors uppercase tracking-tight"
                        >
                            Load CRISPR (Patent)
                        </button>
                        <button
                            onClick={() => setTextInput("ATGAAATTAAAAGACAAATTT")}
                            className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 border border-red-200 transition-colors"
                        >
                            Load Anthrax (Biohazard)
                        </button>
                    </div>
                </div>
                <textarea
                    className="w-full h-40 p-4 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono text-xs leading-relaxed text-slate-700 placeholder-slate-400 bg-white"
                    placeholder={`>SEQUENCE_001\nATGCTAGCTAGCTAGCGTACGTAGCT...`}
                    value={textInput}
                    onChange={handleChange}
                    spellCheck={false}
                ></textarea>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleManualSubmit}
                    disabled={isAnalyzing || !textInput}
                    className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${isAnalyzing || !textInput ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5'}`}
                >
                    {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Processing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>Start Analysis Protocol</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
