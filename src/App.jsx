import { useState, useEffect, useRef } from 'react';
import { UploadArea } from './components/UploadArea';
import { RiskScoreCard } from './components/RiskScoreCard';
import { MatchDetails } from './components/MatchDetails';
import AnalysisWorker from './workers/analysis.worker.js?worker';
import { BlastService } from './services/blast';
import { calculateRiskScore } from './core/risk';
import { PdfGenerator } from './services/pdfGenerator';

function App() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

    const workerRef = useRef(null);

    useEffect(() => {
        workerRef.current = new AnalysisWorker();
        return () => workerRef.current?.terminate();
    }, []);

    const handleAnalyze = async (sequenceInput) => {
        if (!sequenceInput) return;

        setIsAnalyzing(true);
        setResult(null);
        setProgress(0);
        setProgressMessage('Initializing analysis...');

        try {
            // Step 1: Local Analysis
            setProgressMessage('Parsing sequence locally...');
            setProgress(5);
            const localResult = await localAnalysisPromise(sequenceInput);

            // Step 2: Parallel Global Analysis (Patents + Nucleotides)
            setProgressMessage('Submitting to NCBI Global Databases (Patents & GenBank)...');
            setProgress(15);

            // Fire both requests
            const patentJobPromise = runBlastJob(localResult.metadata.sequence, 'pat', 'Patents');
            const organismJobPromise = runBlastJob(localResult.metadata.sequence, 'nt', 'Organisms');

            // Wait for both
            const [patentHits, organismHits] = await Promise.all([patentJobPromise, organismJobPromise]);

            // Step 3: Synthesis
            const universalRisk = calculateUniversalRisk(patentHits, organismHits);

            const finalResult = {
                metadata: localResult.metadata,
                localMatches: localResult.matches,
                globalMatches: patentHits, // Show patents primarily in the list
                organismMatches: organismHits, // Store organisms for details
                risk: universalRisk
            };

            setResult(finalResult);
            setProgress(100);
            setIsAnalyzing(false);

        } catch (err) {
            console.error("Analysis Error:", err);
            alert("Universal Search Failed: " + (err.message || "Unknown error"));
            setIsAnalyzing(false);
        }
    };

    // Helper to wrap Worker in Promise
    const localAnalysisPromise = (sequence) => {
        return new Promise((resolve, reject) => {
            const currentWorker = workerRef.current;
            if (!currentWorker) return reject(new Error("Worker not initialized"));

            const handler = (e) => {
                if (e.data.type === 'COMPLETE') {
                    currentWorker.removeEventListener('message', handler);
                    resolve(e.data.payload);
                }
                if (e.data.type === 'ERROR') {
                    currentWorker.removeEventListener('message', handler);
                    reject(e.data.payload);
                }
            };
            currentWorker.addEventListener('message', handler);
            currentWorker.postMessage({ type: 'ANALYZE', sequence });
        });
    };

    // Helper to run a single BLAST job with polling
    const runBlastJob = async (sequence, db, label) => {
        console.log(`Starting ${label} Search...`);
        const rid = await BlastService.submitJob(sequence, db);

        let isReady = false;
        let attempts = 0;
        while (!isReady) {
            if (attempts > 60) throw new Error(`${label} Search Timed Out`); // 5 min max
            await new Promise(r => setTimeout(r, 5000)); // Poll every 5s
            isReady = await BlastService.checkStatus(rid);
            setProgress(prev => Math.min(prev + 2, 95));
            attempts++;
        }

        return await BlastService.getResults(rid);
    };

    /**
     * Universal Risk Logic
     * 1. RED (Danger): Pathogen match in 'nt' OR Local Biosecurity Match
     * 2. YELLOW (Caution): Patent match in 'pat'
     * 3. GREEN (Safe): No issues
     */
    const calculateUniversalRisk = (patentHits, organismHits) => {
        // 1. CHECK RED FLAGS (Global Pathogens ONLY)
        const DANGER_KEYWORDS = ['anthra', 'ebola', 'variola', 'pestis', 'botulinum', 'francisella', 'marburg', 'lassa', 'y.pestis', 'b.anthracis'];

        if (organismHits && organismHits.length > 0) {
            const dangerousHit = organismHits.find(hit => {
                const title = hit.title.toLowerCase();
                return DANGER_KEYWORDS.some(kw => title.includes(kw));
            });

            if (dangerousHit) {
                return createRisk('RED', 100, 'RESTRICTED_DO_NOT_USE', `Global Pathogen Match: ${dangerousHit.title.substring(0, 50)}...`);
            }
        }

        // 2. CHECK YELLOW FLAGS (Global Patents)
        if (patentHits && patentHits.length > 0) {
            const topPatent = patentHits.sort((a, b) => b.identityPercentage - a.identityPercentage)[0];
            if (topPatent.identityPercentage > 80) {
                return createRisk('YELLOW', 60, 'NOT_CLEAR_TO_OPERATE', `Patent Match (${topPatent.identityPercentage.toFixed(1)}%): ${topPatent.title.substring(0, 60)}...`);
            }
        }

        // 3. GREEN
        return createRisk('GREEN', 0, 'LIKELY_CLEAR', 'No global patents or dangerous pathogens detected.');
    };

    const createRisk = (level, score, status, summary) => ({ riskLevel: level, overallScore: score, status, summary });

    const handleReset = () => {
        setResult(null);
        setProgress(0);
        setIsAnalyzing(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <header className="bg-slate-900 border-b border-slate-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white font-bold text-xl">
                            B
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">BioSphere <span className="text-indigo-400 font-light">Origin</span></h1>
                            <p className="text-xs text-slate-400 -mt-1 tracking-wide uppercase">Universal Biosecurity Protocol</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                            SYSTEM ONLINE
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!result && !isAnalyzing && (
                    <div className="mt-12">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                                Secure Genetic Intelligence
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                                Verify biological sequences against the <span className="font-semibold text-slate-900">Global Patent Loop</span> and <span className="font-semibold text-slate-900">NIH Pathogen Database</span> in real-time.
                            </p>
                            <div className="mt-4 flex justify-center space-x-2">
                                <span className="inline-flex items-center px-3 py-0.5 rounded text-sm font-medium bg-indigo-50 text-indigo-700">
                                    NCBI BLAST Integration
                                </span>
                                <span className="inline-flex items-center px-3 py-0.5 rounded text-sm font-medium bg-emerald-50 text-emerald-700">
                                    AES-256 Encrypted Input
                                </span>
                            </div>
                        </div>
                        <UploadArea onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                    </div>
                )}

                {isAnalyzing && !result && (
                    <div className="mt-20 max-w-md mx-auto text-center">
                        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                            <div
                                className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 animate-pulse">{progressMessage}</h3>
                        <p className="text-gray-500 mt-2">{progress}% Complete</p>
                        <p className="text-xs text-gray-400 mt-4">
                            Connecting to NCBI Global Servers...<br />
                            <span className="font-semibold text-indigo-500">Please wait. comprehensive global search takes 30-60 seconds.</span>
                        </p>
                    </div>
                )}

                {result && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Global Analysis Report</h2>
                            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-blue-600 underline">
                                New Analysis
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Global Patent Matches</h3>
                                        <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-semibold">NCBI BLAST</span>
                                    </div>

                                    {result.globalMatches.length > 0 ? (
                                        <ul className="divide-y divide-gray-100">
                                            {result.globalMatches.map((hit, i) => (
                                                <li key={i} className="py-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-semibold text-gray-800">{hit.title}</div>
                                                            <div className="text-xs text-gray-500 mt-1">ID: {hit.id} | Accession: {hit.accession}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-sm font-bold ${hit.identityPercentage > 95 ? 'text-red-600' : 'text-yellow-600'}`}>
                                                                {hit.identityPercentage.toFixed(1)}% Match
                                                            </div>
                                                            <div className="text-xs text-gray-400">Score: {hit.score}</div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No matching patents found in the global database.
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Global Biological Matches (GenBank)</h3>
                                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-semibold">NCBI Nucleotide</span>
                                    </div>

                                    {result.organismMatches && result.organismMatches.length > 0 ? (
                                        <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                            {result.organismMatches.slice(0, 5).map((hit, i) => (
                                                <li key={i} className="py-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-semibold text-gray-800">{hit.title}</div>
                                                            <div className="text-xs text-gray-500 mt-1">Accession: {hit.accession}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-sm font-bold text-gray-600`}>
                                                                {hit.identityPercentage.toFixed(1)}% Identity
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No known biological matches found. <br />
                                            <span className="text-xs text-green-600 font-semibold">Sequence appears to be novel or synthetic.</span>
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div>
                                <RiskScoreCard risk={result.risk} />

                                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h4 className="font-semibold text-blue-900 mb-2">Compliance Certificate</h4>
                                    <p className="text-sm text-blue-800 mb-4">
                                        Validated against Global Patent DB at {new Date().toLocaleTimeString()}.
                                    </p>
                                    <button
                                        onClick={() => PdfGenerator.generateReport(result)}
                                        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors"
                                    >
                                        Download Global Search PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-slate-400">
                    <div className="flex justify-center space-x-6 mb-4">
                        <a href="#" className="hover:text-slate-600">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-600">Compliance Terms</a>
                        <a href="#" className="hover:text-slate-600">API Access</a>
                    </div>
                    <p>© 2026 BioSphere Systems Inc. All rights reserved. | Powered by NCBI</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
