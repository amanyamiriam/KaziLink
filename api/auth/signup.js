import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const memoryUsers = globalThis.__KAZILINK_USERS__ ?? (globalThis.__KAZILINK_USERS__ = new Map());

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function toSafeUser(user) {
  if (!user) return null;
  const { password_hash, password, ...safeUser } = user;
  return safeUser;
}

async function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function createUserRecord(input) {
  const supabase = await getSupabaseClient();

  if (supabase) {
    const payload = {
      name: String(input.name).trim(),
      email: normalizeEmail(input.email),
      password_hash: hashPassword(String(input.password)),
      role: input.role || 'client',
    };

    const { data, error } = await supabase.from('users').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  const user = {
    id: Date.now(),
    name: String(input.name).trim(),
    email: normalizeEmail(input.email),
    password_hash: hashPassword(String(input.password)),
    role: input.role || 'client',
  };

  memoryUsers.set(user.email, user);
  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const { name, email, password, role } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const supabase = await getSupabaseClient();
    if (supabase) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', normalizedEmail).maybeSingle();
      if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists.' });
      }
    } else if (memoryUsers.has(normalizedEmail)) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const newUser = await createUserRecord({ name, email: normalizedEmail, password, role });
    return res.status(201).json({ user: toSafeUser(newUser) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to create account.' });
  }
}
