import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createDatabaseStore, defaultJobs, defaultUsers, hashPassword } from './database.js';

dotenv.config();

function createApp() {
  const app = express();
  const db = createDatabaseStore();

  app.locals.dbProvider = db.provider;

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', async (req, res) => {
    try {
      const health = await db.health();
      res.json({ status: 'ok', app: 'KaziLink API', database: db.provider, ...health });
    } catch (error) {
      res.json({ status: 'ok', app: 'KaziLink API', database: db.provider });
    }
  });

  app.get('/api/jobs', async (req, res) => {
    try {
      const jobs = await db.listJobs();
      return res.json(jobs);
    } catch (error) {
      return res.status(500).json({ message: 'Unable to load jobs.' });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await db.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      return res.json(job);
    } catch (error) {
      return res.status(500).json({ message: 'Unable to fetch job.' });
    }
  });

  app.post('/api/jobs', async (req, res) => {
    try {
      const { client_id, title, category, description, budget, location, deadline, type } = req.body || {};
      const newJob = await db.createJob({
        client_id,
        title,
        category,
        description,
        budget,
        location,
        deadline,
        type,
      });

      return res.status(201).json(newJob);
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Unable to create job.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const matchedUser = await db.findUserByEmail(String(email || ''));

      if (!matchedUser || matchedUser.password_hash !== hashPassword(String(password || ''))) {
        return res.status(401).json({ message: 'Incorrect email or password.' });
      }

      const safeUser = { ...matchedUser, password_hash: undefined, password: undefined };
      return res.json({ user: safeUser });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to log in.' });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password, role } = req.body || {};
      const normalizedEmail = String(email || '').trim().toLowerCase();

      if (!name || !normalizedEmail || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      const existing = await db.findUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(409).json({ message: 'An account with that email already exists.' });
      }

      const newUser = await db.createUser({
        name: String(name).trim(),
        email: normalizedEmail,
        password: String(password),
        role: role || 'client',
      });

      const safeUser = { ...newUser, password_hash: undefined, password: undefined };
      return res.status(201).json({ user: safeUser });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to create account.' });
    }
  });

  return app;
}

const app = createApp();
const port = process.env.PORT || 4000;

function normalizeScriptPath(value) {
  if (!value) return '';

  let normalized = String(value)
    .replace(/^file:\/\//i, '')
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/');

  if (/^\/[a-zA-Z]\//.test(normalized)) {
    normalized = normalized.replace(/^\/([a-zA-Z])\//, '$1:/');
  }

  return normalized.toLowerCase();
}

function isDirectRun(entryPoint = process.argv[1], currentFile = fileURLToPath(import.meta.url)) {
  if (!entryPoint) return false;

  const normalizedEntry = normalizeScriptPath(entryPoint);
  const normalizedCurrent = normalizeScriptPath(currentFile);

  return (
    normalizedEntry === normalizedCurrent ||
    normalizedEntry.endsWith('/server/index.js') && normalizedCurrent.endsWith('/server/index.js')
  );
}

if (isDirectRun()) {
  app.listen(port, () => {
    console.log(`KaziLink API running on http://localhost:${port} using ${app.locals.dbProvider} storage`);
  });
}

export { createApp, defaultJobs, defaultUsers, isDirectRun };
