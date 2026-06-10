
import { getStore } from '@netlify/blobs';
export const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-pin',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};
export const taskKey = 'current-pending-tasks.json';
export const feedbackKey = 'feedback-submissions.json';
export function response(statusCode, body, extraHeaders={}) {
  return { statusCode, headers: {...headers, ...extraHeaders}, body: typeof body === 'string' ? body : JSON.stringify(body) };
}
export function adminPinOk(event) {
  const expected = process.env.ADMIN_PIN || '1234';
  const pin = event.headers['x-admin-pin'] || event.headers['X-Admin-Pin'] || event.queryStringParameters?.pin || '';
  return String(pin) === String(expected);
}
export function requireAdmin(event) {
  if (!adminPinOk(event)) return response(401, { ok:false, error:'Invalid Admin PIN. Check Netlify Environment Variable ADMIN_PIN or use default 1234.' });
  return null;
}
export function store() { return getStore({ name: 'sa-owner-feedback-admin-pin-fixed', consistency: 'strong' }); }
export function clean(v) { return String(v ?? '').trim().replace(/\s+/g, ' '); }
export function idOf(r) { return clean(r['Appointment Number'] || r.AppointmentNumber || r['Work Order Number'] || r.WorkOrderNumber || `${r['Cluster ID']||r.ClusterID||''}|${r.PMAID||''}`); }
export function normalizeTask(r, batchDate='') {
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
export function normalizeFeedback(r, submittedAt='') {
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
