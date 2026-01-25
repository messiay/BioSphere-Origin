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
        <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-200/60 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sequence Input</h2>

            <div
                className={`relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg transition-colors duration-200 ease-in-out ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <p className="text-gray-500 mb-2">Drag and drop FASTA file here</p>
                <span className="text-sm text-gray-400">or</span>
            </div>

            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Or paste sequence manually</label>
                    <div className="space-x-2">
                        <span className="text-xs text-slate-500 mr-1">TRIAL MODE:</span>
                        <button
                            onClick={() => setTextInput("ATGAGTAAAGGATCTCCAGGCACCAACTGC")}
                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-200 transition-colors"
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
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder=">Sequence_ID\nATGCTAGCT..."
                    value={textInput}
                    onChange={handleChange}
                ></textarea>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleManualSubmit}
                    disabled={isAnalyzing || !textInput}
                    className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${isAnalyzing || !textInput ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5'}`}
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Sequence'}
                </button>
            </div>
        </div>
    );
}
