/**
 * Taxonomy Service
 * Interfaces with NCBI Taxonomy to determine organism lineage.
 */

export const TaxonomyService = {
    /**
     * Checks if an organism is a naturally occurring plant/animal/fungus (Section 3c/3j)
     * @param {string} organismName 
     */
    async checkNatureVsLab(organismName) {
        if (!organismName) return { isNatural: false, reason: 'Unknown' };

        try {
            // Heuristic detection based on keyword matching
            const nameLower = organismName.toLowerCase();
            const heuristicIsPlant = nameLower.includes('indica') || nameLower.includes('mangifera') || nameLower.includes('azadirachta') || nameLower.includes('oryza') || nameLower.includes('triticum') || nameLower.includes('zea mays');
            const heuristicIsAnimal = nameLower.includes('homo sapiens') || nameLower.includes('mus musculus') || nameLower.includes('rattus') || nameLower.includes('grandis') || nameLower.includes('drosophila') || nameLower.includes('danio');
            const heuristicIsPathogen = nameLower.includes('anthra') || nameLower.includes('variola') || nameLower.includes('pestis') || nameLower.includes('ebola');

            // Step 1: Search for Taxon ID
            const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=${encodeURIComponent(organismName)}&retmode=json`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();
            
            const taxId = searchData.esearchresult?.idlist?.[0];
            if (!taxId) {
                // Return heuristic result if NCBI fails
                if (heuristicIsPlant || heuristicIsAnimal) {
                    return {
                        isNatural: true,
                        type: heuristicIsPlant ? 'Plant' : 'Animal',
                        reason: `Naturally occurring ${heuristicIsPlant ? 'plant' : 'animal'} (Heuristic detection).`
                    };
                }
                return { isNatural: false, reason: 'Taxon not found' };
            }

            // Step 2: Fetch Lineage
            const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=${taxId}&retmode=xml`;
            const fetchRes = await fetch(fetchUrl);
            const xmlText = await fetchRes.text();

            // Simple XML parsing for lineage keywords
            const xmlLower = xmlText.toLowerCase();
            const isPlant = xmlLower.includes('viridiplantae') || xmlLower.includes('plantae') || xmlLower.includes('embryophyta');
            const isAnimal = xmlLower.includes('metazoa');
            const isFungi = xmlLower.includes('fungi');
            const isMammal = xmlText.toLowerCase().includes('mammalia');

            if (isPlant || isAnimal || isFungi) {
                return {
                    isNatural: true,
                    type: isPlant ? 'Plant' : isAnimal ? 'Animal' : 'Fungi',
                    reason: `Naturally occurring ${isPlant ? 'plant' : isAnimal ? 'animal' : 'fungus'} (Section 3c/3j concern).`,
                    details: isMammal ? 'Mammalian origin detected.' : ''
                };
            }

            return { isNatural: false, reason: 'Micro-organism or Synthetic origin likely.' };

        } catch (err) {
            console.error("Taxonomy check failed:", err);
            return { isNatural: false, reason: 'Analysis service unavailable' };
        }
    },

    /**
     * Layer 2: Metadata Probe
     * Checks NCBI GenBank record for geographical source attributes.
     * @param {string} accession 
     */
    async checkSovereignty(accession) {
        if (!accession) return { isIndian: false };

        try {
            // Fetch GenBank record via our proxy
            const url = `/api/ncbi-utils/efetch.fcgi?db=nuccore&id=${accession}&retmode=text&rettype=gb`;
            const res = await fetch(url);
            if (!res.ok) return { isIndian: false };

            const text = await res.text();
            
            // Search for /country="India" or India in BioSample metadata
            const hasIndiaTag = text.includes('/country="India') || text.includes('/country="India:');
            const hasLatLonInIndia = text.includes('/lat_lon='); // Could be refined, but /country is the primary key

            if (hasIndiaTag) {
                return { 
                    isIndian: true, 
                    source: 'GenBank Metadata Probe',
                    detail: 'Physical source country explicitly tagged as India.' 
                };
            }

            return { isIndian: false };
        } catch (err) {
            console.error("Sovereignty probe failed for " + accession, err);
            return { isIndian: false };
        }
    }
};
