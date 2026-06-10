const s = require('./shared.js');
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers: s.headers, body: '' }; }
  try {
    var rows = await s.getJSON(s.taskKey, []);
    var pending = [];
    for (var i = 0; i < rows.length; i++) {
      if (s.clean(rows[i]['Feedback Status'] || 'Pending').toLowerCase() === 'pending') { pending.push(rows[i]); }
    }
    return s.response(200, { ok: true, rows: pending, total: pending.length });
  } catch (e) { return s.response(500, { ok: false, error: e.message, stack: String(e.stack || '') }); }
};
