import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { submitAuth } from './auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000');

const categories = [
  { name: 'Web Development', icon: '💻', jobs: '248 jobs' },
  { name: 'Graphic Design', icon: '🎨', jobs: '186 jobs' },
  { name: 'Writing', icon: '✍️', jobs: '144 jobs' },
  { name: 'Photography', icon: '📸', jobs: '92 jobs' },
  { name: 'Plumbing', icon: '🔧', jobs: '211 jobs' },
  { name: 'Electrical', icon: '⚡', jobs: '173 jobs' },
  { name: 'Cleaning', icon: '🧹', jobs: '121 jobs' },
  { name: 'Home Repairs', icon: '🏠', jobs: '167 jobs' },
];

const defaultJobs = [
  {
    id: 1,
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
    password: 'demo123',
    role: 'client',
  },
  {
    id: 2,
    name: 'Mercy Achieng',
    email: 'mercy@kazilink.co.ke',
    password: 'mercy123',
    role: 'freelancer',
  },
];

const defaultMessages = [
  { name: 'Mercy Achieng', preview: 'I can share the first concept draft today.', unread: 2, status: 'Online' },
  { name: 'James Wambua', preview: 'Thanks, the materials list is ready.', unread: 0, status: 'Offline' },
  { name: 'Grace M.', preview: 'Can we confirm the final payment milestone?', unread: 1, status: 'Online' },
];

const defaultNotifications = [
  { id: 1, text: 'Someone applied for your website redesign job.', time: '2h ago', type: 'application' },
  { id: 2, text: 'Your proposal was shortlisted for the branding brief.', time: '5h ago', type: 'shortlist' },
  { id: 3, text: 'A client sent you a new message about the homepage content.', time: '1d ago', type: 'message' },
  { id: 4, text: 'Payment received for the social media manager project.', time: '2d ago', type: 'payment' },
];

const defaultSavedJobs = [1, 3];

const marketplaceServices = [
  { title: 'Logo Design', provider: 'Miriam Creative', rating: 4.9, price: 'From KSh 3,000', description: 'Professional logo design for startups and SMEs.', accent: 'purple' },
  { title: 'Website Development', provider: 'John Mwangi', rating: 4.8, price: 'From KSh 25,000', description: 'Responsive business websites and landing pages.', accent: 'blue' },
  { title: 'Social Media Setup', provider: 'Nia Studio', rating: 4.9, price: 'From KSh 8,000', description: 'Branding, content planning and campaign setup.', accent: 'orange' },
  { title: 'Brand Strategy', provider: 'KibokoLabs', rating: 4.7, price: 'From KSh 12,000', description: 'Positioning, messaging and identity guidance.', accent: 'green' },
];

const defaultConversation = [
  { from: 'them', text: 'Hi! I can help with the website redesign. Can you share your preferred colors and content?' },
  { from: 'me', text: 'Yes, I want a modern tone with green and white branding. We can also add a contact form.' },
  { from: 'them', text: 'Perfect. I can send a concept mockup tomorrow morning.' },
  { from: 'me', text: 'Great, I will review it and share feedback.' },
];

const STORAGE_KEYS = {
  users: 'kazilink_users',
  jobs: 'kazilink_jobs',
  currentUser: 'kazilink_current_user',
  theme: 'kazilink_theme',
  messages: 'kazilink_messages',
};

const stats = [
  { value: '12k+', label: 'Jobs posted' },
  { value: '8.5k+', label: 'Active freelancers' },
  { value: '94%', label: 'Client satisfaction' },
  { value: 'KSh 320M+', label: 'Payments processed' },
];

const steps = [
  { number: '1', title: 'Post a job', text: 'Tell us what you need, your budget, and deadline.' },
  { number: '2', title: 'Review proposals', text: 'Compare trusted freelancers by skill, rating, and price.' },
  { number: '3', title: 'Pay securely', text: 'Use M-Pesa or escrow-backed terms for peace of mind.' },
  { number: '4', title: 'Get it done', text: 'Message, upload files, revise, and complete work.' },
];

const testimonials = [
  { quote: 'I hired a designer within a day. The job was done on time and the process was super smooth.', name: 'Grace M.', role: 'Business Owner' },
  { quote: 'KaziLink helped me find consistent paying clients without needing to pay a huge commission upfront.', name: 'Daniel K.', role: 'Freelancer' },
];

const topFreelancers = [
  {
    name: 'Mercy Achieng',
    role: 'Web Designer & Graphic Designer',
    rating: '4.9',
    jobs: '132',
    price: 'KSh 3,500/h',
    location: 'Nairobi, Kenya',
    specialty: 'UI/UX + branding',
    accent: 'purple',
    verified: true,
    availability: 'Available',
    verifiedSince: 'Jan 2024',
    emailVerified: true,
    phoneVerified: true,
    idVerified: true,
    skillVerified: true,
    businessVerified: true,
    reviews: 28,
  },
  {
    name: 'Kelvin Otieno',
    role: 'Photographer',
    rating: '4.8',
    jobs: '89',
    price: 'KSh 6,000/session',
    location: 'Kisumu',
    specialty: 'Events & product shots',
    accent: 'orange',
    verified: true,
    availability: 'Busy',
    verifiedSince: 'Mar 2024',
    emailVerified: true,
    phoneVerified: true,
    idVerified: true,
    skillVerified: true,
    businessVerified: false,
    reviews: 19,
  },
  {
    name: 'Lucy Njeri',
    role: 'Virtual Assistant',
    rating: '4.9',
    jobs: '204',
    price: 'KSh 2,200/h',
    location: 'Remote',
    specialty: 'Data entry & admin',
    accent: 'green',
    verified: true,
    availability: 'Available',
    verifiedSince: 'Jun 2023',
    emailVerified: true,
    phoneVerified: true,
    idVerified: true,
    skillVerified: true,
    businessVerified: true,
    reviews: 41,
  },
  {
    name: 'James Wambua',
    role: 'Electrician',
    rating: '4.7',
    jobs: '97',
    price: 'KSh 2,800/visit',
    location: 'Nairobi',
    specialty: 'Wiring & repairs',
    accent: 'blue',
    verified: true,
    availability: 'Not available',
    verifiedSince: 'Aug 2024',
    emailVerified: true,
    phoneVerified: true,
    idVerified: false,
    skillVerified: true,
    businessVerified: false,
    reviews: 14,
  },
];

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initialsFromName(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function App() {
  const [jobs, setJobs] = useState(() => readStorage(STORAGE_KEYS.jobs, defaultJobs));
  const [messages, setMessages] = useState(() => readStorage(STORAGE_KEYS.messages, defaultMessages));
  const [currentUser, setCurrentUser] = useState(() => readStorage(STORAGE_KEYS.currentUser, null));
  const [theme, setTheme] = useState(() => readStorage(STORAGE_KEYS.theme, 'light'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState(() => readStorage('kazilink_saved_jobs', defaultSavedJobs));
  const [notifications, setNotifications] = useState(() => readStorage('kazilink_notifications', defaultNotifications));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/jobs`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setJobs(data);
          writeStorage(STORAGE_KEYS.jobs, data);
        }
      })
      .catch(() => {
        // fall back to local storage data when backend is unavailable
      });
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.jobs, jobs);
  }, [jobs]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.messages, messages);
  }, [messages]);

  useEffect(() => {
    writeStorage('kazilink_saved_jobs', savedJobs);
  }, [savedJobs]);

  useEffect(() => {
    writeStorage('kazilink_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      writeStorage(STORAGE_KEYS.currentUser, currentUser);
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Incorrect email or password.' };
      }

      setCurrentUser(data.user);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, message: 'API unavailable. Please start the backend server.' };
    }
  };

  const handleSignup = async ({ name, email, password, role }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Unable to create account.' };
      }

      setCurrentUser(data.user);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, message: 'API unavailable. Please start the backend server.' };
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      const payload = {
        ...jobData,
        client_id: currentUser?.id,
      };

      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Unable to publish job.' };
      }

      setJobs((prev) => [data, ...prev]);
      navigate('/jobs');
      return { success: true };
    } catch (error) {
      return { success: false, message: 'API unavailable. Please start the backend server.' };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleSaveJob = (jobId) => {
    setSavedJobs((prev) => prev.includes(jobId)
      ? prev.filter((value) => value !== jobId)
      : [...prev, jobId]);
  };

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="page-shell">
        <header className="topbar">
          <div className="brand-wrap">
            <img src="/logo.png" alt="KaziLink logo" className="brand-mark" />
            <div>
              <span className="brand-name">KaziLink</span>
              <small className="brand-tag">Built for Kenya</small>
            </div>

            <button
              type="button"
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <div className={`header-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <nav className="main-nav" aria-label="Main navigation">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/jobs">Browse Jobs</NavLink>
              <NavLink to="/post-job">Post a Job</NavLink>
              <NavLink to="/freelancer-profile">Freelancer</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/messaging">Messaging</NavLink>
            </nav>

            <div className="actions">
              <button
                className="btn btn-ghost icon-btn"
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              {currentUser ? (
                <>
                  <span className="user-pill">Hi, {currentUser.name.split(' ')[0]}</span>
                  <button type="button" className="btn btn-ghost" onClick={handleLogout}>Log out</button>
                </>
              ) : (
                <Link className="btn btn-ghost" to="/auth">Log in</Link>
              )}
              <Link className="btn btn-primary" to="/post-job">Post a Job</Link>
            </div>
          </div>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage jobs={jobs} services={marketplaceServices} />} />
            <Route path="/auth" element={currentUser ? <Navigate to="/dashboard" replace /> : <AuthPage onLogin={handleLogin} onSignup={handleSignup} />} />
            <Route path="/jobs" element={<JobsPage jobs={jobs} savedJobs={savedJobs} onSaveJob={handleSaveJob} />} />
            <Route path="/job-details/:id" element={<JobDetailsPage jobs={jobs} savedJobs={savedJobs} onSaveJob={handleSaveJob} />} />
            <Route path="/job-details" element={<Navigate to={`/job-details/${jobs[0]?.id ?? 1}`} replace />} />
            <Route path="/post-job" element={currentUser ? <PostJobPage onCreateJob={handleCreateJob} /> : <Navigate to="/auth" replace />} />
            <Route path="/freelancer-profile" element={<FreelancerProfilePage />} />
            <Route path="/dashboard" element={currentUser ? <DashboardPage jobs={jobs} currentUser={currentUser} notifications={notifications} /> : <Navigate to="/auth" replace />} />
            <Route path="/messaging" element={currentUser ? <MessagingPage messages={messages} currentUser={currentUser} /> : <Navigate to="/auth" replace />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <div>
            <span className="brand-name">KaziLink</span>
            <p>Built for Kenya’s clients and freelancers.</p>
          </div>
          <div className="footer-links">
            <Link to="/jobs">Jobs</Link>
            <Link to="/post-job">Post a Job</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const result = await submitAuth(mode, mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password, role: form.role },
      { onLogin, onSignup }
    );

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <section className="page-section auth-page">
      <div className="auth-card">
        <div className="auth-copy">
          <span className="eyebrow">Welcome to KaziLink</span>
          <h2>{mode === 'login' ? 'Log in to your account' : 'Create your KaziLink account'}</h2>
          <p>Find trusted work, post jobs, and manage projects with secure M-Pesa-friendly payment flows.</p>
          <div className="demo-box">
            <strong>Use any email</strong>
            <p>Create a new account or sign in with your own email and password.</p>
            <p>Demo access: demo@kazilink.co.ke / demo123</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="switch-row">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button>
            <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign up</button>
          </div>

          {mode === 'signup' && (
            <div className="field">
              <label>Full name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>

          <div className="field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
          </div>

          {mode === 'signup' && (
            <div className="field">
              <label>I am a</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="btn btn-primary full-width">
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </section>
  );
}

function HomePage({ jobs, services }) {
  return (
    <>
      <section className="hero section">
        <div className="hero-copy">
          <span className="eyebrow">Post it. Find the right person. Get it done.</span>
          <h1>Reliable jobs and trusted talent across Kenya.</h1>
          <p>
            From website design and plumbing to events, tutoring, and home repairs, KaziLink helps clients and freelancers connect fast.
          </p>

          <div className="search-box" aria-label="Search jobs">
            <span className="search-icon">⌕</span>
            <input type="text" value="What do you need done?" readOnly />
            <Link className="btn btn-primary" to="/jobs">Search</Link>
          </div>

          <div className="cta-row">
            <Link className="btn btn-primary large" to="/post-job">Post a Job</Link>
            <Link className="btn btn-secondary large" to="/auth">Become a Freelancer</Link>
          </div>

          <div className="trust-row">
            <span>✅ M-Pesa ready</span>
            <span>✅ Nairobi + counties</span>
            <span>✅ Verified profiles</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="mini-card card-featured">
            <div className="card-head">
              <span className="dot green" />
              <span>Featured job</span>
            </div>
            <h3>{jobs[0]?.title || 'Website Designer Needed'}</h3>
            <div className="meta-row">
              <span>{jobs[0]?.location || 'Nairobi'} / Remote</span>
              <span>Budget: {jobs[0]?.budget || 'KSh 40,000'}</span>
            </div>
            <div className="proposal-box">
              <strong>{jobs[0]?.applicants || 12} proposals</strong>
              <small>Posted {jobs[0]?.posted || '2 hours ago'}</small>
            </div>
          </div>

          <div className="mini-card freelancer-card">
            <div className="avatar">MA</div>
            <div>
              <h4>Mercy Achieng</h4>
              <p>Web Designer • 4.9 ★</p>
            </div>
            <Link className="btn btn-primary small" to="/freelancer-profile">Hire Me</Link>
          </div>
        </div>
      </section>

      <section className="stats section">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-box">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section id="categories" className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Popular categories</span>
            <h2>Find the right skill for the job</h2>
          </div>
          <Link className="btn btn-ghost" to="/jobs">Browse all</Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <article key={category.name} className="category-card">
              <span className="category-icon">{category.icon}</span>
              <h3>{category.name}</h3>
              <p>{category.jobs}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section trust-section">
        <div className="section-heading center">
          <span className="eyebrow">Why KaziLink?</span>
          <h2>Built to feel trustworthy, commercial, and scalable</h2>
        </div>

        <div className="trust-grid">
          <div className="trust-panel">
            <h3>✓ Verified professionals</h3>
            <p>Phone, email and profile verification help clients hire with more confidence.</p>
          </div>
          <div className="trust-panel">
            <h3>✓ Local & remote</h3>
            <p>Hire someone in Nairobi or work with remote specialists across Kenya.</p>
          </div>
          <div className="trust-panel">
            <h3>✓ Transparent pricing</h3>
            <p>Costs, fees and milestones are visible before work starts.</p>
          </div>
          <div className="trust-panel">
            <h3>✓ Secure communication</h3>
            <p>Projects and conversations stay inside the platform until the work is approved.</p>
          </div>
        </div>
      </section>

      <section id="jobs" className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Featured jobs</span>
            <h2>Fresh opportunities near you</h2>
          </div>
          <Link className="btn btn-ghost" to="/jobs">Browse jobs</Link>
        </div>

        <div className="jobs-grid">
          {jobs.map((job) => (
            <article key={job.id} className="job-card">
              <div className="job-topline">
                <span className="tag">{job.category}</span>
                <span className="tag soft">{job.type}</span>
              </div>
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <div className="job-meta">
                <span>📍 {job.location}</span>
                <span>💰 {job.budget}</span>
              </div>
              <div className="job-footer">
                <small>{job.posted}</small>
                <Link className="btn btn-primary small" to={`/job-details/${job.id}`}>Apply</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section marketplace-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Services marketplace</span>
            <h2>Browse services, not just jobs</h2>
          </div>
          <Link className="btn btn-ghost" to="/jobs">View marketplace</Link>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <article key={service.title} className={`service-card ${service.accent}`}>
              <div className="service-top">
                <span className="service-badge">Service</span>
                <span className="service-rating">⭐ {service.rating}</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.provider}</p>
              <small>{service.description}</small>
              <div className="service-bottom">
                <strong>{service.price}</strong>
                <button type="button" className="btn btn-primary small">View Service</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="section">
        <div className="section-heading center">
          <span className="eyebrow">How KaziLink works</span>
          <h2>Simple, transparent, and built for real work</h2>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.number} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Top freelancers</span>
            <h2>Trusted professionals ready to work</h2>
          </div>
          <Link className="btn btn-ghost" to="/freelancer-profile">View all</Link>
        </div>

        <div className="freelancers-grid">
          {topFreelancers.map((person) => (
            <article key={person.name} className={`freelancer-card ${person.accent}`}>
              <div className="avatar big">{initialsFromName(person.name)}</div>
              <h3>{person.name}</h3>
              <p className="role">{person.role}</p>
              <p className="specialty">{person.specialty}</p>
              <div className="mini-stats">
                <span>⭐ {person.rating}</span>
                <span>{person.jobs} jobs</span>
              </div>
              <div className="bottom-row">
                <span>{person.location}</span>
                <strong>{person.price}</strong>
              </div>
              <Link className="btn btn-primary small full" to="/freelancer-profile">Hire Me</Link>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="section pricing-section">
        <div className="section-heading center">
          <span className="eyebrow">Business model</span>
          <h2>Simple fees for a reliable marketplace</h2>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Freelancer Premium</h3>
            <div className="price">KSh 2,500<span>/month</span></div>
            <ul>
              <li>Featured profile placement</li>
              <li>More job applications</li>
              <li>Better visibility</li>
              <li>Portfolio promotion</li>
            </ul>
            <button className="btn btn-primary" type="button">Join Premium</button>
          </div>

          <div className="pricing-card highlight">
            <h3>Typical platform fee</h3>
            <div className="price">10%<span>per job</span></div>
            <ul>
              <li>Example: KSh 20,000 job</li>
              <li>Platform fee: KSh 2,000</li>
              <li>Freelancer receives: KSh 18,000</li>
              <li>Powered by secure payments</li>
            </ul>
            <button className="btn btn-secondary" type="button">Learn more</button>
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="section-heading center">
          <span className="eyebrow">Client stories</span>
          <h2>People use KaziLink every day</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((person) => (
            <blockquote key={person.name} className="testimonial-card">
              <p>“{person.quote}”</p>
              <footer>
                <strong>{person.name}</strong>
                <span>{person.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}

function JobsPage({ jobs, savedJobs, onSaveJob }) {
  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <span className="eyebrow">Browse jobs</span>
          <h2>Find work that matches your needs</h2>
        </div>
        <Link className="btn btn-primary" to="/post-job">Post a Job</Link>
      </div>

      <div className="filter-panel">
        <div className="filter-group">
          <label>Category</label>
          <select defaultValue="Web Development">
            <option>Web Development</option>
            <option>Graphic Design</option>
            <option>Plumbing</option>
            <option>Cleaning</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Location</label>
          <select defaultValue="Nairobi">
            <option>Nairobi</option>
            <option>Mombasa</option>
            <option>Kiambu</option>
            <option>Remote</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Budget</label>
          <select defaultValue="KSh 30,000+">
            <option>KSh 30,000+</option>
            <option>KSh 10,000 - 30,000</option>
            <option>KSh 5,000 - 10,000</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Type</label>
          <select defaultValue="Remote / On-site">
            <option>Remote / On-site</option>
            <option>Remote</option>
            <option>On-site</option>
          </select>
        </div>
      </div>

      <div className="status-legend">
        <span><em className="status-dot open" /> Open</span>
        <span><em className="status-dot reviewing" /> Reviewing</span>
        <span><em className="status-dot hired" /> Hired</span>
        <span><em className="status-dot completed" /> Completed</span>
      </div>

      <div className="jobs-grid jobs-page-grid">
        {jobs.map((job) => (
          <article key={job.id} className="job-card detail-card">
            <div className="job-topline">
              <span className="tag">{job.category}</span>
              <span className="tag soft">{job.type}</span>
            </div>
            <div className="job-status-row">
              <span className={`job-status ${job.status || 'open'}`}>{job.status || 'Open'}</span>
              <button type="button" className="save-button" onClick={() => onSaveJob(job.id)}>
                {savedJobs.includes(job.id) ? '♥ Saved' : '♡ Save'}
              </button>
            </div>
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <div className="job-meta">
              <span>📍 {job.location}</span>
              <span>💰 {job.budget}</span>
              <span>⏳ Deadline: {job.deadline}</span>
            </div>
            <div className="job-footer">
              <small>{job.posted}</small>
              <Link className="btn btn-primary small" to={`/job-details/${job.id}`}>View details</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function JobDetailsPage({ jobs, savedJobs, onSaveJob }) {
  const routeId = window.location.pathname.split('/').pop();
  const jobId = routeId && routeId !== 'job-details' ? routeId : jobs[0]?.id;
  const job = jobs.find((entry) => String(entry.id) === String(jobId)) || jobs[0];

  if (!job) {
    return <Navigate to="/jobs" replace />;
  }

  return (
    <section className="page-section">
      <div className="job-details-layout">
        <div className="detail-panel">
          <div className="page-header compact">
            <div>
              <span className="eyebrow">Job details</span>
              <h2>{job.title}</h2>
            </div>
            <span className="tag soft">{job.type}</span>
          </div>

          <div className="meta-row big-meta">
            <span>📍 {job.location}</span>
            <span>💰 {job.budget}</span>
            <span>🕒 Posted {job.posted}</span>
          </div>

          <div className="detail-copy">
            <h3>Project summary</h3>
            <p>{job.details}</p>
            <ul>
              <li>Modern responsive layout</li>
              <li>Service sections and contact form</li>
              <li>SEO-friendly structure</li>
              <li>Mobile-first design</li>
            </ul>
          </div>

          <div className="detail-actions">
            <button className="btn btn-primary" type="button">Apply for Job</button>
            <button className="btn btn-ghost" type="button" onClick={() => onSaveJob(job.id)}>
              {savedJobs.includes(job.id) ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="proposal-panel">
            <h3>Submit proposal</h3>
            <div className="proposal-form-grid">
              <div className="field">
                <label>Proposal</label>
                <textarea rows="3" defaultValue="I can design your business website within 10 days." />
              </div>
              <div className="field">
                <label>My price</label>
                <input type="text" defaultValue="KSh 35,000" />
              </div>
              <div className="field">
                <label>Delivery</label>
                <input type="text" defaultValue="10 days" />
              </div>
              <div className="field">
                <label>Revisions</label>
                <input type="text" defaultValue="3" />
              </div>
            </div>
            <div className="field">
              <label>Message</label>
              <textarea rows="3" defaultValue="I can share a clear timeline, examples and updates throughout the project." />
            </div>
            <div className="proposal-actions">
              <button className="btn btn-primary" type="button">Submit proposal</button>
              <button className="btn btn-ghost" type="button">Shortlist later</button>
            </div>
          </div>
        </div>

        <aside className="side-panel">
          <div className="mini-card stats-card">
            <h3>Job Snapshot</h3>
            <div className="snapshot-row">
              <span>Category</span>
              <strong>{job.category}</strong>
            </div>
            <div className="snapshot-row">
              <span>Budget</span>
              <strong>{job.budget}</strong>
            </div>
            <div className="snapshot-row">
              <span>Deadline</span>
              <strong>{job.deadline}</strong>
            </div>
            <div className="snapshot-row">
              <span>Applicants</span>
              <strong>{job.applicants}</strong>
            </div>
            <div className="snapshot-row">
              <span>Status</span>
              <strong>{job.status || 'Open'}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PostJobPage({ onCreateJob }) {
  const [form, setForm] = useState({
    title: 'I need a business website',
    category: 'Web Development',
    description: 'I need a modern website for my small business. The site should be mobile-friendly and include a contact form, pricing section, and portfolio gallery.',
    budget: 'KSh 30,000–50,000',
    location: 'Nairobi',
    deadline: '14 days',
    type: 'Remote / On-site',
  });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onCreateJob(form);
  };

  return (
    <section className="page-section narrow-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Post a job</span>
          <h2>Tell us what you need done</h2>
        </div>
      </div>

      <form className="job-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label>Job title</label>
            <input name="title" type="text" value={form.title} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option>Web Development</option>
              <option>Graphic Design</option>
              <option>Writing & Proofreading</option>
              <option>Plumbing</option>
              <option>Cleaning</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea name="description" rows="5" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Budget</label>
            <input name="budget" type="text" value={form.budget} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Location</label>
            <input name="location" type="text" value={form.location} onChange={handleChange} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Deadline</label>
            <input name="deadline" type="text" value={form.deadline} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Job type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option>Remote / On-site</option>
              <option>Remote</option>
              <option>On-site</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost">Save draft</button>
          <button type="submit" className="btn btn-primary">Publish job</button>
        </div>
      </form>
    </section>
  );
}

function FreelancerProfilePage() {
  const freelancer = topFreelancers[0];

  return (
    <section className="page-section profile-layout">
      <div className="profile-card">
        <div className="profile-hero">
          <div className="avatar mega">MA</div>
          <div>
            <span className="eyebrow">Freelancer profile</span>
            <h2>{freelancer.name} <span className="verified-mark">✓ Verified</span></h2>
            <p>{freelancer.role}</p>
          </div>
          <button className="btn btn-primary" type="button">Hire Me</button>
        </div>

        <div className="profile-metrics">
          <div><strong>4.9/5</strong><span>Rating</span></div>
          <div><strong>132</strong><span>Jobs completed</span></div>
          <div><strong>7 years</strong><span>Experience</span></div>
          <div><strong>KSh 3,500/h</strong><span>Starting price</span></div>
        </div>

        <div className="verification-list">
          <span className="verification-pill">📞 Verified phone</span>
          <span className="verification-pill">✉️ Verified email</span>
          <span className="verification-pill">🪪 ID verified</span>
          <span className="verification-pill">✅ Profile verified</span>
          <span className="verification-pill">🎯 Skill verification</span>
          <span className="verification-pill">🏢 Business verification</span>
          <span className="verification-pill">📅 Verified since {freelancer.verifiedSince}</span>
        </div>

        <div className="profile-details-grid">
          <div className="detail-panel">
            <h3>About</h3>
            <p>
              I design clean, conversion-focused websites for SMEs and startups in Kenya. From brand strategy to responsive UI, I help businesses launch with clarity and confidence.
            </p>
          </div>
          <div className="detail-panel">
            <h3>Availability</h3>
            <p className={`availability-badge ${freelancer.availability.toLowerCase().replace(/\s+/g, '-')}`}>
              {freelancer.availability === 'Available' ? '🟢 Available' : freelancer.availability === 'Busy' ? '🟡 Busy' : '🔴 Not available'}
            </p>
            <div className="portfolio-pills">
              <span>Brand identity</span>
              <span>E-commerce</span>
              <span>Landing pages</span>
              <span>UI systems</span>
            </div>
          </div>
        </div>

        <div className="review-block">
          <h3>Client reviews</h3>
          <div className="review-item">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>“Very professional and delivered before the deadline.”</p>
            <div className="review-metrics">
              <span>Quality: 5/5</span>
              <span>Communication: 5/5</span>
              <span>Timeliness: 5/5</span>
              <span>Professionalism: 5/5</span>
            </div>
          </div>
        </div>
      </div>

      <aside className="side-panel">
        <div className="mini-card stats-card">
          <h3>Profile details</h3>
          <div className="snapshot-row"><span>Location</span><strong>{freelancer.location}</strong></div>
          <div className="snapshot-row"><span>Skills</span><strong>UI/UX, Web, Brand</strong></div>
          <div className="snapshot-row"><span>Reviews</span><strong>{freelancer.reviews} positive</strong></div>
          <div className="snapshot-row"><span>Response time</span><strong>Within 1 hour</strong></div>
          <div className="snapshot-row"><span>WhatsApp</span><strong>Chat on WhatsApp</strong></div>
        </div>
      </aside>
    </section>
  );
}

function DashboardPage({ jobs, currentUser, notifications }) {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.applicants > 0).length;
  const isAdmin = currentUser?.email === 'admin@kazilink.co.ke';

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h2>{currentUser.role === 'freelancer' ? 'Freelancer overview' : 'Client overview'}</h2>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="summary-card">
          <strong>{currentUser.role === 'freelancer' ? 'Open jobs' : 'My Jobs'}</strong>
          <span>{totalJobs} active</span>
        </div>
        <div className="summary-card">
          <strong>Applications</strong>
          <span>{Math.max(14, totalJobs * 3)} sent</span>
        </div>
        <div className="summary-card">
          <strong>Active Projects</strong>
          <span>{activeJobs} running</span>
        </div>
        <div className="summary-card">
          <strong>Payments</strong>
          <span>KSh 168,500 this month</span>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="detail-panel">
          <h3>Recent activity</h3>
          <ul className="activity-list">
            <li>Website redesign proposal received from Mercy Achieng</li>
            <li>Plumbing job was marked as completed</li>
            <li>Payment for social media campaign confirmed</li>
            <li>New design brief received from a Nairobi business</li>
          </ul>
        </div>

        <div className="detail-panel">
          <h3>Notifications 🔔</h3>
          <div className="notification-list">
            {notifications.map((item) => (
              <div key={item.id} className="notification-item">
                <span className={`notification-dot ${item.type}`} />
                <div>
                  <strong>{item.text}</strong>
                  <small>{item.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="detail-panel">
          <h3>{currentUser.role === 'freelancer' ? 'Freelancer tools' : 'Client tools'}</h3>
          <div className="mini-progress-list">
            <div className="progress-item">
              <div className="progress-head"><span>Find Jobs</span><strong>82%</strong></div>
              <div className="progress-bar"><span style={{ width: '82%' }} /></div>
            </div>
            <div className="progress-item">
              <div className="progress-head"><span>My Applications</span><strong>64%</strong></div>
              <div className="progress-bar"><span style={{ width: '64%' }} /></div>
            </div>
            <div className="progress-item">
              <div className="progress-head"><span>Active Projects</span><strong>91%</strong></div>
              <div className="progress-bar"><span style={{ width: '91%' }} /></div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="detail-panel admin-panel">
            <h3>Admin controls</h3>
            <ul className="activity-list">
              <li>Verify freelancer profiles</li>
              <li>Review dispute tickets</li>
              <li>Approve featured jobs</li>
              <li>Review platform fees and escrow activity</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function MessagingPage({ messages, currentUser }) {
  const activeMessages = messages.length ? messages : defaultMessages;

  return (
    <section className="page-section messaging-layout">
      <aside className="message-list-panel">
        <h3>Messages</h3>
        {activeMessages.map((item) => (
          <div key={item.name} className="message-item">
            <div className="message-avatar">{initialsFromName(item.name)}</div>
            <div className="message-copy">
              <div className="message-head">
                <strong>{item.name}</strong>
                <span>{item.status}</span>
              </div>
              <p>{item.preview}</p>
            </div>
            {item.unread > 0 && <span className="unread-badge">{item.unread}</span>}
          </div>
        ))}
      </aside>

      <div className="conversation-panel">
        <div className="conversation-header">
          <h3>Mercy Achieng</h3>
          <span>Online</span>
        </div>

        <div className="conversation-body">
          {defaultConversation.map((entry, index) => (
            <div key={index} className={`bubble ${entry.from === 'me' ? 'outgoing' : 'incoming'}`}>
              {entry.text}
            </div>
          ))}
        </div>

        <div className="composer">
          <input type="text" defaultValue={currentUser ? `Hi ${currentUser.name.split(' ')[0]}, send a quick update...` : 'Type your message...'} />
          <button className="btn btn-primary" type="button">Send</button>
        </div>
      </div>
    </section>
  );
}

export default App;
