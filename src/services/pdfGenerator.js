import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const PdfGenerator = {
    async generateReport(result) {
        try {
            const doc = new jsPDF();
            const { metadata, globalMatches, organismMatches, risk, compliance, biopiracyData, isCertifiedNonIndian } = result;
            const pageHeight = doc.internal.pageSize.height;

            // --- PAGE 1: HEADER & PATENTS ---
            
            // Header
            let headerColor = [30, 41, 59]; // Dark slate
            if (biopiracyData?.isIndian) headerColor = [153, 27, 27]; // Red
            
            doc.setFillColor(...headerColor);
            doc.rect(0, 0, 210, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('BioSphere Origin: Biosecurity Triage Report', 105, 16, { align: 'center' });

            // Metadata & Risk Dashboard
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('EXECUTIVE SUMMARY', 14, 35);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Analysis Date: ${result.timestamp ? new Date(result.timestamp).toLocaleString() : new Date().toLocaleString()}`, 14, 42);
            doc.text(`Sequence ID:   BP-${result.hash?.substring(0, 8).toUpperCase() || 'UNKNOWN'}`, 14, 47);
            doc.text(`Length:        ${metadata.length} bp`, 14, 52);

            // Risk Box (Top Right)
            let riskColor = [34, 197, 94]; // Green
            if (risk.riskLevel === 'RED') riskColor = [239, 68, 68];
            if (risk.riskLevel === 'YELLOW') riskColor = [234, 179, 8];

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(...riskColor);
            doc.setLineWidth(1);
            doc.roundedRect(140, 32, 56, 25, 2, 2, 'FD');
            
            doc.setTextColor(...riskColor);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${risk.riskLevel} RISK`, 168, 42, { align: 'center' });
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`Score: ${risk.overallScore}%`, 168, 48, { align: 'center' });
            doc.text(risk.status, 168, 53, { align: 'center' });

            // Sovereignty Box (Bottom Right of Summary)
            let sovColor = [34, 197, 94]; // Green
            let sovText = "CLEARED / CERTIFIED";
            if (biopiracyData?.isIndian) {
                sovColor = [220, 38, 38];
                sovText = "NBA RESTRICTED";
            } else if (!isCertifiedNonIndian) {
                sovColor = [234, 179, 8];
                sovText = "PENDING DISCLOSURE";
            }

            doc.setDrawColor(...sovColor);
            doc.roundedRect(140, 58, 56, 12, 1, 1, 'S');
            doc.setTextColor(...sovColor);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text("SOVEREIGNTY STATUS", 168, 62, { align: 'center' });
            doc.setFontSize(6);
            doc.text(sovText, 168, 66, { align: 'center' });

            // Section 1: Global Patent Matches
            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.text('Section 1: Global Patent Matches (NCBI pat)', 14, 70);

            if (globalMatches && globalMatches.length > 0) {
                const patentRows = globalMatches.slice(0, 12).map(hit => [
                    hit.title,
                    hit.id,
                    `${hit.identityPercentage.toFixed(1)}%`,
                    `${hit.alignLength || 0} bp`,
                    hit.status || 'ACTIVE'
                ]);

                autoTable(doc, {
                    startY: 75,
                    head: [['Patent Title', 'ID', 'Identity', 'Matches', 'Status']],
                    body: patentRows,
                    theme: 'striped',
                    headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
                    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
                    columnStyles: {
                        0: { cellWidth: 85 },
                        1: { cellWidth: 25 },
                        2: { cellWidth: 15 },
                        3: { cellWidth: 15 },
                        4: { cellWidth: 18 }
                    }
                });
            } else {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.text('No matching patents found in global database.', 14, 78);
            }

            // Footer Page 1
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('Page 1 of 2', 105, pageHeight - 10, { align: 'center' });

            // --- PAGE 2: BIOLOGICAL & COMPLIANCE ---
            doc.addPage();

            // Section 2: Global Biological Matches
            doc.setFillColor(30, 41, 59);
            doc.rect(0, 0, 210, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Section 2: Global Biological Matches (NCBI nt)', 14, 10);

            let page2Y = 25;

            if (organismMatches && organismMatches.length > 0) {
                const bioRows = organismMatches.slice(0, 10).map(hit => [
                    hit.title,
                    hit.accession,
                    `${hit.identityPercentage.toFixed(1)}%`,
                    `${hit.alignLength || 0} bp`
                ]);

                autoTable(doc, {
                    startY: 25,
                    head: [['Organism / Sequence', 'Accession', 'Identity', 'Matches']],
                    body: bioRows,
                    theme: 'striped',
                    headStyles: { fillColor: [71, 85, 105], fontSize: 8 },
                    styles: { fontSize: 7, cellPadding: 2 },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 35 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 20 }
                    }
                });
                page2Y = doc.lastAutoTable.finalY + 15;
            } else {
                doc.setFontSize(10);
                doc.setTextColor(40, 40, 40);
                doc.setFont('helvetica', 'italic');
                doc.text('No matching organisms found (Synthetic Origin).', 14, 30);
                page2Y = 40;
            }

            // Section 3: Regulatory Compliance Audit
            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.text('Section 3: Regulatory Compliance Audit (India SCOMET)', 14, page2Y);

            if (compliance) {
                const statusColor = compliance.status === 'RESTRICTED' ? [239, 68, 68] : [71, 85, 105];
                doc.setDrawColor(...statusColor);
                doc.setLineWidth(0.5);
                doc.line(14, page2Y + 2, 196, page2Y + 2);

                const drawRow = (label, value, y) => {
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105);
                    doc.text(label, 14, y);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(30, 41, 59);
                    const wrappedValue = doc.splitTextToSize(value || 'N/A', 130);
                    doc.text(wrappedValue, 65, y);
                    return y + (wrappedValue.length * 4.5);
                };

                let auditY = page2Y + 10;
                auditY = drawRow('JURISDICTION:', compliance.jurisdiction, auditY);
                auditY = drawRow('OVERALL STATUS:', compliance.status, auditY);
                auditY += 3;
                auditY = drawRow('Section 3(c)/3(j) Nature Check:', `${result.natureCheck?.isNatural ? 'REGULATED' : 'PASS'} - ${result.natureCheck?.reason}`, auditY);
                auditY = drawRow('Section 3(p) TK Safeguard:', `${result.tkStatus ? 'FLAGGED' : 'PASS'} - ${result.tkStatus ? 'Match detected' : 'Clear'}`, auditY);
                auditY = drawRow('Section 2(1)(j) Novelty:', `${result.noveltyCheck?.status === 'RED' ? 'FAIL' : 'PASS'} - ${result.noveltyCheck?.reason}`, auditY);
                
                const sovDetail = biopiracyData?.isIndian 
                    ? `RESTRICTED: Detected via ${biopiracyData.source}. Form 3 Mandatory.` 
                    : `CLEARED: No digital matches found. ${isCertifiedNonIndian ? 'Source country certified as non-Indian.' : 'Certification Pending.'}`;
                auditY = drawRow('NBA Sovereignty Audit:', sovDetail, auditY);

                if (biopiracyData?.isIndian) {
                    let invStatus = 'PENDING';
                    if (biopiracyData.hasForeignVC === true) invStatus = 'FOREIGN PARTICIPATION DETECTED (SECTION 6 APPLICABLE)';
                    if (biopiracyData.hasForeignVC === false) invStatus = 'NO FOREIGN INVESTMENT (NFI)';
                    if (biopiracyData.hasForeignVC === 'SKIP') invStatus = 'DISCLOSURE DEFERRED';
                    auditY = drawRow('FOREIGN INVESTMENT:', invStatus, auditY);
                }
            }

            // Liability Shield Footer
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.setFont('courier', 'bold');
            doc.text(`SHA-256 FINGERPRINT: ${result.hash}`, 14, pageHeight - 18);
            
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            doc.text('This report is timestamped for sequence integrity verification. Generated by BioSphere Origin v2.1.0-RC.', 14, pageHeight - 14);
            doc.text('Page 2 of 2', 105, pageHeight - 10, { align: 'center' });

            // Save
            const dateStr = result.timestamp ? new Date(result.timestamp).toISOString().split('T')[0] : 'Report';
            const hashShort = result.hash ? result.hash.substring(0, 8).toUpperCase() : 'NO_HASH';
            doc.save(`BioSphere_Audit_${dateStr}_${hashShort}.pdf`);
            
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate PDF. Check console.");
        }
    }
};
