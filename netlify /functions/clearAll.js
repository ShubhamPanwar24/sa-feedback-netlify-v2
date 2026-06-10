const s = require('./shared.js');
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers: s.headers, body: '' }; }
  if (event.httpMethod !== 'POST') { return s.response(405, { ok: false, error: 'POST required' }); }
  var auth = s.requireAdmin(event); if (auth) { return auth; }
  try { await s.setJSON(s.taskKey, []); await s.setJSON(s.feedbackKey, []); return s.response(200, { ok: true, message: 'All data cleared' }); }
  catch (e) { return s.response(500, { ok: false, error: e.message, stack: String(e.stack || '') }); }
};
