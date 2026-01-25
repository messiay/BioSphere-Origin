/**
 * Knuth-Morris-Pratt (KMP) Search Algorithm
 * Finds all occurrences of a pattern in a text.
 * @param {string} text 
 * @param {string} pattern 
 * @returns {number[]} Array of start indices (0-based)
 */
export function kmpSearch(text, pattern) {
    if (!pattern || !text || pattern.length > text.length) return [];

    const n = text.length;
    const m = pattern.length;
    const lps = computeLPS(pattern);
    const matches = [];

    let i = 0; // index for text
    let j = 0; // index for pattern

    while (i < n) {
        if (pattern[j] === text[i]) {
            j++;
            i++;
        }

        if (j === m) {
            matches.push(i - j);
            j = lps[j - 1];
        } else if (i < n && pattern[j] !== text[i]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }

    return matches;
}

function computeLPS(pattern) {
    const m = pattern.length;
    const lps = new Array(m).fill(0);
    let length = 0;
    let i = 1;

    while (i < m) {
        if (pattern[i] === pattern[length]) {
            length++;
            lps[i] = length;
            i++;
        } else {
            if (length !== 0) {
                length = lps[length - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}

/**
 * Levenshtein Distance Algorithm
 * formatting similarity as 1 - (dist / maxLen)
 * @param {string} s1 
 * @param {string} s2 
 * @returns {number} Similarity score (0.0 to 1.0)
 */
export function levenshteinSimilarity(s1, s2) {
    const m = s1.length;
    const n = s2.length;

    if (m === 0) return n === 0 ? 1.0 : 0.0;
    if (n === 0) return 0.0;

    // Create matrix
    const dp = Array(n + 1).fill(0);

    // Initialize first row
    for (let i = 0; i <= n; i++) {
        dp[i] = i;
    }

    for (let i = 1; i <= m; i++) {
        let prev = dp[0]; // effectively dp[i-1][0]
        dp[0] = i;        // update dp[i][0]

        for (let j = 1; j <= n; j++) {
            const temp = dp[j];

            if (s1[i - 1] === s2[j - 1]) {
                dp[j] = prev;
            } else {
                dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
            }
            prev = temp;
        }
    }

    const distance = dp[n]; // Result in bottom-right
    const maxLength = Math.max(m, n);
    return 1.0 - (distance / maxLength);
}

/**
 * Sliding Window Fragment Matcher
 * Checks for exact substring matches of a minimum size.
 * @param {string} text - User sequence
 * @param {string} pattern - Registry sequence
 * @param {number} minFragmentSize 
 * @returns {Array} List of fragment matches
 */
export function fragmentMatch(text, pattern, minFragmentSize = 20) {
    // Optimization: Only check specific fragment sizes or a sliding window?
    // Spec says: sliding window of varying lengths.
    // For MVP efficiency: We'll slice the PATTERN into chunks and look for them in TEXT.
    // Or slice TEXT into chunks and look in PATTERN (depending on which is the 'query').

    // Usually, we want to see if the USER SEQUENCE (text) contains parts of a PATENT (pattern).
    // But strictly, KMP finds pattern in text.

    // Strategy: Break Patent (Pattern) into chunks of minFragmentSize (e.g. 20bp) 
    // and search for those chunks in User Sequence (Text).

    // CAUTION: This can be very slow if blindly done. 
    // Smart approach: Use a sliding window on the shorter sequence against the longer one?
    // Let's implement basic chunk checking as per spec "Tier 2".

    if (pattern.length < minFragmentSize) return [];

    const matches = [];
    // Step size = minFragmentSize / 2 for overlap
    const step = Math.floor(minFragmentSize / 2);

    for (let i = 0; i <= pattern.length - minFragmentSize; i += step) { // Overlapping chunks
        const chunk = pattern.substring(i, i + minFragmentSize);

        // Exact match using KMP first
        const foundIndices = kmpSearch(text, chunk);

        if (foundIndices.length > 0) {
            matches.push({
                type: 'FRAGMENT_EXACT',
                fragment: chunk,
                patternStart: i,
                textIndices: foundIndices,
                length: minFragmentSize
            });
        }
    }

    return matches;
}
