// api/blast.js

/**
 * Vercel Serverless Function to Proxy NCBI BLAST Requests
 * This replaces the vite.config.js proxy in production.
 */

export default async function handler(req, res) {
    const NCBI_URL = 'https://blast.ncbi.nlm.nih.gov/Blast.cgi';

    // Set CORS headers to allow calls from your frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        let fetchOptions = {
            method: req.method,
            headers: {
                // Forward content type (likely application/x-www-form-urlencoded)
                'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
                'User-Agent': 'BioProvenance/2.0 (compatible; BiosecurityApp)' // Critical for NCBI
            }
        };

        // Handle POST Body
        if (req.method === 'POST') {
            // req.body in Vercel is already parsed if content-type is form/json
            // We need to construct the URLSearchParams string to send to NCBI
            if (typeof req.body === 'object') {
                const params = new URLSearchParams();
                for (const [key, value] of Object.entries(req.body)) {
                    params.append(key, value);
                }
                fetchOptions.body = params;
            } else {
                fetchOptions.body = req.body;
            }
        }

        // Construct URL with query params if GET
        let targetUrl = NCBI_URL;
        if (req.method === 'GET') {
            const queryParams = new URLSearchParams(req.query).toString();
            if (queryParams) {
                targetUrl += `?${queryParams}`;
            }
        }

        // Perform the fetch to NCBI
        const response = await fetch(targetUrl, fetchOptions);

        // Get text/json from NCBI
        const data = await response.text();

        // Forward status and body
        res.status(response.status).send(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Failed to proxy request to NCBI', details: error.message });
    }
}
