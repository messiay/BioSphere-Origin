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
        const params = new URLSearchParams();
        params.append('CMD', 'Put');
        params.append('PROGRAM', 'blastn');
        params.append('DATABASE', database);
        params.append('QUERY', sequence);
        params.append('FORMAT_TYPE', 'JSON2_S'); // Request JSON format
        // Note: QBLAST often ignores JSON requests for Put, but we try.

        const response = await fetch(API_BASE, {
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
        const params = new URLSearchParams();
        params.append('CMD', 'Get');
        params.append('FORMAT_OBJECT', 'SearchInfo');
        params.append('RID', rid);

        const response = await fetch(`${API_BASE}?${params.toString()}`);
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
        const params = new URLSearchParams();
        params.append('CMD', 'Get');
        params.append('FORMAT_TYPE', 'JSON2_S');
        params.append('RID', rid);

        const response = await fetch(`${API_BASE}?${params.toString()}`);
        const data = await response.json();

        return this.parseBlastJson(data);
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
                    alignLength: hsp.align_len
                };
            });
        } catch (e) {
            console.warn("Error parsing BLAST JSON", e);
            return [];
        }
    }
};
