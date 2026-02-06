import { useState, useEffect, useRef } from 'react';
import { UploadArea } from './components/UploadArea';
import { RiskScoreCard } from './components/RiskScoreCard';
import { MatchDetails } from './components/MatchDetails';
import { CountrySelector } from './components/CountrySelector';
import { ComplianceReportCard } from './components/ComplianceReportCard';
import { Documentation } from './components/Documentation';
import AnalysisWorker from './workers/analysis.worker.js?worker';
import { BlastService } from './services/blast';
import { calculateRiskScore } from './core/risk';
import { PdfGenerator } from './services/pdfGenerator';
import { evaluateCompliance } from './services/compliance';

function App() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('GLOBAL');
    const [complianceReport, setComplianceReport] = useState(null);
    const [showDocs, setShowDocs] = useState(false);

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

            // Step 4: Regulatory Compliance Evaluation
            setProgressMessage('Evaluating regulatory compliance...');
            const compliance = evaluateCompliance(organismHits, selectedCountry);
            setComplianceReport(compliance);

            const finalResult = {
                metadata: localResult.metadata,
                localMatches: localResult.matches,
                globalMatches: patentHits, // Show patents primarily in the list
                organismMatches: organismHits, // Store organisms for details
                risk: universalRisk,
                compliance // Add compliance to result
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

        try {
            // Adaptive Polling Strategy
            // fast poll (3s) for first 15s, then slow poll (10s)
            let attempts = 0;
            while (await BlastService.checkStatus(rid) === false) {
                attempts++;
                const waitTime = attempts < 5 ? 3000 : 10000;
                await new Promise(resolve => setTimeout(resolve, waitTime));

                // Smoother progress bar update
                setProgress(prev => Math.min(prev + 1, 98));

                if (attempts > 120) throw new Error(`${label} Search Timed Out (Limit: 20 mins)`); // 120 * 10s = 1200s = 20 mins
            }
            const results = await BlastService.getResults(rid);
            // Save to cache for next time!
            BlastService.saveCache(sequence, db, results);
            return results;
        } catch (e) {
            console.error(`Error during ${label} BLAST job:`, e);
            throw e;
        }
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
        setComplianceReport(null);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
            {/* Professional Scientific Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-14 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-teal-700 text-white font-bold text-lg font-mono tracking-tighter">
                        BP
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">BioSphere Origin</h1>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider leading-none">Protocol v2.1.0-RC</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-600 font-mono tracking-wide">NCBI: CONNECTED</span>
                    </div>

                    <button
                        onClick={() => setShowDocs(true)}
                        className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1.5 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Protocol Docs
                    </button>

                    <div className="w-px h-6 bg-slate-200 mx-1"></div>

                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-800">U</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                {!result && !isAnalyzing && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up">
                        {/* Sidebar / Configuration Panel */}
                        <div className="md:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm h-fit">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Configuration</h2>

                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Compliance Jurisdiction</label>
                                <CountrySelector
                                    selectedCountry={selectedCountry}
                                    onCountryChange={setSelectedCountry}
                                />
                                <p className="textxs text-slate-400 mt-2 leading-tight">
                                    Select the legal framework for compliance cross-referencing.
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded p-3">
                                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    System Status
                                </h4>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-blue-700">NCBI BLAST API</span>
                                        <span className="font-mono text-emerald-600">ONLINE</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-blue-700">Patent Database</span>
                                        <span className="font-mono text-emerald-600">INDEXED</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Input Panel */}
                        <div className="md:col-span-8">
                            <UploadArea onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                        </div>
                    </div>
                )}

                {isAnalyzing && !result && (
                    <div className="mt-12 max-w-2xl mx-auto text-center fade-in">

                        {/* Progress Status */}
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-lg mx-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 font-mono">Running Protocol...</h3>
                                <span className="text-2xl font-bold text-teal-600 font-mono">{progress}%</span>
                            </div>

                            <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                                <div
                                    className="absolute top-0 left-0 h-full bg-teal-500 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-500 border-t-transparent"></div>
                                <p className="text-xs font-mono text-slate-600">{progressMessage}</p>
                            </div>
                        </div>
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
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Global Patent Matches</h3>
                                        <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-teal-100">NCBI BLAST: PAT</span>
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
                                {/* Compliance Report Card */}
                                {complianceReport && (
                                    <div className="mb-6">
                                        <ComplianceReportCard complianceReport={complianceReport} />
                                    </div>
                                )}

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
            {/* Documentation Modal */}
            {showDocs && <Documentation onClose={() => setShowDocs(false)} />}
        </div>
    );
}

export default App;

