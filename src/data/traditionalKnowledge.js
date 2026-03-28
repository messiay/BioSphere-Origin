/**
 * Traditional Knowledge (TK) Registry - India
 * Top 500 plants from the TKDL (Traditional Knowledge Digital Library) or common ayurvedic knowledge.
 * For MVP, we use the top 50 scientific names.
 */

export const TK_PLANTS = [
    "Azadirachta indica", // Neem
    "Curcuma longa",       // Turmeric
    "Ocimum sanctum",      // Tulsi
    "Withania somnifera",  // Ashwagandha
    "Zingiber officinale", // Ginger
    "Aloe vera",           // Aloe
    "Asparagus racemosus", // Shatavari
    "Bacopa monnieri",    // Brahmi
    "Cassia fistula",      // Amaltas
    "Centella asiatica",   // Gotu Kola
    "Commiphora wightii",  // Guggul
    "Emblica officinalis", // Amla
    "Glycyrrhiza glabra",  // Mulethi
    "Gymnema sylvestre",   // Gurmar
    "Moringa oleifera",    // Drumstick
    "Phyllanthus amarus",  // Bhuiamla
    "Piper longum",        // Pippali
    "Rauwolfia serpentina",// Sarpagandha
    "Santalum album",      // Sandalwood
    "Terminalia arjuna",   // Arjuna
    "Terminalia chebula",  // Harad
    "Tinospora cordifolia",// Giloy
    "Tribulus terrestris", // Gokhru
    "Trigonella foenum-graecum", // Methi
    "Vitex negundo",       // Nirgundi
    "Adhatoda vasica",     // Vasa
    "Andrographis paniculata", // Kalmegh
    "Boerhavia diffusa",   // Punarnava
    "Coleus forskohlii",   // Forskolin
    "Eclipta alba",        // Bhringraj
    "Holarrhena antidysenterica", // Kutaj
    "Momordica charantia", // Karela
    "Nelumbo nucifera",    // Lotus
    "Psoralea corylifolia",// Babchi
    "Saraca asoca",        // Ashoka
    "Solanum nigrum",      // Makoy
    "Swertia chirayita",   // Chirayta
    "Tylophora indica",    // Antamul
    "Valeriana wallichii", // Tagara
    "Aconitum heterophyllum", // Atis
    "Acorus calamus",      // Vacha
    "Albizia lebbeck",     // Shirish
    "Berberis aristata",   // Daruharidra
    "Cedrus deodara",      // Devdar
    "Cinnamomum tamala",   // Tejpatta
    "Crocus sativus",      // Kesar
    "Elettaria cardamomum",// Elaichi
    "Mesua ferrea",        // Nagkesar
    "Nardostachys jatamansi", // Jatamansi
    "Pterocarpus santalinus" // Raktachandan
];

export const isTKMatch = (name) => {
    if (!name) return false;
    const lower = name.toLowerCase();
    return TK_PLANTS.some(plant => lower.includes(plant.toLowerCase()));
};
