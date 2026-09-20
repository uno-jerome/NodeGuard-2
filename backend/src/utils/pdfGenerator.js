import PDFDocument from 'pdfkit';

export const generateDossierPDF = (incident, logs = [], res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Dossier-${incident.trackingId}.pdf"`);

  doc.pipe(res);

  doc.fontSize(15).font('Helvetica-Bold').fillColor('#0f172a').text('NODEGUARD DIGITAL FORENSIC INCIDENTIAL REPORT', { align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor('#475569').text(`OFFICIAL TRACKING ID: ${incident.trackingId}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.8);

  const renderSectionHeader = (title) => {
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text(title);
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
    doc.moveDown(0.4);
    doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
  };

  renderSectionHeader('1. INCIDENT METADATA');
  const metadata = [
    `Tracking ID: ${incident.trackingId}    |    Status: ${incident.status}    |    Priority: ${incident.priority}`,
    `Category: ${incident.category}    |    Platform: ${incident.platform || 'Web'}    |    Estimated Loss: ₱${Number(incident.estimatedLoss || 0).toLocaleString()}`,
    `Incident Date: ${new Date(incident.incidentDate).toISOString()}    |    Date Ingested: ${new Date(incident.createdAt).toISOString()}`,
    `Complainant: ${incident.complainantName || 'Anonymous'} <${incident.complainantEmail || 'Not Provided'}>`,
  ];
  metadata.forEach((line) => doc.text(line));

  renderSectionHeader('2. CITIZEN NARRATIVE');
  doc.text(incident.narrative || 'No verbatim statement recorded.', { lineGap: 2 });

  renderSectionHeader('3. SUSPECT INFORMATION');
  doc.text(incident.suspectIdentifiers || 'No identified suspect accounts, handles, or indicators recorded.');

  renderSectionHeader('4. EVIDENCE MANIFEST');
  const evidenceList = incident.evidenceFiles || [];
  if (evidenceList.length === 0) {
    doc.text('No digital evidence files cataloged for this case.');
  } else {
    evidenceList.forEach((ev, idx) => {
      const sizeKB = (Number(ev.fileSize || 0) / 1024).toFixed(2);
      doc.font('Helvetica-Bold').text(`Artifact #${idx + 1}: ${ev.originalFilename || 'unnamed'} (${sizeKB} KB, ${ev.mimeType || 'application/octet-stream'})`);
      doc.font('Courier').fontSize(7.5).text(`SHA-256: ${ev.sha256Hash || 'N/A'}`);
      doc.font('Courier').fontSize(7.5).text(`MD5:     ${ev.md5Hash || 'N/A'}`);
      doc.font('Helvetica').fontSize(8.5).moveDown(0.3);
    });
  }

  renderSectionHeader('5. CHAIN OF CUSTODY AUDIT TRAIL');
  if (logs.length === 0) {
    doc.text('No chain of custody events recorded.');
  } else {
    logs.forEach((log) => {
      const timeStr = new Date(log.timestamp).toISOString();
      const roleStr = log.performedBy?.role || 'SYSTEM';
      const actorStr = log.performedBy?.email || 'Automated Pipeline';
      doc.font('Helvetica-Bold').text(`[${timeStr}] [${log.action}] Actor: ${actorStr} (${roleStr}) | IP: ${log.ipAddress || '127.0.0.1'}`);
      doc.font('Helvetica').text(`Details: ${log.details}`);
      if (log.calculatedHash) {
        doc.font('Courier').fontSize(7.5).text(`Verification Hash: ${log.calculatedHash}`);
        doc.font('Helvetica').fontSize(8.5);
      }
      doc.moveDown(0.3);
    });
  }

  doc.end();
};

export default { generateDossierPDF };
