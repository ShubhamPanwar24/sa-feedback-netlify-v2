
import { headers, response, requireAdmin, taskKey, feedbackKey, setJSON } from './shared.js';
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return response(405, { ok:false, error:'POST required' });
  const auth = requireAdmin(event); if (auth) return auth;
  try { await setJSON(taskKey, []); await setJSON(feedbackKey, []); return response(200, { ok:true, message:'All tasks and feedback cleared' }); }
  catch(e) { return response(500, { ok:false, error:e.message, stack:String(e.stack||'') }); }
}
