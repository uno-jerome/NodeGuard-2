import crypto from 'node:crypto';

export const generateTrackingId = () => {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString('hex').slice(0, 5).toUpperCase();
  return `CASE-${year}-${suffix}`;
};

export default generateTrackingId;
