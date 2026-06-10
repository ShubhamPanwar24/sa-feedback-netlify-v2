
import { headers, checkAdmin, store, feedbackKey } from './shared.js';
const cols = ['Cluster ID','HHID','PMAID','Work Order Number','SA Owner','Appointment Number','Reason for Pending','By which Date Connect','Submitted Time'];
function esc(v) { return '"' + String(v ?? '').replace(/"/g,'""') + '"'; }
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (!checkAdmin(event)) return { statusCode:401, headers, body: JSON.stringify({ok:false,error:'Invalid Admin PIN'}) };
  try {
    const rows = await store().get(feedbackKey, { type:'json' }) || [];
    const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => esc(r[c])).join(','))).join('\n');
    return { statusCode:200, headers: {'Access-Control-Allow-Origin':'*','Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="SA_Owner_Feedback.csv"'}, body: csv };
  } catch(e) { return { statusCode:500, headers, body: JSON.stringify({ok:false,error:e.message}) }; }
}
