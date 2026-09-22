import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const hashPassword = (password) => crypto.createHash('sha256').update(String(password)).digest('hex');

const defaultJobs = [
  {
    id: 1,
    client_id: 1,
    title: 'Business Website Redesign',
    category: 'Web Development',
    budget: 'KSh 35,000 - 55,000',
    location: 'Nairobi',
    type: 'Remote',
    posted: '2 hours ago',
    description: 'Need a modern, responsive business website for a growing retail brand.',
    deadline: '14 days',
    applicants: 12,
    details: 'We need a clean landing page, service sections, contact form, and analytics integration for our growing business in Nairobi.',
  },
  {
    id: 2,
    client_id: 1,
    title: 'Social Media Manager for Restaurant',
    category: 'Social Media Management',
    budget: 'KSh 18,000 - 30,000',
    location: 'Mombasa',
    type: 'On-site',
    posted: '5 hours ago',
    description: 'We need content planning, ads support, and regular posting for 30 days.',
    deadline: '21 days',
    applicants: 8,
    details: 'The role includes weekly content ideas, branded captions, two reels per week, and basic engagement monitoring.',
  },
  {
    id: 3,
    client_id: 2,
    title: 'Plumber Needed for Kitchen Repair',
    category: 'Plumbing',
    budget: 'KSh 12,000 - 20,000',
    location: 'Kiambu',
    type: 'On-site',
    posted: '1 day ago',
    description: 'Fix leaking pipes, install a kitchen sink, and check mains pressure.',
    deadline: '3 days',
    applicants: 16,
    details: 'We need an experienced plumber to replace old piping and ensure all joints are watertight and compliant.',
  },
];

const defaultUsers = [
  {
    id: 1,
    name: 'Demo Client',
    email: 'demo@kazilink.co.ke',
    password_hash: hashPassword('demo123'),
    role: 'client',
  },
  {
    id: 2,
    name: 'Mercy Achieng',
    email: 'mercy@kazilink.co.ke',
    password_hash: hashPassword('mercy123'),
    role: 'freelancer',
  },
];

const memoryJobs = [...defaultJobs];
const memoryUsers = [...defaultUsers];

function resolveSupabaseCredentials() {
  const url = String(process.env.SUPABASE_URL || '').trim();
  const anonKey = String(process.env.SUPABASE_ANON_KEY || '').trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  const selectedKey = serviceRoleKey || anonKey;
  const validUrl = url && url.includes('supabase.co') && url !== 'https://your-project-ref.supabase.co';
  const validKey = selectedKey && selectedKey !== 'your-anon-key' && selectedKey !== 'your-service-role-key';

  return {
    url: validUrl ? url : '',
    key: validUrl && validKey ? selectedKey : '',
    anonKey,
    serviceRoleKey,
  };
}

function createMemoryStore() {
  return {
    provider: 'memory',
    async health() {
      return { status: 'ok' };
    },
    async listJobs() {
      return [...memoryJobs];
    },
    async getJobById(id) {
      return memoryJobs.find((job) => String(job.id) === String(id)) ?? null;
    },
    async createJob(input) {
      const clientId = input.client_id ?? memoryUsers[0]?.id ?? 1;
      const newJob = {
        id: Date.now(),
        client_id: clientId,
        title: input.title || 'New service request',
        category: input.category || 'General',
        budget: input.budget || 'KSh 10,000',
        location: input.location || 'Nairobi',
        type: input.type || 'Remote',
        posted: 'Just now',
        description: input.description || 'Project description pending.',
        deadline: input.deadline || '7 days',
        applicants: 0,
        details: input.description || 'Client is looking for a reliable professional.',
      };

      memoryJobs.unshift(newJob);
      return newJob;
    },
    async findUserByEmail(email) {
      const normalized = String(email || '').trim().toLowerCase();
      return memoryUsers.find((user) => user.email.toLowerCase() === normalized) ?? null;
    },
    async createUser(input) {
      const newUser = {
        id: Date.now(),
        name: String(input.name).trim(),
        email: String(input.email).trim().toLowerCase(),
        password_hash: hashPassword(String(input.password)),
        role: input.role || 'client',
      };

      memoryUsers.unshift(newUser);
      return newUser;
    },
  };
}

function createSupabaseStore() {
  const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseCredentials();

  if (!supabaseUrl || !supabaseKey) {
    return createMemoryStore();
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  return {
    provider: 'supabase',
    async health() {
      const { error } = await supabase.from('jobs').select('id', { count: 'exact', head: true });
      return { status: error ? 'degraded' : 'ok', error: error ? error.message : null };
    },
    async listJobs() {
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    async getJobById(id) {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', String(id)).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data ?? null;
    },
    async createJob(input) {
      const payload = {
        client_id: input.client_id,
        title: input.title || 'New service request',
        category: input.category || 'General',
        budget: input.budget || 'KSh 10,000',
        location: input.location || 'Nairobi',
        type: input.type || 'Remote',
        description: input.description || 'Project description pending.',
        deadline: input.deadline || '7 days',
        applicants: 0,
        details: input.description || 'Client is looking for a reliable professional.',
        posted: 'Just now',
      };

      if (!payload.client_id) {
        throw new Error('client_id is required when creating a job');
      }

      const { data, error } = await supabase.from('jobs').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async findUserByEmail(email) {
      const normalized = String(email || '').trim().toLowerCase();
      const { data, error } = await supabase.from('users').select('*').eq('email', normalized).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data ?? null;
    },
    async createUser(input) {
      const payload = {
        name: String(input.name).trim(),
        email: String(input.email).trim().toLowerCase(),
        password_hash: hashPassword(String(input.password)),
        role: input.role || 'client',
      };

      const { data, error } = await supabase.from('users').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
  };
}

function hasValidSupabaseConfig() {
  const credentials = resolveSupabaseCredentials();

  return (
    process.env.USE_SUPABASE === 'true' &&
    Boolean(credentials.url) &&
    Boolean(credentials.key)
  );
}

function createDatabaseStore() {
  return hasValidSupabaseConfig() ? createSupabaseStore() : createMemoryStore();
}

export {
  createDatabaseStore,
  createMemoryStore,
  createSupabaseStore,
  defaultJobs,
  defaultUsers,
  hashPassword,
  resolveSupabaseCredentials,
};
