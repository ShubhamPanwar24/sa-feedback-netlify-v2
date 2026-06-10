const s = require('./shared.js');
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers: s.headers, body: '' }; }
  if (event.httpMethod !== 'POST') { return s.response(405, { ok: false, error: 'POST required' }); }
  var auth = s.requireAdmin(event); if (auth) { return auth; }
  try {
    var body = JSON.parse(event.body || '{}');
    var batchDate = body.batchDate || new Date().toISOString().slice(0, 10);
    var rows = [];
    var input = Array.isArray(body.rows) ? body.rows : [];
    for (var i = 0; i < input.length; i++) {
      var t = s.normalizeTask(input[i], batchDate);
      if (t['SA Owner'] && t['Appointment Number']) { rows.push(t); }
    }
    await s.setJSON(s.taskKey, rows);
    return s.response(200, { ok: true, imported: rows.length, batchDate: batchDate });
  } catch (e) { return s.response(500, { ok: false, error: e.message, stack: String(e.stack || '') }); }
};
