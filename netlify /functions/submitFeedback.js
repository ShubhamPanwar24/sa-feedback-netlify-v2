const s = require('./shared.js');
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers: s.headers, body: '' }; }
  if (event.httpMethod !== 'POST') { return s.response(405, { ok: false, error: 'POST required' }); }
  try {
    var body = JSON.parse(event.body || '{}');
    var submittedAt = body.submittedAt || new Date().toISOString();
    var input = Array.isArray(body.rows) ? body.rows : [];
    var rows = [];
    for (var i = 0; i < input.length; i++) {
      var f = s.normalizeFeedback(input[i], submittedAt);
      if (f['Reason for Pending'] && f['By which Date Connect']) { rows.push(f); }
    }
    if (!rows.length) { return s.response(400, { ok: false, error: 'No complete feedback rows received' }); }
    var oldFeedback = await s.getJSON(s.feedbackKey, []);
    var map = {};
    var out = [];
    for (i = 0; i < oldFeedback.length; i++) { map[s.idOf(oldFeedback[i])] = oldFeedback[i]; }
    for (i = 0; i < rows.length; i++) { map[s.idOf(rows[i])] = rows[i]; }
    for (var k in map) { if (k) { out.push(map[k]); } }
    await s.setJSON(s.feedbackKey, out);
    var tasks = await s.getJSON(s.taskKey, []);
    var done = {};
    for (i = 0; i < rows.length; i++) { done[s.idOf(rows[i])] = true; }
    for (i = 0; i < tasks.length; i++) { if (done[s.idOf(tasks[i])]) { tasks[i]['Feedback Status'] = 'Submitted'; } }
    await s.setJSON(s.taskKey, tasks);
    return s.response(200, { ok: true, saved: rows.length });
  } catch (e) { return s.response(500, { ok: false, error: e.message, stack: String(e.stack || '') }); }
};
