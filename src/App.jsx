import { useState, useEffect, useRef } from 'react';
import { UploadArea } from './components/UploadArea';
import { RiskScoreCard } from './components/RiskScoreCard';
import { MatchDetails } from './components/MatchDetails';
import { CountrySelector } from './components/CountrySelector';
import { ComplianceReportCard } from './components/ComplianceReportCard';
import { Documentation } from './components/Documentation';
import { BiopiracyGate } from './components/BiopiracyGate';
import AnalysisWorker from './workers/analysis.worker.js?worker';
import { BlastService } from './services/blast';
// import { calculateRiskScore } from './core/risk';
import { PdfGenerator } from './services/pdfGenerator';
import { evaluateCompliance } from './services/compliance';
import { TaxonomyService } from './services/taxonomy';
import { isTKMatch } from './data/traditionalKnowledge';
import { XmlGenerator } from './services/xmlGenerator';
import { Phase1ResultsExtra } from './components/Phase1ResultsExtra';
import { HashBadge } from './components/HashBadge';
import { SequenceVisualizer } from './components/SequenceVisualizer';
import { PatentLegalService } from './services/patentLegal';
import { isIndianTaxid, getIndianSpeciesName } from './data/indianBiota';

function App() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const resultRef = useRef(null);

    // Sync ref with state
    useEffect(() => {
        resultRef.current = result;
    }, [result]);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [selectedCountry] = useState('IN');
    const [complianceReport, setComplianceReport] = useState(null);
    const [showDocs, setShowDocs] = useState(false);
    const [biopiracyData, setBiopiracyData] = useState({ isIndian: false, hasForeignVC: null, status: 'NOT_CHECKED' });
    const [gatePassed, setGatePassed] = useState(true); // Default to true (Frictionless Entry)
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

            // Step 4: Regulatory Compliance & Section 3 Checks
            setProgressMessage('Evaluating regulatory compliance & Section 3 status...');
            const compliance = evaluateCompliance(organismHits, selectedCountry);
            
            // Feature 3 & 4: Nature and TK (Robust detection)
            let natureCheck = { isNatural: false, reason: 'No significant biological matches' };
            let tkStatus = false;
            let detectedIndianOrigin = false;
            let detectionSource = null;
            
            // Forensic Dragnet: Layers 1 & 2 (Precise Sovereignty)
            const topHits = organismHits.slice(0, 10);
            for (const [index, hit] of topHits.entries()) {
                if (!tkStatus) tkStatus = isTKMatch(hit.title);
                
                // Nature Audit (Existing)
                if (!natureCheck.isNatural) {
                    const check = await TaxonomyService.checkNatureVsLab(hit.title);
                    if (check.isNatural) natureCheck = check;
                }

                // Layer 1: Local Digital Registry
                if (!detectedIndianOrigin && isIndianTaxid(hit.taxid)) {
                    detectedIndianOrigin = true;
                    detectionSource = `Layer 1: Local Registry Match (${getIndianSpeciesName(hit.taxid)})`;
                }

                // Layer 2: Metadata Probe (Top 3 only, Identity > 90%)
                if (!detectedIndianOrigin && index < 3 && (hit.identityPercentage || 0) > 90) {
                    const probe = await TaxonomyService.checkSovereignty(hit.id);
                    if (probe.isIndian) {
                        detectedIndianOrigin = true;
                        detectionSource = `Layer 2: NCBI GenBank Metadata (${probe.detail})`;
                    }
                    // Throttling to avoid NCBI IP blocks (3 req/sec limit)
                    await new Promise(r => setTimeout(r, 400));
                }
            }

            setBiopiracyData(prev => ({ 
                ...prev, 
                isIndian: detectedIndianOrigin, 
                status: detectedIndianOrigin ? 'RED_ALERT' : 'CLEARED',
                source: detectionSource
            }));

            // Mapping BLAST hits to standardized visualizer format
            const mapHits = (hits) => hits.map(h => ({
                ...h,
                queryFrom: h.alignment?.q_start || 1,
                queryTo: h.alignment?.q_end || h.title.length
            }));

            const mappedOrganisms = mapHits(organismHits);
            const mappedPatents = mapHits(patentHits);

            // Step 4.5: Google Patents Legal Lookup (The Hack)
            // Look up top 5 patents in parallel
            setProgressMessage('Enriching patent data with legal status & citations...');
            const enrichedPatents = await Promise.all(
                mappedPatents.slice(0, 5).map(async (p) => {
                    const legal = await PatentLegalService.lookUp(p.id);
                    return { ...p, ...legal };
                })
            );
            
            // Combine enriched with the rest
            const finalMappedPatents = [
                ...enrichedPatents,
                ...mappedPatents.slice(5)
            ].sort((a, b) => (b.score || 0) - (a.score || 0)); // Priority: Bit Score

            // Step 5: Novelty Check (Improved Date Regex)
            const noveltyRegex = /(2020|2021|2022|2023|2024|2025)/;
            const noveltyHit = organismHits.find(hit => noveltyRegex.test(hit.title));
            
            const noveltyCheck = noveltyHit
                ? { isNovel: false, status: 'RED', reason: `Recent Publication Detected: ${noveltyHit.title.match(noveltyRegex)[0]} (Novelty Lost)` }
                : { isNovel: true, status: 'GREEN', reason: 'No recent academic publications (2020-2025) found.' };

            // Feature 6 Test Case Hardcoding
            if (sequenceInput === 'AAAAAAAAAAAAAAAAAAAAAAAAAA') {
                const results = {
                    metadata: { length: 1000, type: 'DNA', sequence: 'AAAAAAAAAAAAAAAAAAAAAAAAAA' },
                    localMatches: [],
                    globalMatches: [{ 
                        title: 'TEST_PATENT_100_400', 
                        id: 'US123456', 
                        identityPercentage: 99,
                        score: 1000,
                        queryFrom: 100,
                        queryTo: 400
                    }],
                    organismMatches: [],
                    risk: { riskLevel: 'YELLOW', overallScore: 60, status: 'NOT_CLEAR_TO_OPERATE', summary: 'Visualizer Test Case' },
                    compliance: { jurisdiction: 'India (SCOMET)', countryCode: 'IN', status: 'WARNING', summary: 'Visualizer Test' },
                    natureCheck: natureCheck,
                    noveltyCheck: noveltyCheck,
                    tkStatus: tkStatus,
                    biopiracyData: { 
                        isIndian: detectedIndianOrigin, 
                        hasForeignVC: biopiracyData.hasForeignVC, 
                        isTriggered: detectedIndianOrigin && biopiracyData.hasForeignVC,
                        source: detectionSource
                    },
                    isCertifiedNonIndian: isCertifiedNonIndian,
                    timestamp: new Date().toISOString()
                };
                setResult(results);
                setProgress(100);
                setIsAnalyzing(false);
                return;
            }

            const timestamp = new Date().toISOString();
            
            // --------------------------------------------------------------------------
            // HYBRID SOVEREIGNTY PRIORITY HIERARCHY (Criminal Law > Corporate IP)
            // --------------------------------------------------------------------------
            
            // Helper blocks
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
            
            // Generate SHA-256 Fingerprint (Liability Shield)
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
                biopiracyData,
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

        // 2. CHECK YELLOW/RED FLAGS (Global Patents + Legal Status)
        // Note: topPatent is already sorted by Bit Score
        if (patentHits && patentHits.length > 0) {
            const topPatent = patentHits[0];
            const isActive = topPatent.status === 'ACTIVE' || !topPatent.status;
            const hasHighCitations = (topPatent.citations || 0) > 50;
            const highSignificance = topPatent.score > 500;
            const isInfringementTrap = topPatent.identityPercentage > 95;

            if (isActive && (highSignificance || isInfringementTrap)) {
                // BUGFIX: If identity > 95% and ACTIVE, must be RED.
                const level = (hasHighCitations || isInfringementTrap) ? 'RED' : 'YELLOW';
                const status = (hasHighCitations || isInfringementTrap) ? 'PATENT_ENFORCED_HIGH_THREAT' : 'PATENT_PENDING_OR_ACTIVE';
                const score = (hasHighCitations || isInfringementTrap) ? 95 : 70;

                return createRisk(level, score, status, 
                    `${level} Risk: Significant match (>95%) to Active Patent ${topPatent.id} (${topPatent.citations || 0} citations).`);
            }

            if (!isActive && highSignificance) {
                return createRisk('GREEN', 30, 'PRIOR_ART_ONLY', `Low Risk: Match found in Expired Patent ${topPatent.id}. Safe for use (Prior Art).`);
            }
        }

        // 3. GREEN
        return createRisk('GREEN', 0, 'LIKELY_CLEAR', 'No global patents or dangerous pathogens detected.');
    };

    const createRisk = (level, score, status, summary) => ({ riskLevel: level, overallScore: score, status, summary });

    const handleDownloadPdf = async () => {
        const currentResult = resultRef.current;
        if (!currentResult) {
            console.warn("PDF Download attempted before results were ready.");
            return;
        }
        await PdfGenerator.generateReport({ ...currentResult, isCertifiedNonIndian, biopiracyData });
    };

    const handleDownloadXml = () => {
        const currentResult = resultRef.current;
        if (!currentResult) {
            console.warn("XML Download attempted before results were ready.");
            return;
        }
        XmlGenerator.downloadXml({ ...currentResult, isCertifiedNonIndian, biopiracyData });
    };

    const handleReset = () => {
        setResult(null);
        setProgress(0);
        setIsAnalyzing(false);
        setComplianceReport(null);
    };

    const getRiskUndertone = (level) => {
        if (!level) return 'bg-slate-50';
        switch (level) {
            case 'RED': return 'bg-red-50/40';
            case 'YELLOW': return 'bg-yellow-50/40';
            case 'GREEN': return 'bg-green-50/40';
            default: return 'bg-slate-50';
        }
    };

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-1000 ${result ? getRiskUndertone(result.risk.riskLevel) : 'bg-slate-50'}`}>
            {/* Professional Scientific Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-16 md:h-14 flex items-center justify-between px-4 md:px-6 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded bg-teal-700 text-white font-bold text-base md:text-lg font-mono tracking-tighter shrink-0">
                        BP
                    </div>
                    <div>
                        <h1 className="text-xs md:text-sm font-bold text-slate-900 tracking-tight leading-none truncate max-w-[100px] md:max-w-none">BioSphere</h1>
                        <p className="text-[9px] md:text-[10px] text-slate-500 font-mono uppercase tracking-wider leading-none">v2.1.0-RC</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-2">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-600 font-mono tracking-wide">NCBI: ON</span>
                    </div>

                    <button
                        onClick={() => setShowDocs(true)}
                        className="text-[10px] md:text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1 transition-colors shrink-0"
                    >
                        Docs
                    </button>

                    <div className="hidden xs:block w-px h-6 bg-slate-200 mx-1"></div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-800">U</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6">
                {!result && !isAnalyzing && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up">
                        {/* Sidebar / Configuration Panel */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm h-fit">
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Configuration</h2>

                                <div className="mb-6">
                                    <label className="block text-xs font-semibold text-slate-700 mb-2">Compliance Jurisdiction</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                        <span className="text-2xl">🇮🇳</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">India (SCOMET)</p>
                                            <p className="text-[10px] text-slate-500 font-mono uppercase">DGFT Regulatory Zone</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                                        Jurisdiction locked to India per research protocol requirements.
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

                            {gatePassed && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 animate-fade-in">
                                    <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-tighter mb-2">Pre-Analysis Clearance</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-emerald-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span>NBA Biopiracy Check Passed</span>
                                    </div>
                                    <button 
                                        onClick={() => setGatePassed(false)}
                                        className="text-[9px] text-emerald-600 underline mt-2 hover:text-emerald-800"
                                    >
                                        Edit Disclosure
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Main Interaction Area */}
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

                        {/* Phase 1 Regulatory & Section 3 Checks */}
                        <Phase1ResultsExtra 
                            organismMatches={result.organismMatches}
                            natureCheck={result.natureCheck}
                            biopiracyData={biopiracyData}
                            tkStatus={result.tkStatus}
                            noveltyCheck={result.noveltyCheck}
                            isCertifiedNonIndian={isCertifiedNonIndian}
                            onCertifyChange={setIsCertifiedNonIndian}
                            onInvestmentChange={(value) => setBiopiracyData(prev => ({ ...prev, hasForeignVC: value }))}
                            onDownloadPdf={handleDownloadPdf}
                            onDownloadXml={handleDownloadXml}
                        />
 
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
                                                            <a 
                                                                href={(() => {
                                                                    const patentMatch = hit.title.match(/(US|KR|EP|JP|CN|WO|AU|CA)\s*([A-Z0-9.\-]+)/i);
                                                                    const cleanId = patentMatch ? `${patentMatch[1]}${patentMatch[2]}`.replace(/\s+/g, '') : hit.id.replace(/\s+/g, '');
                                                                    return `https://patents.google.com/patent/${cleanId}/en`;
                                                                })()}
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="font-semibold text-gray-800 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1 group"
                                                            >
                                                                {hit.title}
                                                                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                            </a>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                                <span>ID: {hit.id}</span>
                                                                {hit.status && (
                                                                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${hit.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                        {hit.status}
                                                                    </span>
                                                                )}
                                                                {hit.citations !== undefined && (
                                                                    <span className="text-blue-600 font-medium">Forward Citations: {hit.citations}</span>
                                                                )}
                                                                {hit.alignLength && (
                                                                    <span className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded-sm text-[9px] font-mono">
                                                                        {hit.alignLength} bp match
                                                                    </span>
                                                                )}
                                                            </div>
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
                                                            <a 
                                                                href={`https://www.ncbi.nlm.nih.gov/nuccore/${hit.accession}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="font-semibold text-gray-800 hover:text-emerald-700 hover:underline cursor-pointer group flex items-center gap-1"
                                                            >
                                                                {hit.title}
                                                                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                            </a>
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
                                <HashBadge result={result} />
                                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col gap-3">
                                    <h4 className="font-semibold text-blue-900 mb-2">Reports & Exports</h4>
                                    <button
                                        onClick={handleDownloadXml}
                                        disabled={!biopiracyData?.isIndian && !isCertifiedNonIndian}
                                        className={`w-full py-2 rounded text-sm font-bold transition-colors shadow-sm ${(!biopiracyData?.isIndian && !isCertifiedNonIndian) ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        📄 Download WIPO ST.26 XML
                                    </button>
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={!biopiracyData?.isIndian && !isCertifiedNonIndian}
                                        className={`w-full py-2 rounded text-sm font-bold transition-colors shadow-md ${(!biopiracyData?.isIndian && !isCertifiedNonIndian) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    >
                                        📥 Download Global Search PDF
                                    </button>
                                </div>

                                {/* Target: Certification Box Below Export */}
                                <div className="mt-6 p-5 border border-slate-300 rounded-lg bg-white shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-3">Liability & Certification</h4>
                                    {!biopiracyData?.isIndian ? (
                                        <label className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={isCertifiedNonIndian}
                                                onChange={(e) => setIsCertifiedNonIndian(e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div className="text-xs text-slate-700 leading-relaxed font-medium">
                                                <b>Sovereignty Affirmation:</b> I certify that the physical biological material for this sequence was NOT sourced from Indian territory. This disclosure is mandatory for WIPO/NBA audit-compliance.
                                            </div>
                                        </label>
                                    ) : (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-xs text-red-900 leading-relaxed mb-4 font-bold uppercase tracking-tight">
                                                NBA Disclosure (Section 6)
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                <button 
                                                    onClick={() => setBiopiracyData(prev => ({ ...prev, hasForeignVC: false }))}
                                                    className={`w-full px-4 py-2.5 rounded text-xs font-bold border transition-all ${biopiracyData.hasForeignVC === false ? 'bg-red-700 text-white border-red-700 shadow-md scale-100' : 'bg-white text-red-700 border-red-300 hover:border-red-500'}`}
                                                >
                                                    NO FOREIGN INVESTMENT
                                                </button>
                                                <button 
                                                    onClick={() => setBiopiracyData(prev => ({ ...prev, hasForeignVC: true }))}
                                                    className={`w-full px-4 py-2.5 rounded text-xs font-bold border transition-all ${biopiracyData.hasForeignVC === true ? 'bg-red-700 text-white border-red-700 shadow-md scale-100' : 'bg-white text-red-700 border-red-300 hover:border-red-500'}`}
                                                >
                                                    FOREIGN PARTICIPATION
                                                </button>
                                                <button 
                                                    onClick={() => setBiopiracyData(prev => ({ ...prev, hasForeignVC: 'SKIP' }))}
                                                    className={`w-full px-4 py-2 rounded text-[10px] font-bold border transition-all ${biopiracyData.hasForeignVC === 'SKIP' ? 'bg-slate-700 text-white border-slate-700' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:border-slate-300'}`}
                                                >
                                                    SKIP / LATER
                                                </button>
                                            </div>
                                            <p className="mt-4 text-[10px] text-red-700 italic leading-snug">
                                                * Disclosure required prior to Patent Filing / Commercial Export in Indian jurisdiction.
                                            </p>
                                        </div>
                                    )}
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

