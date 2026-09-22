import test from 'node:test';
import assert from 'node:assert/strict';

import { createApp, isDirectRun } from './index.js';
import { resolveSupabaseCredentials } from './database.js';

test('API exposes jobs and auth endpoints', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const response = await fetch(`http://localhost:${port}/api/health`);
    assert.equal(response.status, 200);

    const jobsResponse = await fetch(`http://localhost:${port}/api/jobs`);
    assert.equal(jobsResponse.status, 200);

    const body = await jobsResponse.json();
    assert.ok(Array.isArray(body));
  } finally {
    server.close();
  }
});

test('API exposes the active persistence mode', () => {
  const app = createApp();
  assert.equal(app.locals.dbProvider, 'memory');
});

test('Users can sign up and log in with arbitrary emails', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const signupResponse = await fetch(`http://localhost:${port}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Random User', email: 'random.user@example.com', password: 'StrongPass123', role: 'client' }),
    });

    assert.equal(signupResponse.status, 201);

    const loginResponse = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'random.user@example.com', password: 'StrongPass123' }),
    });

    assert.equal(loginResponse.status, 200);
    const user = await loginResponse.json();
    assert.equal(user.user.email, 'random.user@example.com');
  } finally {
    server.close();
  }
});

test('Direct server startup detection works with Windows and Unix path separators', () => {
  const currentFile = 'D:\\Meilluer 2\\2026\\Clients\\Mimi\\KaziLink\\server\\index.js';
  const linuxStyle = '/d/Meilluer 2/2026/Clients/Mimi/KaziLink/server/index.js';

  assert.equal(isDirectRun(currentFile), true);
  assert.equal(isDirectRun(linuxStyle), true);
  assert.equal(isDirectRun('D:\\other\\file.js'), false);
});

test('Production Supabase config prefers a real service-role key over the anon key', () => {
  const previous = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  try {
    process.env.SUPABASE_URL = 'https://project.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    const config = resolveSupabaseCredentials();
    assert.equal(config.url, 'https://project.supabase.co');
    assert.equal(config.key, 'service-role-key');
    assert.equal(config.serviceRoleKey, 'service-role-key');
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
});
