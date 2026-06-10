
const { headers, response, taskKey, feedbackKey, getJSON, setJSON, normalizeFeedback, idOf } = require('./shared');
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { ok:false, error:'POST required' });
  try {
    const body = JSON.parse(event.body || '{}');
    const submittedAt = body.submittedAt || new Date().toISOString();
    const rows = Array.isArray(body.rows) ? body.rows.map(r => normalizeFeedback(r, submittedAt)).filter(r => r['Reason for Pending'] && r['By which Date Connect']) : [];
    if (!rows.length) return response(400, { ok:false, error:'No complete feedback rows received' });
    const oldFeedback = await getJSON(feedbackKey, []);
    const feedbackMap = new Map(oldFeedback.map(r => [idOf(r), r]));
    rows.forEach(r => feedbackMap.set(idOf(r), r));
    await setJSON(feedbackKey, Array.from(feedbackMap.values()));
    let tasks = await getJSON(taskKey, []);
    const done = new Set(rows.map(idOf));
    tasks = tasks.map(t => done.has(idOf(t)) ? { ...t, 'Feedback Status': 'Submitted' } : t);
    await setJSON(taskKey, tasks);
    return response(200, { ok:true, saved: rows.length });
  } catch (e) { return response(500, { ok:false, error:e.message, stack:String(e.stack || '') }); }
};
