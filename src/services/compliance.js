/**
 * Compliance Service
 * Cross-references BLAST organism matches against country-specific biosecurity regulations
 */

import { REGULATIONS, STATUS_LABELS, SEVERITY_LEVELS } from '../data/regulations.js';

/**
 * Evaluates a DNA sequence's compliance status for a given jurisdiction
 * @param {Array} organismMatches - BLAST results from the 'nt' database
 * @param {string} countryCode - e.g., 'US', 'EU', 'UK', 'IN', 'CN', 'AU', 'GLOBAL'
 * @returns {Object} ComplianceReport
 */
export function evaluateCompliance(organismMatches, countryCode = 'GLOBAL') {
    const jurisdiction = REGULATIONS[countryCode] || REGULATIONS.GLOBAL;
    const violations = [];

    if (!organismMatches || organismMatches.length === 0) {
        return {
            jurisdiction: jurisdiction.name,
            countryCode,
            flagIcon: jurisdiction.flagIcon,
            authority: jurisdiction.authority,
            status: 'CLEAR',
            severity: 'LOW',
            overallRisk: 0,
            violations: [],
            summary: 'No regulated biological agents detected.',
            timestamp: new Date().toISOString()
        };
    }

    // Check each BLAST hit against the jurisdiction's rules
    for (const hit of organismMatches) {
        const titleLower = hit.title.toLowerCase();

        for (const rule of jurisdiction.rules) {
            const matchedKeyword = rule.keywords.find(kw => titleLower.includes(kw));

            if (matchedKeyword) {
                violations.push({
                    organism: hit.title,
                    accession: hit.accession,
                    identityPercentage: hit.identityPercentage,
                    matchedKeyword,
                    status: rule.status,
                    severity: rule.severity,
                    description: rule.description,
                    citation: rule.citation,
                    guidance: rule.guidance,
                    link: rule.link
                });
            }
        }
    }

    // Determine overall status
    let overallStatus = 'CLEAR';
    let overallSeverity = 'LOW';
    let overallRisk = 0;

    if (violations.length > 0) {
        // Pick the most severe violation
        const sortedViolations = violations.sort((a, b) => {
            return SEVERITY_LEVELS[a.severity].priority - SEVERITY_LEVELS[b.severity].priority;
        });

        const topViolation = sortedViolations[0];
        overallStatus = topViolation.status;
        overallSeverity = topViolation.severity;

        // Calculate risk score (0-100)
        switch (overallSeverity) {
            case 'CRITICAL':
                overallRisk = 100;
                break;
            case 'HIGH':
                overallRisk = 75;
                break;
            case 'MEDIUM':
                overallRisk = 50;
                break;
            default:
                overallRisk = 25;
        }
    }

    const summary = violations.length > 0
        ? `${violations.length} regulated agent${violations.length > 1 ? 's' : ''} detected. ${STATUS_LABELS[overallStatus] || overallStatus}`
        : 'No regulated biological agents detected.';

    return {
        jurisdiction: jurisdiction.name,
        countryCode,
        flagIcon: jurisdiction.flagIcon,
        authority: jurisdiction.authority,
        status: overallStatus,
        severity: overallSeverity,
        overallRisk,
        violations,
        summary,
        timestamp: new Date().toISOString()
    };
}

/**
 * Get list of available jurisdictions
 */
export function getAvailableJurisdictions() {
    return Object.keys(REGULATIONS).map(code => ({
        code,
        name: REGULATIONS[code].name,
        flagIcon: REGULATIONS[code].flagIcon,
        authority: REGULATIONS[code].authority
    }));
}

/**
 * Multi-jurisdiction analysis
 * Evaluates compliance across all supported regions
 * @param {Array} organismMatches
 * @returns {Array} Array of compliance reports for each jurisdiction
 */
export function evaluateMultiJurisdiction(organismMatches) {
    return Object.keys(REGULATIONS).map(countryCode => {
        return evaluateCompliance(organismMatches, countryCode);
    }).filter(report => report.violations.length > 0); // Only return jurisdictions with violations
}
