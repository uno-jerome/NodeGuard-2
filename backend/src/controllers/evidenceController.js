import path from 'path';
import fs from 'fs';
import EvidenceFile from '../models/EvidenceFile.js';
import ChainOfCustodyLog from '../models/ChainOfCustodyLog.js';
import { computeFileHashes } from '../services/forensicService.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export const verifyEvidence = async (req, res) => {
  try {
    const evidence = await EvidenceFile.findById(req.params.id);
    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence file not found.' });
    }

    const filePath = path.join(UPLOAD_DIR, evidence.storedFilename);
    if (!fs.existsSync(filePath)) {
      const details = `Integrity check failed: Stored file missing from disk (${evidence.storedFilename})`;
      evidence.verificationStatus = 'error';
      evidence.verificationDetails = details;
      evidence.verifiedAt = new Date();
      await evidence.save();

      await ChainOfCustodyLog.create({
        incidentId: evidence.incidentId,
        evidenceFileId: evidence._id,
        performedBy: req.user?.id || null,
        action: 'VERIFY_FAIL',
        details,
        calculatedHash: null,
        ipAddress: req.ip || '127.0.0.1',
      });
      return res.status(404).json({
        success: false,
        match: false,
        verificationStatus: evidence.verificationStatus,
        verifiedAt: evidence.verifiedAt,
        message: 'Evidence file missing from disk storage.',
      });
    }

    const currentHashes = await computeFileHashes(filePath);
    const isMatch = currentHashes.sha256.toLowerCase() === evidence.sha256Hash.toLowerCase();
    const verificationStatus = isMatch ? 'verified' : 'mismatch';
    const details = isMatch
      ? `Cryptographic integrity verified. SHA-256 matches baseline: ${currentHashes.sha256}`
      : `Cryptographic integrity FAILED. SHA-256 mismatch: ${currentHashes.sha256} vs baseline ${evidence.sha256Hash}`;

    evidence.verificationStatus = verificationStatus;
    evidence.verificationDetails = details;
    evidence.verifiedAt = new Date();

    await Promise.all([
      evidence.save(),
      ChainOfCustodyLog.create({
        incidentId: evidence.incidentId,
        evidenceFileId: evidence._id,
        performedBy: req.user?.id || null,
        action: isMatch ? 'VERIFY_PASS' : 'VERIFY_FAIL',
        details,
        calculatedHash: currentHashes.sha256,
        ipAddress: req.ip || '127.0.0.1',
      }),
    ]);

    return res.status(200).json({
      success: true,
      match: isMatch,
      verificationStatus,
      verifiedAt: evidence.verifiedAt,
      currentHash: currentHashes.sha256,
      baselineHash: evidence.sha256Hash,
      md5: currentHashes.md5,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const streamEvidence = async (req, res) => {
  try {
    const isPreview = req.query.disposition === 'inline';
    const evidence = await EvidenceFile.findById(req.params.id);
    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence file not found.' });
    }

    const filePath = path.join(UPLOAD_DIR, evidence.storedFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on storage disk.' });
    }

    const disposition = isPreview ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(evidence.originalFilename)}"`);
    res.setHeader('Content-Type', evidence.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', evidence.fileSize);

    // Record audit custody log asynchronously without blocking file streaming start
    ChainOfCustodyLog.create({
      incidentId: evidence.incidentId,
      evidenceFileId: evidence._id,
      performedBy: req.user?.id || null,
      action: isPreview ? 'VIEW' : 'DOWNLOAD',
      details: isPreview
        ? `Evidence file previewed: ${evidence.originalFilename}`
        : `Evidence file downloaded: ${evidence.originalFilename}`,
      calculatedHash: evidence.sha256Hash,
      ipAddress: req.ip || '127.0.0.1',
    }).catch((err) => console.error('[ChainOfCustody Log Error]', err.message));

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  verifyEvidence,
  streamEvidence,
};
