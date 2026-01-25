import { parseSequence } from '../core/parser';
import { kmpSearch, levenshteinSimilarity, fragmentMatch } from '../core/algorithms';
import { calculateRiskScore } from '../core/risk';
import registryData from '../data/compliance_registry.json';

self.onmessage = async (e) => {
    const { sequence, type } = e.data;

    if (type === 'ANALYZE') {
        const debugLogs = [];
        const log = (msg) => {
            const entry = `[${new Date().toISOString()}] ${msg}`;
            debugLogs.push(entry);
            // Optional: immediately send log to UI if multiple messages needed real-time
        };

        try {
            log('Starting Analysis');

            // 1. Parse
            self.postMessage({ type: 'PROGRESS', value: 10, message: 'Parsing sequence...' });
            const parsed = parseSequence(sequence);
            log(`Parsed sequence: Length=${parsed.sequence.length}, Type=${parsed.type}`);

            if (!parsed.sequence) {
                throw new Error("Invalid sequence data");
            }

            // 2. Load Registry
            self.postMessage({ type: 'PROGRESS', value: 20, message: 'Loading compliance registry...' });
            const { patents, biosecurity } = registryData.registries;
            log(`Registry loaded: ${patents.length} patents, ${biosecurity.length} biosecurity entries`);

            const results = [];

            // 3. Analyze against Patents
            self.postMessage({ type: 'PROGRESS', value: 30, message: 'Scanning Patent Database...' });

            patents.forEach(entry => {
                // TIER 1: Exact Patent Match (User contains whole Patent)
                const kmpMatches = kmpSearch(parsed.sequence, entry.sequence);
                if (kmpMatches.length > 0) {
                    results.push({
                        entry,
                        type: 'EXACT_MATCH_FULL_PATENT',
                        score: 1.0,
                        indices: kmpMatches
                    });
                    log(`Match Found (Tier 1): ${entry.id}`);
                }

                // TIER 2: Fragment Match (Patent chunks inside User Sequence)
                // "Does the USER sequence contain a significant CHUNK of this patent?"
                // fragmentMatch returns chunks of 'pattern' found in 'text'.
                // text=parsed.sequence, pattern=entry.sequence
                const fragments = fragmentMatch(parsed.sequence, entry.sequence, 20);
                if (fragments.length > 0) {
                    results.push({
                        entry,
                        type: 'FRAGMENT_MATCH',
                        score: Math.min(1.0, (fragments.length * 20) / entry.sequence.length),
                        fragments: fragments
                    });
                    log(`Match Found (Tier 2): ${entry.id} - ${fragments.length} fragments found`);
                }

                // TIER 3: Reverse Exact (User is inside Patent)
                if (entry.sequence.includes(parsed.sequence) && parsed.sequence.length > 15) {
                    results.push({
                        entry,
                        type: 'SUBSEQUENCE_MATCH_REVERSE',
                        score: parsed.sequence.length / entry.sequence.length,
                        note: "User input appears to be a fragment of this patent"
                    });
                    log(`Match Found (Tier 3): ${entry.id} - User sequence is a subset of this patent`);
                }
            });

            // 4. Analyze against Biosecurity
            self.postMessage({ type: 'PROGRESS', value: 60, message: 'Checking Biosecurity Lists...' });

            biosecurity.forEach(entry => {
                const bioMatches = kmpSearch(parsed.sequence, entry.sequence);
                const bioFragments = fragmentMatch(parsed.sequence, entry.sequence, 15);

                if (bioMatches.length > 0 || bioFragments.length > 0) {
                    results.push({
                        entry,
                        type: 'BIOSECURITY_MATCH',
                        score: 1.0
                    });
                    log(`Biosecurity Match: ${entry.id}`);
                }
            });

            // 5. Calculate Risk
            self.postMessage({ type: 'PROGRESS', value: 90, message: 'Calculating Risk Score...' });
            const riskAssessment = calculateRiskScore(results);
            log(`Risk Calculation: Score=${riskAssessment.overallScore}, Level=${riskAssessment.riskLevel}`);

            self.postMessage({
                type: 'COMPLETE',
                payload: {
                    matches: results,
                    risk: riskAssessment,
                    metadata: parsed,
                    debugLogs // Send logs to UI
                }
            });

        } catch (error) {
            log(`Error: ${error.message}`);
            self.postMessage({ type: 'ERROR', message: error.message, debugLogs });
        }
    }
};
