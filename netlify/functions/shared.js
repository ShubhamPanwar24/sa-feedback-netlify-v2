
const { getStore } = require('@netlify/blobs');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-pin',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

const taskKey = 'current-pending-tasks.json';
const feedbackKey = 'feedback-submissions.json';

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...headers, ...extraHeaders },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

function requireAdmin(event) {
  const expected = process.env.ADMIN_PIN || '1234';
  const pin = (event.headers && (event.headers['x-admin-pin'] || event.headers['X-Admin-Pin'])) ||
              (event.queryStringParameters && event.queryStringParameters.pin) || '';
  if (String(pin) !== String(expected)) {
    return response(401, { ok: false, error: 'Invalid Admin PIN. If ADMIN_PIN is not set in Netlify, default PIN is 1234.' });
  }
  return null;
}

function store() {
  return getStore('sa-owner-feedback-final');
}

async function getJSON(key, fallback = []) {
  const txt = await store().get(key);
  if (!txt) return fallback;
  try { return JSON.parse(txt); } catch (e) { return fallback; }
}

async function setJSON(key, value) {
  await store().set(key, JSON.stringify(value));
}

function clean(v) {
  return String(v ?? '').trim().replace(/\s+/g, ' ');
}

function idOf(r) {
  return clean(r['Appointment Number'] || r.AppointmentNumber || r['Work Order Number'] || r.WorkOrderNumber || `${r['Cluster ID'] || r.ClusterID || ''}|${r.PMAID || ''}`);
}

function normalizeTask(r, batchDate = '') {
  return {
    'Cluster ID': clean(r['Cluster ID'] ?? r.ClusterID),
    'HHID': clean(r.HHID ?? r['HHID']),
    'PMAID': clean(r.PMAID ?? r['PMAID']),
    'Work Order Number': clean(r['Work Order Number'] ?? r.WorkOrderNumber),
    'SA Owner': clean(r['SA Owner'] ?? r.SAOwner),
    'Appointment Number': clean(r['Appointment Number'] ?? r.AppointmentNumber),
    'Work Type': clean(r['Work Type'] ?? r.WorkType ?? 'Maintenance-Meter Related'),
    'Task Status': clean(r['Task Status'] ?? r.TaskStatus ?? r.Status ?? r['Status.1']),
    'Batch Date': clean(r['Batch Date'] ?? r.BatchDate ?? batchDate),
    'Feedback Status': clean(r['Feedback Status'] ?? r.FeedbackStatus ?? 'Pending') || 'Pending'
  };
}

function normalizeFeedback(r, submittedAt = '') {
  return {
    'Cluster ID': clean(r['Cluster ID'] ?? r.ClusterID),
    'HHID': clean(r.HHID ?? r['HHID']),
    'PMAID': clean(r.PMAID ?? r['PMAID']),
    'Work Order Number': clean(r['Work Order Number'] ?? r.WorkOrderNumber),
    'SA Owner': clean(r['SA Owner'] ?? r.SAOwner),
    'Appointment Number': clean(r['Appointment Number'] ?? r.AppointmentNumber),
    'Reason for Pending': clean(r['Reason for Pending'] ?? r.ReasonForPending),
    'By which Date Connect': clean(r['By which Date Connect'] ?? r.ByWhichDateConnect),
    'Submitted Time': clean(r['Submitted Time'] ?? r.SubmittedTime ?? submittedAt || new Date().toISOString())
  };
}

module.exports = { headers, taskKey, feedbackKey, response, requireAdmin, getJSON, setJSON, clean, idOf, normalizeTask, normalizeFeedback };
