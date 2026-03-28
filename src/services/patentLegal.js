/**
 * PatentLegal Service
 * Fetches legal metadata (Status, Citations) from Google Patents.
 * Uses a public CORS proxy for client-side integration.
 */

const BASE_URL = '/api/google-patents/';

export const PatentLegalService = {
    /**
     * Normalizes a Patent ID for Google Patents.
     * Example: "US 1234567" -> "US1234567"
     * Example: "US 10100318" -> "US10100318"
     * Example: "WO2020193698" -> "WO2020193698"
     */
    normalizeId(rawId) {
        if (!rawId) return '';
        // Remove spaces, dots, and hyphens
        let clean = rawId.replace(/[\s\.\-]/g, '');
        // Extract the core ID if it contains a title
        const match = clean.match(/(US|WO|EP|JP|KR|CN|AU|CA)\d+[A-Z\d]*/i);
        return match ? match[0].toUpperCase() : clean.toUpperCase();
    },

    /**
     * Look up patent status and citations.
     */
    async lookUp(patentId) {
        const normalized = this.normalizeId(patentId);
        if (!normalized) return { id: patentId, status: 'UNKNOWN', citations: 0 };

        try {
            const targetUrl = `${BASE_URL}${normalized}/en`;
            
            const response = await fetch(targetUrl);
            if (!response.ok) throw new Error("Proxy failed");
            
            const html = await response.text();

            // Simple Regex-based scraping
            
            // 1. Extract Status
            // Look for: class="legal-status" ... <span class="title-text">Active</span>
            const statusMatch = html.match(/class="legal-status"[\s\S]*?class="title-text">([^<]+)</i);
            const status = statusMatch ? statusMatch[1].trim() : 'Active'; // Default to Active if found but not parsed

            // 2. Extract Citations
            // Look for: Cited by (16)
            const citationMatch = html.match(/Cited by\s*\((\d+)\)/i);
            const citations = citationMatch ? parseInt(citationMatch[1], 10) : 0;

            console.log(`[Google Patents] ${normalized} -> Status: ${status}, Citations: ${citations}`);

            return {
                id: normalized,
                status: status.toUpperCase(),
                citations: citations,
                url: targetUrl
            };
        } catch (e) {
            console.error(`Legal lookup failed for ${patentId}:`, e);
            return {
                id: patentId,
                status: 'ACTIVE', // Fallback to safe assumption
                citations: 0,
                error: true
            };
        }
    }
};
