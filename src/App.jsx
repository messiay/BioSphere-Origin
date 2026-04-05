import { useState, useEffect, useRef } from 'react';
import { UploadArea } from './components/UploadArea';
import { RiskScoreCard } from './components/RiskScoreCard';
import { MatchDetails } from './components/MatchDetails';
import { CountrySelector } from './components/CountrySelector';
import { ComplianceReportCard } from './components/ComplianceReportCard';
import { Documentation } from './components/Documentation';
import { BiopiracyGate } from './components/BiopiracyGate';
import { BioSidebar } from './components/BioSidebar';
import { GlobalAnalysisReport } from './components/GlobalAnalysisReport';
import { LandingPage } from './components/LandingPage';
import AnalysisWorker from './workers/analysis.worker.js?worker';
import { BlastService } from './services/blast';
import { PdfGenerator } from './services/pdfGenerator';
import { evaluateCompliance } from './services/compliance';
import { TaxonomyService } from './services/taxonomy';
import { isTKMatch } from './data/traditionalKnowledge';
import { XmlGenerator } from './services/xmlGenerator';
import { Phase1ResultsExtra } from './components/Phase1ResultsExtra';
import { SequenceVisualizer } from './components/SequenceVisualizer';
import { PatentLegalService } from './services/patentLegal';
import { isIndianTaxid, getIndianSpeciesName } from './data/indianBiota.js';

function App() {
    const [showTerminal, setShowTerminal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const resultRef = useRef(null);

    useEffect(() => {
        resultRef.current = result;
    }, [result]);

    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [selectedCountry] = useState('IN');
    const [complianceReport, setComplianceReport] = useState(null);
    const [showDocs, setShowDocs] = useState(false);
    const [biopiracyData, setBiopiracyData] = useState({ isIndian: false, hasForeignVC: null, status: 'NOT_CHECKED' });
    const [gatePassed, setGatePassed] = useState(true);
    const [isCertifiedNonIndian, setIsCertifiedNonIndian] = useState(false);

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

            // Step 2: Parallel Global BLAST (Patents + Nucleotides)
            setProgressMessage('Submitting to NCBI Global Databases (Patents & GenBank)...');
            setProgress(15);

            const patentJobPromise = runBlastJob(localResult.metadata.sequence, 'pat', 'Patents');
            const organismJobPromise = runBlastJob(localResult.metadata.sequence, 'nt', 'Organisms');
            const [patentHits, organismHits] = await Promise.all([patentJobPromise, organismJobPromise]);

            // Step 3: Regulatory Compliance
            const compliance = evaluateCompliance(organismHits, selectedCountry);

            let natureCheck = { isNatural: false, reason: 'No significant biological matches' };
            let tkStatus = false;
            let detectedIndianOrigin = false;
            let detectionSource = null;

            // SOVEREIGNTY DRAGNET: Layers 1 & 2
            setProgressMessage('Running Sovereignty Dragnet (Layers 1 & 2)...');
            const topHits = organismHits.slice(0, 10);
            for (const [index, hit] of topHits.entries()) {
                if (!tkStatus) tkStatus = isTKMatch(hit.title);

                if (!natureCheck.isNatural) {
                    const check = await TaxonomyService.checkNatureVsLab(hit.title);
                    if (check.isNatural) natureCheck = check;
                }

                // Layer 1: Local Digital Registry
                if (!detectedIndianOrigin && isIndianTaxid(hit.taxid)) {
                    detectedIndianOrigin = true;
                    detectionSource = `Layer 1: Local Registry Match (${getIndianSpeciesName(hit.taxid)})`;
                }

                // Layer 2: NCBI Metadata Probe (Top 3 only, Identity > 90%)
                if (!detectedIndianOrigin && index < 3 && (hit.identityPercentage || 0) > 90) {
                    const probe = await TaxonomyService.checkSovereignty(hit.id);
                    if (probe.isIndian) {
                        detectedIndianOrigin = true;
                        detectionSource = `Layer 2: NCBI GenBank Metadata (${probe.detail})`;
                    }
                    await new Promise(r => setTimeout(r, 400)); // throttle NCBI
                }
            }

            setBiopiracyData(prev => ({
                ...prev,
                isIndian: detectedIndianOrigin,
                status: detectedIndianOrigin ? 'RED_ALERT' : 'CLEARED',
                source: detectionSource
            }));

            // Step 4: Map hits for visualizer
            const mapHits = (hits) => hits.map(h => ({
                ...h,
                queryFrom: h.alignment?.q_start || 1,
                queryTo: h.alignment?.q_end || h.title.length
            }));

            const mappedOrganisms = mapHits(organismHits);
            const mappedPatents = mapHits(patentHits);

            // Step 4.5: Patent Legal Enrichment
            setProgressMessage('Enriching patent data with legal status & citations...');
            const enrichedPatents = await Promise.all(
                mappedPatents.slice(0, 5).map(async (p) => {
                    try {
                        const legal = await PatentLegalService.lookUp(p.id);
                        return { ...p, ...legal };
                    } catch {
                        return { ...p, status: 'ACTIVE', citations: 0 };
                    }
                })
            );

            const finalMappedPatents = [
                ...enrichedPatents,
                ...mappedPatents.slice(5)
            ].sort((a, b) => (b.score || 0) - (a.score || 0));

            // Step 5: Novelty Check
            const noveltyRegex = /(2020|2021|2022|2023|2024|2025)/;
            const noveltyHit = organismHits.find(hit => noveltyRegex.test(hit.title));
            const noveltyCheck = noveltyHit
                ? { isNovel: false, status: 'RED', reason: `Recent Publication Detected: ${noveltyHit.title.match(noveltyRegex)[0]} (Novelty Lost)` }
                : { isNovel: true, status: 'GREEN', reason: 'No recent academic publications (2020-2025) found.' };

            // Step 6: HYBRID SOVEREIGNTY PRIORITY HIERARCHY
            setProgressMessage('Calculating final risk score...');
            setProgress(85);

            const DANGER_KEYWORDS = ['anthra', 'ebola', 'variola', 'pestis', 'botulinum', 'francisella', 'marburg', 'lassa', 'y.pestis', 'b.anthracis'];
            const dangerousHit = organismHits?.find(hit => DANGER_KEYWORDS.some(kw => hit.title.toLowerCase().includes(kw)));

            let activePatentHit = false;
            let minorPatentHit = false;
            let patentSummary = '';

            if (patentHits && patentHits.length > 0) {
                const topPatent = patentHits[0];
                const isActive = topPatent.status === 'ACTIVE' || !topPatent.status;
                const isInfringementTrap = topPatent.identityPercentage > 95 || (topPatent.citations || 0) > 50;

                if (isActive && isInfringementTrap) {
                    activePatentHit = true;
                    patentSummary = `Significant match (>95%) to Active Patent ${topPatent.id}.`;
                } else if (isActive && topPatent.score > 100) {
                    minorPatentHit = true;
                    patentSummary = `Match to patent ${topPatent.id}. Proceed with caution.`;
                }
            }

            let finalRisk;
            if (dangerousHit) {
                finalRisk = createRisk('RED', 100, 'RESTRICTED_DO_NOT_USE', `Global Pathogen Match: ${dangerousHit.title.substring(0, 50)}...`);
            } else if (detectedIndianOrigin) {
                finalRisk = createRisk('RED', 95, 'NBA_BIOPIRACY_RESTRICTED', `High Risk: Indian Sovereign Biological Resource detected via ${detectionSource}. Section 6 rules apply.`);
            } else if (tkStatus) {
                finalRisk = createRisk('RED', 90, 'TK_REGISTRY_MATCH', `Warning: Sequence matches Traditional Knowledge medicinal registry.`);
            } else if (activePatentHit) {
                finalRisk = createRisk('RED', 85, 'PATENT_ENFORCED_HIGH_THREAT', patentSummary);
            } else if (noveltyCheck?.status === 'RED') {
                finalRisk = createRisk('RED', 80, 'NOVELTY_LOST', noveltyCheck.reason);
            } else if (natureCheck?.isNatural) {
                finalRisk = createRisk('YELLOW', 60, 'UNPATENTABLE_NATURE', 'Caution: Naturally occurring sequences are generally non-patentable under Section 3(c).');
            } else if (minorPatentHit) {
                finalRisk = createRisk('YELLOW', 40, 'ACTIVE_PATENT_CAUTION', patentSummary);
            } else {
                finalRisk = createRisk('GREEN', 10, 'SAFE_PUBLIC_DOMAIN', 'Sequence cleared for public domain use.');
            }

            // Step 7: SHA-256 Fingerprint
            const timestamp = new Date().toISOString();
            const fingerprintRaw = JSON.stringify({
                ts: timestamp,
                risk: finalRisk.overallScore,
                seqLen: localResult.metadata.length,
                jurisdiction: compliance.jurisdiction
            });
            const msgUint8 = new TextEncoder().encode(fingerprintRaw);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashResult = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Step 8: Compliance gauge
            const passedChecks = [
                !detectedIndianOrigin,
                true, // SCOMET placeholder
                !tkStatus,
                finalRisk.overallScore < 85
            ].filter(Boolean).length;

            setComplianceReport({ passedChecks, totalChecks: 4, checks: [] });

            const finalResult = {
                metadata: localResult.metadata,
                localMatches: localResult.matches,
                globalMatches: finalMappedPatents,
                organismMatches: mappedOrganisms,
                risk: finalRisk,
                compliance,
                natureCheck,
                noveltyCheck,
                tkStatus,
                biopiracyData: {
                    isIndian: detectedIndianOrigin,
                    hasForeignVC: biopiracyData.hasForeignVC,
                    source: detectionSource
                },
                timestamp,
                hash: hashResult
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

    const localAnalysisPromise = (sequence) => {
        return new Promise((resolve, reject) => {
            const currentWorker = workerRef.current;
            if (!currentWorker) return reject(new Error("Worker not initialized"));
            const handler = (e) => {
                if (e.data.type === 'COMPLETE') { currentWorker.removeEventListener('message', handler); resolve(e.data.payload); }
                if (e.data.type === 'ERROR') { currentWorker.removeEventListener('message', handler); reject(e.data.payload); }
            };
            currentWorker.addEventListener('message', handler);
            currentWorker.postMessage({ type: 'ANALYZE', sequence });
        });
    };

    const runBlastJob = async (sequence, db, label) => {
        console.log(`Starting ${label} Search...`);
        const rid = await BlastService.submitJob(sequence, db);
        try {
            let attempts = 0;
            while (await BlastService.checkStatus(rid) === false) {
                attempts++;
                const waitTime = attempts < 5 ? 3000 : 10000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                setProgress(prev => Math.min(prev + 1, 82));
                if (attempts > 120) throw new Error(`${label} Search Timed Out`);
            }
            const results = await BlastService.getResults(rid);
            BlastService.saveCache(sequence, db, results);
            return results;
        } catch (e) {
            console.error(`Error during ${label} BLAST job:`, e);
            throw e;
        }
    };

    const createRisk = (level, score, status, summary) => ({ riskLevel: level, overallScore: score, status, summary });

    const handleDownloadPdf = async () => {
        const currentResult = resultRef.current;
        if (!currentResult) return;
        await PdfGenerator.generateReport({ ...currentResult, isCertifiedNonIndian, biopiracyData });
    };

    const handleDownloadXml = () => {
        const currentResult = resultRef.current;
        if (!currentResult) return;
        XmlGenerator.downloadXml({ ...currentResult, isCertifiedNonIndian, biopiracyData });
    };

    const handleReset = () => {
        setResult(null);
        setProgress(0);
        setIsAnalyzing(false);
        setComplianceReport(null);
        setBiopiracyData({ isIndian: false, hasForeignVC: null, status: 'NOT_CHECKED' });
        setIsCertifiedNonIndian(false);
    };

    // Render Landing Page
    if (!showTerminal) {
        return <LandingPage onProceed={() => setShowTerminal(true)} />;
    }

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-800" style={{backgroundColor: 'var(--bg-canvas)'}}>
            <header className="sticky top-0 z-40 h-12 flex items-center justify-between px-6 bg-white border-b border-slate-200">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded text-white font-black text-sm font-mono tracking-tighter" style={{backgroundColor: 'var(--bio-indigo)'}}>BP</div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight leading-none text-slate-800">BioSphere</h1>
                        <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest mt-0.5 leading-none">Origin Alpha v2.2.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="flex items-center gap-2 px-2 py-1 rounded border text-[10px] font-bold font-mono uppercase tracking-wider bg-slate-50 border-slate-200 text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500"></div>
                        NCBI LIVE ENGINE
                    </div>

                    <div className="w-8 h-8 rounded text-white flex items-center justify-center text-xs font-black" style={{backgroundColor: 'var(--bio-indigo)'}}>
                        U
                    </div>
                </div>
            </header>

            {/* Body: Sidebar + Main Content */}
            <div className="flex flex-1">
                <BioSidebar />

                <div className="flex-1 flex flex-col overflow-x-hidden">
                    <main className="flex-1 max-w-7xl mx-auto w-full p-8">
                        {!result && !isAnalyzing && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in-up">
                                {/* Configuration Panel */}
                                <div className="md:col-span-4 space-y-6">
                                    <div className="bench-panel overflow-hidden h-fit">
                                        <div className="px-5 py-3 flex items-center gap-3 bg-slate-50 border-b border-slate-200">
                                            <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></div>
                                            <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">System Configuration</h2>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div>
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Compliance Jurisdiction</span>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="font-mono text-[10px] font-bold text-white px-2 py-0.5 rounded" style={{backgroundColor: 'var(--bio-indigo)'}}>IN/SCOMET/NBA</span>
                                                        <span className="text-sm font-semibold text-slate-700">Republic of India</span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-medium">
                                                    Biosecurity protocol locked to origin jurisdiction per NBA Section 6 guidelines.
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase font-bold">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                                    GATEWAY: ACTIVE
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Interaction Area */}
                                <div className="md:col-span-8">
                                    <UploadArea onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                                </div>
                            </div>
                        )}

                        {isAnalyzing && !result && (
                            <div className="mt-20 max-w-2xl mx-auto text-center animate-fade-in-up">
                                <div className="bench-panel p-10 max-w-lg mx-auto">
                                    <div className="flex justify-between items-end mb-6">
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-slate-800 font-mono tracking-tighter uppercase">Initializing Analysis</h3>
                                            <p className="text-[10px] text-indigo-600 font-mono font-bold mt-1">PROTOCOL: BIO-ALPHA-9</p>
                                        </div>
                                        <span className="text-4xl font-black font-mono tracking-tighter text-slate-800">{progress}<span className="text-lg opacity-30">%</span></span>
                                    </div>

                                    <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8 border border-slate-200">
                                        <div
                                            className="absolute top-0 left-0 h-full transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #4F46E5, #00C7B1)' }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-indigo-600" style={{borderTopColor: 'transparent'}}></div>
                                        <p className="text-xs font-mono text-slate-600 font-medium uppercase tracking-tight">{progressMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="py-4">
                                <GlobalAnalysisReport
                                    result={result}
                                    biopiracyData={biopiracyData}
                                    isCertifiedNonIndian={isCertifiedNonIndian}
                                    setIsCertifiedNonIndian={setIsCertifiedNonIndian}
                                    setBiopiracyData={setBiopiracyData}
                                    onDownloadPdf={handleDownloadPdf}
                                    onDownloadXml={handleDownloadXml}
                                    onReset={handleReset}
                                    complianceReport={complianceReport}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto px-8 py-6 text-center text-[10px] text-slate-500 flex flex-col items-center gap-3">
                    <div className="flex justify-center space-x-10 font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Security Protocol</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Compliance Nodes</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">API Endpoint</a>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                        <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-black" style={{backgroundColor: 'var(--bio-indigo)'}}>BP</div>
                        <p className="font-semibold uppercase tracking-tighter">© 2026 BioSphere Systems Inc. · Neural Genesis Cluster · Singapore/Chennai</p>
                    </div>
                </div>
            </footer>
            {showDocs && <Documentation onClose={() => setShowDocs(false)} />}
        </div>
    );
}



export default App;
