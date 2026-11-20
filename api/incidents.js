// Reads the two published Google Sheet tabs (CSV), merges them, and returns JSON.
// Set INDIA_CSV_URL and GLOBAL_CSV_URL in Vercel > Project > Settings > Environment Variables.

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toObjects(csv, scope) {
  const rows = parseCSV(csv);
  if (rows.length < 2) return [];
  const head = rows[0].map((h) => h.trim());
  const out = [];
  for (const r of rows.slice(1)) {
    const o = {};
    head.forEach((h, i) => { o[h] = (r[i] || '').trim(); });
    if (!o.link || !o.title) continue; // drop blank rows
    o.scope = scope;
    out.push(o);
  }
  return out;
}

async function load(url, scope) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(scope + ' tab: HTTP ' + res.status);
  return toObjects(await res.text(), scope);
}

module.exports = async (req, res) => {
  const indiaUrl = process.env.INDIA_CSV_URL;
  const globalUrl = process.env.GLOBAL_CSV_URL;
  if (!indiaUrl || !globalUrl) {
    res.status(500).json({ error: 'INDIA_CSV_URL and GLOBAL_CSV_URL are not both set.' });
    return;
  }
  try {
    const [india, global] = await Promise.all([load(indiaUrl, 'India'), load(globalUrl, 'Global')]);
    const seen = new Set();
    const rows = [];
    for (const r of [...india, ...global]) { // India first, so it wins on a repeated link
      if (seen.has(r.link)) continue;
      seen.add(r.link);
      rows.push(r);
    }
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ updated: new Date().toISOString(), rows });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
};
