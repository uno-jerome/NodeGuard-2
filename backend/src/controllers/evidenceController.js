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

    const filePath = path.resolve(UPLOAD_DIR, evidence.storedFilename);
    const fileExists = fs.existsSync(filePath);

    let isMatch = false;
    let currentHashes = null;
    let status = 'error';
    let details = `Integrity check failed: Stored file missing from disk (${evidence.storedFilename})`;

    if (fileExists) {
      currentHashes = await computeFileHashes(filePath, { highWaterMark: 64 * 1024 });
      isMatch = currentHashes.sha256.toLowerCase() === evidence.sha256Hash.toLowerCase();
      status = isMatch ? 'verified' : 'mismatch';
      details = isMatch
        ? `Cryptographic integrity verified. SHA-256 matches baseline: ${currentHashes.sha256}`
        : `Cryptographic integrity FAILED. SHA-256 mismatch: ${currentHashes.sha256} vs baseline ${evidence.sha256Hash}`;
    }

    evidence.verificationStatus = status;
    evidence.verificationDetails = details;
    evidence.verifiedAt = new Date();

    Promise.all([
      evidence.save(),
      ChainOfCustodyLog.create({
        incidentId: evidence.incidentId,
        evidenceFileId: evidence._id,
        performedBy: req.user?.id || null,
        action: isMatch ? 'VERIFY_PASS' : 'VERIFY_FAIL',
        details,
        calculatedHash: currentHashes?.sha256 || null,
        ipAddress: req.ip || '127.0.0.1',
      }),
    ]).catch((err) => console.error('[ChainOfCustody Log Error]', err.message));

    if (!fileExists) {
      return res.status(404).json({
        success: false,
        match: false,
        verificationStatus: status,
        verifiedAt: evidence.verifiedAt,
        message: 'Evidence file missing from disk storage.',
      });
    }

    return res.status(200).json({
      success: true,
      match: isMatch,
      verificationStatus: status,
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

    const filePath = path.resolve(UPLOAD_DIR, evidence.storedFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on storage disk.' });
    }

    ChainOfCustodyLog.create({
      incidentId: evidence.incidentId,
      evidenceFileId: evidence._id,
      performedBy: req.user?.id || null,
      action: isPreview ? 'VIEW' : 'DOWNLOAD',
      details: `Evidence file ${isPreview ? 'previewed' : 'downloaded'}: ${evidence.originalFilename}`,
      calculatedHash: evidence.sha256Hash,
      ipAddress: req.ip || '127.0.0.1',
    }).catch((err) => console.error('[ChainOfCustody Log Error]', err.message));

    const disposition = isPreview ? 'inline' : 'attachment';
    return res.sendFile(filePath, {
      maxAge: 3600000,
      headers: {
        'Content-Type': evidence.mimeType || 'application/octet-stream',
        'Content-Disposition': `${disposition}; filename="${encodeURIComponent(evidence.originalFilename)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    }, (err) => {
      if (err && !res.headersSent) {
        res.status(err.status || 500).json({ success: false, message: err.message });
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  verifyEvidence,
  streamEvidence,
};
