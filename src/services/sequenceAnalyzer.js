import { isIndianTaxid } from '../data/indianBiota.js';
import { isTKMatch } from '../data/traditionalKnowledge.js';
import { TaxonomyService } from './taxonomy.js';

/**
 * 🧬 SequenceAnalyzer (Core Engine v3.0)
 * A strict, linear functional pipeline for biosecurity and sovereignty compliance.
 */

/**
 * Layer 1: Validation & Sanitization
 * Strips FASTA headers, whitespace, and non-DNA characters.
 * Enforces a strict 200BP minimum length.
 */
export const sanitizeAndValidate = (rawFasta) => {
    // 1. Strip FASTA headers (lines starting with >)
    const lines = rawFasta.split('\n');
    const sequenceLines = lines.filter(line => !line.startsWith('>'));
    
    // 2. Clear all whitespace, numbers, and non-ATCG/U characters
    const cleanSequence = sequenceLines.join('').replace(/[^actguACTGU]/g, '').toUpperCase();
    
    // 3. Minimum Length Enforcement
    if (cleanSequence.length < 200) {
        throw { 
            status: 'REJECTED', 
            reason: 'SEQUENCE_TOO_SHORT_MIN_200_BP',
            details: `Detected length: ${cleanSequence.length} bp. Minimum required: 200 bp.`
        };
    }
    
    return cleanSequence;
};

/**
 * Layer 2: External Data Fetch (Mocked)
 * Simulates a BLAST response with high-identity matches.
 */
export const fetchSequenceData = async (sequence) => {
    // Mocking an async NCBI BLAST API call
    return new Promise((resolve) => {
        setTimeout(() => {
            const isSynthetic = sequence.includes('SYNTHETIC') || sequence.includes('PUC19');
            
            // Standard Mock Data
            const mockHits = [
                { title: 'Drosophila melanogaster (Fruit Fly)', id: 'NM_001', taxid: '7227', identity: 100, score: 9500 },
                { title: isSynthetic ? 'Synthetic Vector pUC19' : 'Azadirachta indica (Neem)', id: isSynthetic ? 'L09137' : 'MK_435', taxid: isSynthetic ? '0' : '124943', identity: 100, score: 9500 },
                { title: 'Homo sapiens (Human)', id: 'NC_000', taxid: '9606', identity: 99.8, score: 9200 },
                { title: 'Arabidopsis thaliana', id: 'AT_1G0', taxid: '3702', identity: 98.5, score: 8800 },
            ];

            // In-memory expansion to 50 hits (simulated)
            for (let i = 5; i <= 50; i++) {
                const isRestricted = !isSynthetic && (Math.random() > 0.9); // Reduce chance to 10%
                mockHits.push({
                    title: `Simulated Sequence Match #${i}`,
                    id: `SIM_${i}`,
                    taxid: isRestricted ? '124943' : '7227',
                    identity: 96 + (Math.random() * 3),
                    score: 7000 + (Math.random() * 2000)
                });
            }

            resolve(mockHits);
        }, 800); // Simulated network latency
    });
};

/**
 * Layer 3: The Audit Layer (Enhanced 3-Layer System)
 * Performs compliance and liability checks.
 */
export const runComplianceAudits = async (sequence, organismHits) => {
    // 1. Layer 1 Check: Local Sovereignty Registry (NBA Section 6)
    const restrictedHits = organismHits.filter(h => isIndianTaxid(h.taxid));
    let hasNBAMatch = restrictedHits.length > 0;
    let sovereigntySource = hasNBAMatch ? 'Layer 1: Local Biota Registry' : null;

    // 2. Layer 2 Check: Metadata Probe (Conditional)
    // Only fire if Layer 1 found nothing, to save API calls.
    if (!hasNBAMatch && organismHits.length > 0) {
        // Probe top 3 hits for geographic metadata
        const top3 = organismHits.slice(0, 3);
        for (const hit of top3) {
            const probe = await TaxonomyService.checkSovereignty(hit.id);
            if (probe.isIndian) {
                hasNBAMatch = true;
                sovereigntySource = `Layer 2: Metadata Probe (${probe.source})`;
                break;
            }
        }
    }
    
    // 3. Ambiguity Check (Conserved Sequence Conflict)
    const topIdentity = Math.max(...organismHits.map(h => h.identity));
    const ties = organismHits.filter(h => h.identity === topIdentity);
    const restrictedTies = ties.filter(h => isIndianTaxid(h.taxid));
    const unrestrictedTies = ties.filter(h => !isIndianTaxid(h.taxid));
    const isAmbiguousConservedGene = restrictedTies.length > 0 && unrestrictedTies.length > 0;

    // 4. TK Check (Traditional Knowledge)
    const hasTKMatchResult = organismHits.some(h => isTKMatch(h.title));

    // 5. Mocked Patent Registry Check
    const hasActivePatent = organismHits.some(h => h.identity > 98 && h.id.startsWith('US'));

    // 6. Nature/Novelty Audit
    const isNaturallyOccurring = true;
    const isPriorArt = organismHits.some(h => h.identity > 99);

    return {
        hasNBAMatch,
        sovereigntySource,
        isAmbiguousConservedGene,
        hasTKMatch: hasTKMatchResult,
        hasActivePatent,
        isPriorArt,
        isNaturallyOccurring,
        topMatches: ties.slice(0, 5)
    };
};

/**
 * Layer 4: The Judgment Layer
 * Priority-driven descending ladder for risk assessment.
 */
export const calculateMasterRisk = (auditResults) => {
    // Priority 1: Pathogens (Biosecurity) - Mock check
    const isPathogen = false; // Mock for this rebuild

    if (isPathogen) return { score: 100, status: 'RESTRICTED_DO_NOT_USE', message: 'CRITICAL: Sequence matches Restricted Global Pathogen List.' };
    
    // Priority 2: Indian Sovereignty (NBA Biopiracy)
    if (auditResults.hasNBAMatch && !auditResults.isAmbiguousConservedGene) {
        return { 
            score: 95, 
            status: 'NBA_BIOPIRACY_RESTRICTED', 
            message: 'High Risk: Exclusive match to Indian Sovereign Biological Resources detected. Section 6 rules apply.' 
        };
    }

    // Priority 3: Traditional Knowledge (TKDL)
    if (auditResults.hasTKMatch) {
        return { 
            score: 90, 
            status: 'TK_REGISTRY_MATCH', 
            message: 'Significant Risk: Sequence matches Traditional Knowledge medicinal registry.' 
        };
    }

    // Priority 4: Corporate Intellectual Property (Patents)
    if (auditResults.hasActivePatent) {
        return { 
            score: 85, 
            status: 'PATENT_ENFORCED_HIGH_THREAT', 
            message: 'Legal Warning: Significant match (>98%) to Active Patents detected.' 
        };
    }

    // Priority 5: Novelty Loss (Prior Art)
    if (auditResults.isPriorArt) {
        return { 
            score: 80, 
            status: 'NOVELTY_LOST', 
            message: 'Novelty Alert: This sequence is already in the public domain (Prior Art). Patenting is not advised.' 
        };
    }

    // Priority 6: Ambiguous Taxonomy (Conserved Gene Conflict)
    if (auditResults.isAmbiguousConservedGene) {
        return { 
            score: 75, 
            status: 'AMBIGUOUS_TAXONOMY_CAUTION', 
            message: 'CAUTION: Conserved sequence. Perfectly matches both Restricted and Unrestricted Taxa. Liability depends on physical sourcing audit.' 
        };
    }

    // Priority 7: Natural Products (Non-Patentable Nature)
    if (auditResults.isNaturallyOccurring) {
        return { 
            score: 60, 
            status: 'UNPATENTABLE_NATURE', 
            message: 'Research Note: Naturally occurring sequences are generally non-patentable under Section 3(c).' 
        };
    }

    // Priority 8: Default cleared state
    return { 
        score: 10, 
        status: 'SAFE_PUBLIC_DOMAIN', 
        message: 'Sequence cleared for public domain use.' 
    };
};

/**
 * Layer 5: Orchestration (Master Function)
 * Chained execution of the pipeline stages.
 */
export const analyzeSequence = async (rawFasta, options = {}) => {
    try {
        // 1. Validation
        const cleanSequence = sanitizeAndValidate(rawFasta);
        
        // 2. Fetch Data
        const topMatches = await fetchSequenceData(cleanSequence);
        
        // 3. Audit (AWAIT ENHANCED AUDIT)
        const audits = await runComplianceAudits(cleanSequence, topMatches);
        
        // 4. Judgment
        const masterRisk = calculateMasterRisk(audits);
        
        // 5. Formulation
        return {
            masterRisk,
            metadata: {
                sequenceLength: cleanSequence.length,
                cleanSequence: options.includeSequence ? cleanSequence : 'HIDDEN_FOR_PRIVACY'
            },
            auditDetails: {
                topMatches: topMatches.slice(0, 5),
                audits: audits
            },
            status: 'SUCCESS',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('Analysis Pipeline Error:', error);
        return {
            status: 'ERROR',
            error: error.status || 'PIPELINE_FAILURE',
            reason: error.reason || 'An unknown error occurred during analysis.',
            details: error.details,
            timestamp: new Date().toISOString()
        };
    }
};
