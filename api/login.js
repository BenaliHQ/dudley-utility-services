const { sessionCookie, clearCookie, allowedEmails, readJson, getSession } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const s = getSession(req);
    return res.status(200).json({ email: s ? s.email : null });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearCookie());
    return res.status(200).json({ ok: true });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const { email, password } = await readJson(req);
  const normalized = String(email || '').trim().toLowerCase();
  const ok =
    allowedEmails().includes(normalized) &&
    password === process.env.REVIEW_PASSWORD &&
    Boolean(process.env.REVIEW_PASSWORD);
  if (!ok) return res.status(401).json({ error: 'That email and password combination is not on the reviewer list.' });

  res.setHeader('Set-Cookie', sessionCookie(normalized));
  return res.status(200).json({ email: normalized });
};
