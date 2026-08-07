const crypto = require('crypto');

const COOKIE = 'dus_review';
const WEEK = 60 * 60 * 24 * 7;

function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expect = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expect))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (!payload.email || payload.exp < Date.now() / 1000) return null;
  return payload;
}

function getSession(req) {
  const secret = process.env.REVIEW_SESSION_SECRET;
  if (!secret) return null;
  const raw = req.headers.cookie || '';
  const m = raw.match(new RegExp(`${COOKIE}=([^;]+)`));
  try {
    return m ? verify(decodeURIComponent(m[1]), secret) : null;
  } catch {
    return null;
  }
}

function sessionCookie(email) {
  const secret = process.env.REVIEW_SESSION_SECRET;
  const token = sign({ email, exp: Math.floor(Date.now() / 1000) + WEEK }, secret);
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${WEEK}; HttpOnly; Secure; SameSite=Lax`;
}

function clearCookie() {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

function allowedEmails() {
  return (process.env.REVIEW_ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || '{}');
  } catch {
    return {};
  }
}

module.exports = { getSession, sessionCookie, clearCookie, allowedEmails, readJson };
