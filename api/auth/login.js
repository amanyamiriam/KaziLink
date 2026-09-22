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

async function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  const supabase = await getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.from('users').select('*').eq('email', normalized).maybeSingle();
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data ?? null;
  }

  return memoryUsers.get(normalized) ?? null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByEmail(normalizedEmail);

    if (!user || user.password_hash !== hashPassword(String(password || ''))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    return res.status(200).json({ user: toSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to log in.' });
  }
}
