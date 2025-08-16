/*
 Seed the running API via HTTP to ensure required data exists.
 Works with both real MongoDB and in-memory DB since it hits the API.
 Uses Node 18+ global fetch to avoid extra deps.
*/

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const email = process.env.SEED_USER_EMAIL || 'e2e_user@test.com';
const username = process.env.SEED_USER_NAME || 'e2e_user';
const password = process.env.SEED_USER_PASS || 'Password123!';

const defaults = [
  { name: 'Food', color: '#FF7043', icon: 'utensils' },
  { name: 'Transport', color: '#42A5F5', icon: 'car' },
  { name: 'Other', color: '#9E9E9E', icon: 'tag' },
];

async function http(method, url, body, headers = {}) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(data?.message || res.statusText);
  return data;
}

async function main() {
  try {
    // Register user, or login if exists
    let token;
    try {
      const reg = await http('POST', `${BASE}/api/users/register`, { username, email, password });
      token = reg.token;
    } catch (err) {
      const login = await http('POST', `${BASE}/api/users/login`, { email, password });
      token = login.token;
    }

    // Get categories and ensure defaults
    const list = await http('GET', `${BASE}/api/categories`, undefined, { Authorization: `Bearer ${token}` });
    const names = new Set(list.map((c) => c.name));
    for (const c of defaults) {
      if (!names.has(c.name)) {
        await http('POST', `${BASE}/api/categories`, c, { Authorization: `Bearer ${token}` });
      }
    }

    // eslint-disable-next-line no-console
    console.log('HTTP seed completed');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('HTTP seed failed', e.message);
    process.exit(1);
  }
}

main();
