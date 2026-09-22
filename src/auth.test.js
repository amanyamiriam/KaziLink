import test from 'node:test';
import assert from 'node:assert/strict';

import { submitAuth } from './auth.js';

test('submitAuth resolves async login results before reporting success', async () => {
  const result = await submitAuth('login', { email: 'demo@kazilink.co.ke', password: 'demo123' }, {
    onLogin: async () => ({ success: true }),
    onSignup: async () => ({ success: true }),
  });

  assert.deepEqual(result, { success: true });
});

test('submitAuth surfaces async auth errors', async () => {
  const result = await submitAuth('signup', { name: 'Test User', email: 'test@example.com', password: 'pw' }, {
    onLogin: async () => ({ success: true }),
    onSignup: async () => ({ success: false, message: 'Email already exists' }),
  });

  assert.deepEqual(result, { success: false, message: 'Email already exists' });
});
