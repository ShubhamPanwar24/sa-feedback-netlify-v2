const blobs = require('@netlify/blobs');
var headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-pin',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};
var taskKey = 'current-pending-tasks.json';
var feedbackKey = 'feedback-submissions.json';
function response(statusCode, body, extraHeaders) {
  var h = {};
  var k;
  for (k in headers) { h[k] = headers[k]; }
  if (extraHeaders) { for (k in extraHeaders) { h[k] = extraHeaders[k]; } }
  return { statusCode: statusCode, headers: h, body: (typeof body === 'string' ? body : JSON.stringify(body)) };
}
function clean(v) {
  if (v === null || v === undefined) { return ''; }
  return String(v).trim().replace(/\s+/g, ' ');
}
function getHeader(event, name) {
  if (!event || !event.headers) { return ''; }
  return event.headers[name] || event.headers[name.toLowerCase()] || event.headers[name.toUpperCase()] || '';
}
function requireAdmin(event) {
  var expected = process.env.ADMIN_PIN || '1234';
  var pin = getHeader(event, 'x-admin-pin');
  if (!pin && event && event.queryStringParameters) { pin = event.queryStringParameters.pin || ''; }
  if (String(pin) !== String(expected)) {
    return response(401, { ok: false, error: 'Invalid Admin PIN. If ADMIN_PIN is not set in Netlify, default PIN is 1234.' });
  }
  return null;
}
function store() { return blobs.getStore('sa-feedback-ultra-stable'); }
async function getJSON(key, fallback) {
  var txt = await store().get(key);
  if (!txt) { return fallback; }
  try { return JSON.parse(txt); } catch (e) { return fallback; }
}
async function setJSON(key, value) { await store().set(key, JSON.stringify(value)); }
function idOf(r) {
  if (!r) { return ''; }
  return clean(r['Appointment Number'] || r.AppointmentNumber || r['Work Order Number'] || r.WorkOrderNumber || (String(r['Cluster ID'] || r.ClusterID || '') + '|' + String(r.PMAID || '')));
}
function normalizeTask(r, batchDate) {
  r = r || {};
  return {
    'Cluster ID': clean(r['Cluster ID'] || r.ClusterID),
    'HHID': clean(r.HHID || r['HHID']),
    'PMAID': clean(r.PMAID || r['PMAID']),
    'Work Order Number': clean(r['Work Order Number'] || r.WorkOrderNumber),
    'SA Owner': clean(r['SA Owner'] || r.SAOwner),
    'Appointment Number': clean(r['Appointment Number'] || r.AppointmentNumber),
    'Work Type': clean(r['Work Type'] || r.WorkType || 'Maintenance-Meter Related'),
    'Task Status': clean(r['Task Status'] || r.TaskStatus || r.Status || r['Status.1']),
    'Batch Date': clean(r['Batch Date'] || r.BatchDate || batchDate),
    'Feedback Status': clean(r['Feedback Status'] || r.FeedbackStatus || 'Pending')
  };
}
function normalizeFeedback(r, submittedAt) {
  r = r || {};
  return {
    'Cluster ID': clean(r['Cluster ID'] || r.ClusterID),
    'HHID': clean(r.HHID || r['HHID']),
    'PMAID': clean(r.PMAID || r['PMAID']),
    'Work Order Number': clean(r['Work Order Number'] || r.WorkOrderNumber),
    'SA Owner': clean(r['SA Owner'] || r.SAOwner),
    'Appointment Number': clean(r['Appointment Number'] || r.AppointmentNumber),
    'Reason for Pending': clean(r['Reason for Pending'] || r.ReasonForPending),
    'By which Date Connect': clean(r['By which Date Connect'] || r.ByWhichDateConnect),
    'Submitted Time': clean(r['Submitted Time'] || r.SubmittedTime || submittedAt)
  };
}
module.exports = {
  headers: headers,
  taskKey: taskKey,
  feedbackKey: feedbackKey,
  response: response,
  clean: clean,
  requireAdmin: requireAdmin,
  getJSON: getJSON,
  setJSON: setJSON,
  idOf: idOf,
  normalizeTask: normalizeTask,
  normalizeFeedback: normalizeFeedback
};
