import Incident from '../models/Incident.js';

export const generateTrackingId = async () => {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `CASE-${currentYear}-`;

  const count = await Incident.countDocuments({
    trackingId: new RegExp(`^${yearPrefix}`),
  });

  const sequentialNumber = String(count + 1).padStart(5, '0');
  return `${yearPrefix}${sequentialNumber}`;
};

export default generateTrackingId;
