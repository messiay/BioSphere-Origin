/**
 * BLAST Service
 * Interacts with NCBI QBLAST API via local proxy.
 * Reference: https://ncbi.github.io/blast-cloud/dev/api.html
 */

const API_BASE = '/api/blast'; // Proxied to https://blast.ncbi.nlm.nih.gov/Blast.cgi

export const BlastService = {
    /**
     * Submits a sequence for BLAST analysis against a variable database.
     * @param {string} sequence - DNA sequence
     * @param {string} database - 'pat' (Patent) or 'nt' (Nucleotide)
     * @returns {Promise<string>} - Request ID (RID)
     */
    async submitJob(sequence, database = 'pat') {
        // 1. Check Cache First
        const cached = this.checkCache(sequence, database);
        if (cached) {
            console.log("⚡ Cache Hit for sequence");
            return `CACHE_${JSON.stringify(cached)}`; // Return special cache ID
        }

        const params = new URLSearchParams();
        params.append('CMD', 'Put');
        params.append('PROGRAM', 'blastn');
        params.append('DATABASE', database);
        params.append('QUERY', sequence);
        params.append('FORMAT_TYPE', 'JSON2_S'); // Request JSON format
        // Note: QBLAST often ignores JSON requests for Put, but we try.

        const response = await this.fetchWithRetry(API_BASE, {
            method: 'POST',
            body: params
        });

        const text = await response.text();

        // Parse RID from response (usually HTML/Text comment)
        // Match: "    RID = 6W508U25016"
        const ridMatch = text.match(/RID\s*=\s*(\w+)/);

        if (!ridMatch) {
            console.error("BLAST Submission Failed", text);
            throw new Error("Failed to submit to NCBI BLAST. Limit reached or IP blocked.");
        }

        return ridMatch[1];
    },

    /**
     * Polls for job completion.
     * @param {string} rid 
     * @returns {Promise<boolean>} true if ready
     */
    async checkStatus(rid) {
        if (rid.startsWith('CACHE_')) return true; // Cache is always ready

        const params = new URLSearchParams();
        params.append('CMD', 'Get');
        params.append('FORMAT_OBJECT', 'SearchInfo');
        params.append('RID', rid);

        const response = await this.fetchWithRetry(`${API_BASE}?${params.toString()}`);
        const text = await response.text();

        if (text.includes('Status=WAITING')) return false;
        if (text.includes('Status=FAILED')) throw new Error("BLAST Job Failed");
        if (text.includes('Status=UNKNOWN')) throw new Error("BLAST Job Expired or Unknown");
        if (text.includes('Status=READY')) return true;

        return false;
    },

    /**
     * Retrieves results for a completed job.
     * @param {string} rid 
     */
    async getResults(rid) {
        // 1. Return cached data if special ID
        if (rid.startsWith('CACHE_')) {
            const jsonStr = rid.replace('CACHE_', '');
            return JSON.parse(jsonStr);
        }

        const params = new URLSearchParams();
        params.append('CMD', 'Get');
        params.append('FORMAT_TYPE', 'JSON2_S');
        params.append('RID', rid);

        const response = await this.fetchWithRetry(`${API_BASE}?${params.toString()}`);
        const data = await response.json();

        // 2. Parse and then Save to Cache (we need original sequence to save properly, 
        // but for now let's just parse. Ideally we'd save in the caller or pass sequence here).
        // Actually, we can't save here easily without the sequence.
        // Let's refactor: The caller (App.jsx) should handle saving OR we assume 
        // submitJob saved a 'pending' state? 
        // Simpler: We'll add a separate 'saveToCache' method the App calls after getting results.

        return this.parseBlastJson(data);
    },

    // --- Caching Logic ---

    /**
     * simple string hash for cache key
     */
    hashSequence(seq) {
        let hash = 0;
        for (let i = 0; i < seq.length; i++) {
            const char = seq.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash | 0; // Convert to 32bit integer
        }
        return `blast_cache_${hash}`;
    },

    checkCache(sequence, database) {
        const key = this.hashSequence(sequence + database);
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
        return null;
    },

    saveCache(sequence, database, results) {
        try {
            const key = this.hashSequence(sequence + database);
            localStorage.setItem(key, JSON.stringify(results));
        } catch (e) {
            console.warn("Cache storage failed (quota?)", e);
        }
    },

    parseBlastJson(jsonData) {
        try {
            const hits = jsonData.BlastOutput2[0].report.results.search.hits;
            return hits.map(hit => {
                const hsp = hit.hsps[0];
                return {
                    id: hit.description[0].id, // e.g. "US 12345"
                    title: hit.description[0].title,
                    accession: hit.description[0].accession,
                    score: hsp.bit_score,
                    eValue: hsp.evalue,
                    // Identity is number of matching bases.
                    // Identity Percentage = identity / align_len (or query_len?)
                    // Let's use identity / align_len based on standard BLAST output
                    identityPercentage: (hsp.identity / hsp.align_len) * 100,
                    alignLength: hsp.align_len,
                    queryFrom: hsp.query_from,
                    queryTo: hsp.query_to,
                    hitFrom: hsp.hit_from,
                    hitTo: hsp.hit_to
                };
            });
        } catch (e) {
            console.warn("Error parsing BLAST JSON", e);
            return [];
        }
    },

    /**
     * Helper to retry fetch on failure (e.g. network glitch)
     */
    async fetchWithRetry(url, options = {}, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(url, options);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res;
            } catch (e) {
                console.warn(`Fetch attempt ${i + 1} failed: ${e.message}. Retrying...`);
                if (i === retries - 1) throw e;
                await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Backoff
            }
        }
    }
};
