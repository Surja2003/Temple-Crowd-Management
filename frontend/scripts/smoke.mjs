/*
  Quick API smoke test for FastAPI backend.
  Probes unauthenticated temple endpoints and optional auth flow.
*/

// Lightweight .env loader for ESM to support PowerShell and CI
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(filename) {
  try {
    const p = resolve(process.cwd(), filename);
    if (!existsSync(p)) return;
    const content = readFileSync(p, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {}
}

// Load .env files before reading env vars
loadEnvFile('.env');
loadEnvFile('.env.local');

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001').replace(/\/$/, '');

const fetchJson = async (path, init) => {
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, init);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: res.ok, status: res.status, url, data };
};

const slug = process.env.TEMPLE_SLUG || 'sri-ganesh-temple';

async function check(label, path) {
  const res = await fetchJson(path);
  const ok = res.ok ? 'OK' : 'FAIL';
  console.log(`${label.padEnd(28)} ${ok}  ${res.status}  ${res.url}`);
  if (!res.ok) {
    console.log('  Response:', typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
  }
}

async function main() {
  console.log('API base:', BASE);
  console.log('Temple slug:', slug);
  console.log('--- Temple endpoints ---');
  await check('temple info', `/api/temples/${slug}/info`);
  await check('queue live', `/api/temples/${slug}/queue/live`);
  await check('alerts', `/api/temples/${slug}/alerts`);
  await check('capacity state', `/api/temples/${slug}/capacity/state`);
  await check('capacity analytics', `/api/temples/${slug}/capacity/analytics?period=day`);

  if (process.env.SMOKE_AUTH === '1') {
    console.log('--- Auth flow ---');
    const creds = {
      email: process.env.SMOKE_USER || 'demo@example.com',
      password: process.env.SMOKE_PASS || 'password123',
    };
    const form = new URLSearchParams();
    form.set('username', creds.email);
    form.set('password', creds.password);
    const login = await fetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    console.log(`login`.padEnd(28), login.ok ? 'OK' : 'FAIL', login.status, login.url);
    const token = login.data && (login.data.access_token || login.data.token);
    if (token) {
      const me = await fetchJson('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      console.log(`me`.padEnd(28), me.ok ? 'OK' : 'FAIL', me.status, me.url);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
