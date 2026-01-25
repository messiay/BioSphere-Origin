import { describe, test, expect } from 'vitest';
import { kmpSearch, levenshteinSimilarity, fragmentMatch } from '../src/core/algorithms';
import { calculateRiskScore } from '../src/core/risk';

describe('KMP Search', () => {
    test('exact match in sequence', () => {
        const result = kmpSearch('ATGCGATCGATC', 'GATC');
        expect(result).toEqual([4, 8]); // 0-indexed: A(0)T(1)G(2)C(3)G(4)... wait
        // Text: A T G C G A T C G A T C
        // Idx:  0 1 2 3 4 5 6 7 8 9 10 11
        // Matches: GATC at 4..7, GATC at 8..11?
        // Let's trace:
        // ATGC G ATC ...
        // 0123 4 567
        // Yes, 4.
        // And GATC at 8.
    });

    test('no match returns empty', () => {
        const result = kmpSearch('ATGC', 'ZZCC');
        expect(result).toEqual([]);
    });
});

describe('Levenshtein Similarity', () => {
    test('identical sequences score 1.0', () => {
        const score = levenshteinSimilarity('ATGC', 'ATGC');
        expect(score).toBe(1.0);
    });

    test('single point mutation scores ~0.75', () => {
        // ATGC vs ATCC (1 sub)
        // Len 4. Dist 1. Score = 1 - 1/4 = 0.75
        const score = levenshteinSimilarity('ATGC', 'ATCC');
        expect(score).toBe(0.75);
    });
});

describe('Fragment Match', () => {
    test('finds fragments >= minSize', () => {
        const text = 'ATGATGCGAT';
        const pattern = 'ATGCGAT';
        // fragment size 3
        // Pattern chunks: ATG, TGC, GCG, CGA, GAT ...
        // Text contains ATG (0), TGC(2?), etc.
        // With minFragmentSize=5?

        // My implementation slices pattern into chunks.
        // Let's test with minSize = 3
        const result = fragmentMatch(text, pattern, 3);
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('Risk Calculation', () => {
    test('Calculates high risk for restricted items', () => {
        const matches = [{
            type: 'BIOSECURITY_MATCH',
            entry: { riskLevel: 'RESTRICTED' },
            score: 1.0
        }];
        const valid = calculateRiskScore(matches);
        expect(valid.riskLevel).toBe('RED');
    });

    test('Calculates moderate risk for patent items', () => {
        const matches = [{
            type: 'EXACT_MATCH',
            entry: { riskLevel: 'PATENT' },
            score: 1.0
        }];
        const valid = calculateRiskScore(matches);
        expect(valid.riskLevel).toBe('YELLOW'); // 0.5 * 1.0 = 0.5 -> Yellow is >= 0.5
    });
});
