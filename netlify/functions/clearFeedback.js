
const { headers, response, requireAdmin, feedbackKey, setJSON } = require('./shared');
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { ok:false, error:'POST required' });
  const auth = requireAdmin(event); if (auth) return auth;
  try { await setJSON(feedbackKey, []); return response(200, { ok:true, message:'Old feedback cleared successfully' }); }
  catch(e) { return response(500, { ok:false, error:e.message, stack:String(e.stack || '') }); }
};
