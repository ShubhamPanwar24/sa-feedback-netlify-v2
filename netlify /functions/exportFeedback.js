const s = require('./shared.js');
var cols = ['Cluster ID','HHID','PMAID','Work Order Number','SA Owner','Appointment Number','Reason for Pending','By which Date Connect','Submitted Time'];
function csv(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') { return { statusCode: 204, headers: s.headers, body: '' }; }
  var auth = s.requireAdmin(event); if (auth) { return auth; }
  try {
    var rows = await s.getJSON(s.feedbackKey, []);
    var lines = [cols.join(',')];
    for (var i = 0; i < rows.length; i++) {
      var line = [];
      for (var c = 0; c < cols.length; c++) { line.push(csv(rows[i][cols[c]])); }
      lines.push(line.join(','));
    }
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="SA_Owner_Feedback.csv"' }, body: lines.join('\n') };
  } catch (e) { return s.response(500, { ok: false, error: e.message, stack: String(e.stack || '') }); }
};
