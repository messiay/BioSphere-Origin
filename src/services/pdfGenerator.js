import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const PdfGenerator = {
    generateReport(result) {
        try {
            const doc = new jsPDF();
            const { metadata, globalMatches, organismMatches, risk, compliance } = result;

            // --- Header ---
            doc.setFillColor(63, 81, 181); // Indigo color
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('BioSphere Origin Security Report', 105, 13, { align: 'center' });

            // --- Metadata Section ---
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
            doc.text(`Sequence Length: ${metadata.length} bp`, 14, 35);
            doc.text(`Sequence Type: ${metadata.type || 'DNA'}`, 14, 40);
            doc.text(`Reference ID: BP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 14, 45);

            // --- Risk Score Section ---
            let riskColor = [46, 125, 50]; // Green
            if (risk.riskLevel === 'RED') riskColor = [198, 40, 40];
            if (risk.riskLevel === 'YELLOW') riskColor = [251, 192, 45];

            doc.setDrawColor(...riskColor);
            doc.setFillColor(...riskColor);
            doc.rect(140, 25, 55, 25, 'FD');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${risk.riskLevel} RISK`, 167.5, 35, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Score: ${risk.overallScore}%`, 167.5, 42, { align: 'center' });
            doc.setFontSize(8);
            doc.text(risk.status, 167.5, 47, { align: 'center' });

            doc.setTextColor(0, 0, 0);

            // --- Global Patents Table ---
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Global Patent Matches (NCBI pat)', 14, 60);

            let finalY = 70;

            if (globalMatches && globalMatches.length > 0) {
                const patentRows = globalMatches.slice(0, 10).map(hit => [
                    hit.title.substring(0, 60) + (hit.title.length > 60 ? '...' : ''),
                    hit.id,
                    `${hit.identityPercentage.toFixed(1)}%`
                ]);

                autoTable(doc, {
                    startY: 65,
                    head: [['Patent Title', 'ID', 'Identity']],
                    body: patentRows,
                    theme: 'striped',
                    headStyles: { fillColor: [63, 81, 181] },
                    styles: { fontSize: 8 },
                    didDrawPage: (d) => { finalY = d.cursor.y; } // Capture end position
                });

                // If autoTable split pages, we need to respect that, but for single page dashboard:
                // Just getting the last Y from the instance if possible, or using the hook.
                if (doc.lastAutoTable) finalY = doc.lastAutoTable.finalY + 15;

            } else {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.text('No matching patents found in global database.', 14, 68);
                finalY = 80;
            }

            // --- Biological Matches Table ---
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Global Biological Matches (NCBI nt)', 14, finalY);

            if (organismMatches && organismMatches.length > 0) {
                const bioRows = organismMatches.slice(0, 10).map(hit => [
                    hit.title.substring(0, 60) + (hit.title.length > 60 ? '...' : ''),
                    hit.accession,
                    `${hit.identityPercentage.toFixed(1)}%`
                ]);

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Organism / Sequence', 'Accession', 'Identity']],
                    body: bioRows,
                    theme: 'striped',
                    headStyles: { fillColor: [46, 125, 50] },
                    styles: { fontSize: 8 }
                });
            } else {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.text('No matching organisms found (Novel/Synthetic).', 14, finalY + 8);
            }

            // Capture Y position after second table
            if (doc.lastAutoTable) finalY = doc.lastAutoTable.finalY + 15;
            else finalY += 20;

            // --- Regulatory Compliance (New Section) ---
            if (compliance) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text('Regulatory Compliance Audit', 14, finalY);

                // Status Box
                let statusColor = [100, 116, 139]; // Slate
                if (compliance.status === 'COMPLIANT') statusColor = [22, 163, 74]; // Green
                if (compliance.status === 'RESTRICTED') statusColor = [220, 38, 38]; // Red
                if (compliance.status === 'WARNING') statusColor = [202, 138, 4]; // Yellow

                doc.setDrawColor(...statusColor);
                doc.setFillColor(248, 250, 252); // Very light slate
                doc.rect(14, finalY + 5, 180, 20, 'FD');

                doc.setFontSize(10);
                doc.setTextColor(...statusColor);
                doc.text(`JURISDICTION: ${compliance.country}`, 20, finalY + 12);

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`STATUS: ${compliance.status}`, 20, finalY + 18);

                // Legal Text
                doc.setFontSize(9);
                doc.setTextColor(50, 50, 50);
                doc.setFont('helvetica', 'normal');

                // Truncate guidance text if too long
                const guidance = doc.splitTextToSize(compliance.guidance || 'No specific guidance.', 170);
                doc.text(guidance, 14, finalY + 35);
            }

            // --- Disclaimer ---
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('This report is generated by BioSphere Origin interacting with NCBI Public Databases.', 105, pageHeight - 10, { align: 'center' });
            doc.text('Not for clinical use.', 105, pageHeight - 6, { align: 'center' });

            // Save
            doc.save(`BioSphere_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate PDF. check console for details.");
        }
    }
};
