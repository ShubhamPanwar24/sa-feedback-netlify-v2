
const { headers, response, requireAdmin, taskKey, normalizeTask, setJSON } = require('./shared');
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { ok:false, error:'POST required' });
  const auth = requireAdmin(event); if (auth) return auth;
  try {
    const body = JSON.parse(event.body || '{}');
    const batchDate = body.batchDate || new Date().toISOString().slice(0, 10);
    const rows = Array.isArray(body.rows) ? body.rows.map(r => normalizeTask(r, batchDate)).filter(r => r['SA Owner'] && r['Appointment Number']) : [];
    await setJSON(taskKey, rows);
    return response(200, { ok:true, imported: rows.length, batchDate });
  } catch (e) { return response(500, { ok:false, error:e.message, stack:String(e.stack || '') }); }
};
