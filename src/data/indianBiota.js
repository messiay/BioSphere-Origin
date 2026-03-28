/**
 * Indian Biota Registry (NCBI Taxon IDs)
 * Layer 1 of the NBA Forensic Dragnet.
 * High-priority species endemic to or strictly regulated by the NBA (India).
 */

export const INDIAN_TAX_IDS = {
    // 1. Medicinal & Traditional Knowledge (TK)
    "124943": "Azadirachta indica (Neem)",
    "35977": "Santalum album (Sandalwood)",
    "136217": "Curcuma longa (Turmeric)",
    "182236": "Ocimum tenuiflorum (Tulsi)",
    "126910": "Withania somnifera (Ashwagandha)",
    "136218": "Zingiber officinale (Ginger)",
    "35974": "Santalum genus",
    "103398": "Terminalia arjuna",
    "49990": "Bacopa monnieri (Brahmi)",
    "38254": "Tinospora cordifolia (Giloy)",
    
    // 2. Commercial & Staples
    "39946": "Oryza sativa indica (Rice)",
    "29780": "Mangifera indica (Mango)",
    "57700": "Crocus sativus (Saffron)",
    "9915": "Bos taurus indicus (Zebu Cattle)",
    "161934": "Elettaria cardamomum (Cardamom)",
    "101570": "Piper nigrum (Black Pepper)",
    "57030": "Cocos nucifera (Coconut - Indian varieties)",
    
    // 3. Endemic Fauna
    "9694": "Panthera tigris tigris (Bengal Tiger)",
    "9708": "Panthera leo leo (Asiatic Lion)",
    "1536768": "Nilgiritragus hylocrius (Nilgiri Tahr)",
    "9813": "Rhinoceros unicornis (Indian Rhinoceros)",
    "28004": "Elephas maximus (Asian Elephant)",
    
    // 4. Industrial & Forestry
    "13437": "Tectona grandis (Teak)",
    "146972": "Dalbergia sissoo (Shisham)",
    "13436": "Bambusa bambos (Giant Bamboo)",
    
    // 5. Synonyms & Groups
    "4530": "Oryza sativa (Rice - Flagged for sub-strain check)",
    "29779": "Mangifera (Mango Genus)"
};

export const isIndianTaxid = (taxid) => {
    if (!taxid) return false;
    return !!INDIAN_TAX_IDS[taxid.toString()];
};

export const getIndianSpeciesName = (taxid) => {
    return INDIAN_TAX_IDS[taxid.toString()] || null;
};
