/**
 * Parses a FASTA or raw sequence string.
 * @param {string} input - The raw input text.
 * @returns {Object} Parsed sequence object
 */
export function parseSequence(input) {
    if (!input || typeof input !== 'string') {
        return { sequence: '', header: '', error: 'Invalid input' };
    }

    const trimmedInput = input.trim();
    const isFasta = trimmedInput.startsWith('>');
    let sequence = '';
    let header = '';

    if (isFasta) {
        const lines = input.split(/\r?\n/);
        header = lines[0].replace(/^>/, '').trim();
        // Join all subsequent lines, removing whitespace
        sequence = lines.slice(1).join('').replace(/\s/g, '').toUpperCase();
    } else {
        // Treat as raw sequence
        sequence = input.replace(/\s/g, '').toUpperCase();
        header = 'Raw Input Sequence';
    }

    // Filter for valid nucleotides (ATGCN) 
    const cleanSequence = sequence.replace(/[^ATGCN]/g, '');
    const invalidCount = sequence.length - cleanSequence.length;

    return {
        sequence: cleanSequence,
        header,
        type: isFasta ? 'FASTA' : 'RAW',
        length: cleanSequence.length,
        invalidCount,
        timestamp: Date.now()
    };
}
