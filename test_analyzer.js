import { analyzeSequence } from './src/services/sequenceAnalyzer.js';

async function runTests() {
    console.log('--- STARTING SEQUENCE ANALYZER TESTS ---');

    // Test 1: Valid Sequence (simulated Neem/Restricted)
    const validFasta = `>test_sequence_1\nATGAGTTTCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATTGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATTGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGC\nATGAGTTTCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATTGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGCATTGGCTTCGGCATCGGCTTCGGCATCGGCTTCGGC`;
    console.log('\nTest 1: Valid + Restricted Sequence (>200bp)');
    const res1 = await analyzeSequence(validFasta);
    console.log('Status:', res1.status);
    console.log('Risk Status:', res1.masterRisk.status);
    console.log('Risk Message:', res1.masterRisk.message);

    // Test 2: Short Sequence (<200bp)
    const shortFasta = `>short_test\nATGAGTTTCTTCGGCATCGGCTTCGGCA`;
    console.log('\nTest 2: Short Sequence (<200bp)');
    const res2 = await analyzeSequence(shortFasta);
    console.log('Status:', res2.status);
    console.log('Error Reason:', res2.reason);

    // Test 3: Mixed Ambiguity (Handled by mock hit randomization in sequenceAnalyzer.js)
    console.log('\nTest 3: Checking JSON Report Structure');
    console.log(JSON.stringify(res1, null, 2));

    console.log('\n--- TESTS COMPLETED ---');
}

runTests().catch(console.error);
