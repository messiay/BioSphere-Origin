export function calculateRiskScore(matches) {
    if (!matches || matches.length === 0) {
        return {
            overallScore: 0,
            riskLevel: "GREEN",
            status: "CLEAR_TO_OPERATE"
        };
    }

    let maxRiskScore = 0;

    for (const match of matches) {
        let matchScore = 0;

        // Risk level base score from the matched registry entry
        const riskType = match.entry?.riskLevel || "PATENT";

        if (riskType === "RESTRICTED") {
            matchScore = 1.0; // 100% risk
        } else if (riskType === "PATENT") {
            matchScore = 0.5; // 50% base risk
        }

        // Similarity modifier (default to 1.0 if strictly exact)
        const similarity = match.similarity || 1.0;
        matchScore *= similarity;

        // Patent expiration discount (mock logic)
        if (match.entry?.expirationDate) {
            const expiry = new Date(match.entry.expirationDate);
            const now = new Date();
            if (expiry < now) {
                matchScore *= 0.1; // 90% discount for expired patents
            }
        }

        maxRiskScore = Math.max(maxRiskScore, matchScore);
    }

    let riskLevel, status;
    if (maxRiskScore >= 0.8) {
        riskLevel = "RED";
        status = "RESTRICTED_DO_NOT_USE";
    } else if (maxRiskScore >= 0.5) {
        riskLevel = "YELLOW";
        status = "NOT_CLEAR_TO_OPERATE";
    } else {
        riskLevel = "GREEN";
        status = "LIKELY_CLEAR";
    }

    return {
        overallScore: parseFloat((maxRiskScore * 100).toFixed(2)),
        riskLevel,
        status
    };
}
