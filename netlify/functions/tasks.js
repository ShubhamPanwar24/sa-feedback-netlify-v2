
import { headers, response, taskKey, getJSON } from './shared.js';
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  try {
    const rows = await getJSON(taskKey, []);
    const pending = rows.filter(r => String(r['Feedback Status'] || 'Pending').trim().toLowerCase() === 'pending');
    return response(200, { ok:true, rows: pending, total: pending.length });
  } catch (e) { return response(500, { ok:false, error:e.message, stack:String(e.stack||'') }); }
}
