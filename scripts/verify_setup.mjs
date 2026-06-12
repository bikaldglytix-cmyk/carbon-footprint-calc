// Verifies the Supabase setup after running setup_public_access.sql.
//   node scripts/verify_setup.mjs
//
// Checks, using the public (anon) key exactly like the live site does:
//   1. get_public_stats() RPC works            → mission tracker counter
//   2. get_recent_activity() RPC works         → live toasts
//   3. anon can INSERT a 'general' row         → quiz completions reach the DB
//   4. anon can UPDATE it to 'pending'         → report-request flow works
//   5. anon can NOT promote it to 'verified'   → security still intact
//
// The test row is named ZZ_SETUP_TEST so you can spot and delete it in the
// admin panel (All Users tab) afterwards — anon clients cannot delete rows.
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
);

const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const HEADERS = {
  apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

let pass = 0, fail = 0;
const report = (ok, label, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  ok ? pass++ : fail++;
};

// 1. Stats RPC
let res = await fetch(`${BASE}/rest/v1/rpc/get_public_stats`, { method: 'POST', headers: HEADERS, body: '{}' });
let body = await res.text();
report(res.ok && body.includes('verified_reports'), 'get_public_stats()', res.ok ? body : `HTTP ${res.status} ${body.slice(0, 120)}`);

// 2. Activity RPC
res = await fetch(`${BASE}/rest/v1/rpc/get_recent_activity`, { method: 'POST', headers: HEADERS, body: '{}' });
body = await res.text();
report(res.ok, 'get_recent_activity()', res.ok ? `${JSON.parse(body).length} rows` : `HTTP ${res.status} ${body.slice(0, 120)}`);

// 3. Insert a quiz-completion ('general') row
res = await fetch(`${BASE}/rest/v1/calculator_submissions`, {
  method: 'POST',
  headers: { ...HEADERS, Prefer: 'return=representation' },
  body: JSON.stringify([{
    name: 'ZZ_SETUP_TEST', email: 'setup@test.local', location: 'Hilly',
    total_emissions: 1.1, breakdown_home: 0.3, breakdown_transport: 0.3,
    breakdown_food: 0.3, breakdown_goods: 0.2, answers_data: { GQ1: 'hilly' },
    payment_status: 'general',
  }]),
});
body = await res.text();
let id = null;
try { id = JSON.parse(body)?.[0]?.id ?? null; } catch {}
report(!!id, "anon INSERT payment_status='general'", id ? `row id ${id}` : `HTTP ${res.status} ${body.slice(0, 140)}`);

if (id) {
  // 4. Upgrade it to a report request ('pending') with payment details
  res = await fetch(`${BASE}/rest/v1/calculator_submissions?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify({ phone: '9800000000', payment_method: 'international', currency: 'USD', amount: 5, account_name: 'Setup Test', payment_status: 'pending' }),
  });
  body = await res.text();
  report(res.ok && body.includes('pending'), "anon UPDATE general → pending", res.ok ? '' : `HTTP ${res.status} ${body.slice(0, 140)}`);

  // 5. Try to self-verify — must be REJECTED
  res = await fetch(`${BASE}/rest/v1/calculator_submissions?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify({ payment_status: 'verified' }),
  });
  body = await res.text();
  const rejected = !res.ok || !body.includes('"verified"');
  report(rejected, 'anon CANNOT self-verify a payment', rejected ? '' : 'SECURITY HOLE: anon set verified!');

  console.log(`\nNote: delete the ZZ_SETUP_TEST row from the admin panel (All Users tab).`);
}

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
