
import { headers, response, checkAdmin, store, taskKey, feedbackKey } from './shared.js';
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { ok:false, error:'POST required' });
  if (!checkAdmin(event)) return response(401, { ok:false, error:'Invalid Admin PIN' });
  try { const s=store(); await s.setJSON(taskKey, []); await s.setJSON(feedbackKey, []); return response(200, { ok:true, message:'All tasks and feedback cleared' }); }
  catch(e) { return response(500, { ok:false, error:e.message }); }
}
