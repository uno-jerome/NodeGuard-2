import crypto from 'crypto';
import fs from 'fs';

export const computeFileHashes = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found at path: ${filePath}`));
    }

    const sha256Hash = crypto.createHash('sha256');
    const md5Hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      sha256Hash.update(chunk);
      md5Hash.update(chunk);
    });

    stream.on('end', () => {
      resolve({
        sha256: sha256Hash.digest('hex'),
        md5: md5Hash.digest('hex'),
      });
    });

    stream.on('error', (err) => {
      stream.destroy();
      reject(new Error(`Failed to compute file hashes: ${err.message}`));
    });
  });
};

export default {
  computeFileHashes,
};
