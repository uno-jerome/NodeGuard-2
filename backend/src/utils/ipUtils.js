export const normalizeIp = (ip) => {
  if (!ip) return '127.0.0.1';
  const cleanIp = String(ip).replace(/^::ffff:/, '').trim();
  return cleanIp === '::1' ? '127.0.0.1' : cleanIp;
};

export const getClientIp = (req) => {
  if (!req) return '127.0.0.1';
  const forwarded = req.headers?.['x-forwarded-for'];
  const rawIp =
    req.headers?.['cf-connecting-ip'] ||
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
    req.ip ||
    req.socket?.remoteAddress;

  return normalizeIp(rawIp);
};

export default {
  normalizeIp,
  getClientIp,
};
