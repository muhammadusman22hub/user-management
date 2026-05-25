import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.search.includes('registered=true')) {
      setSuccess('Account created! Please sign in.');
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>U</div>
          <span style={styles.brandName}>UserHub</span>
        </div>
        <h1 style={styles.heroText}>Welcome<br />back! 👋</h1>
        <p style={styles.heroSub}>Sign in to access your dashboard and manage your account.</p>
        <div style={styles.statsRow}>
          {[['🔒', 'Secure JWT Auth'], ['⚡', 'Fast & Reliable'], ['🌍', 'Always Available']].map(([icon, label]) => (
            <div key={label} style={styles.statItem}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Enter your credentials to continue</p>

          {success && <div style={styles.successBox}>{success}</div>}

          <div style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <span style={styles.icon}>✉️</span>
                <input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Password</label>
                <span style={styles.forgotLink} onClick={() => navigate('/forgot-password')}>Forgot password?</span>
              </div>
              <div style={styles.inputWrap}>
                <span style={styles.icon}>🔒</span>
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                />
                <span style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {message && <div style={styles.error}>{message}</div>}

            <button onClick={handleSubmit} disabled={loading} style={styles.btn}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>

            <p style={styles.switchText}>
              Don't have an account?{' '}
              <span style={styles.link} onClick={() => navigate('/signup')}>Create one</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#0f0f1a' },
  left: { flex: 1, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  brand: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 },
  logo: { width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 },
  brandName: { color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: 1 },
  heroText: { color: '#fff', fontSize: 48, fontWeight: 800, lineHeight: 1.2, margin: '0 0 20px' },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.6, maxWidth: 320, margin: '0 0 50px' },
  statsRow: { display: 'flex', flexDirection: 'column', gap: 18 },
  statItem: { display: 'flex', alignItems: 'center', gap: 14 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
  card: { background: '#1a1a2e', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420, border: '1px solid rgba(102,126,234,0.2)' },
  title: { color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 6px' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' },
  successBox: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 },
  forgotLink: { color: '#667eea', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  inputWrap: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0 14px', gap: 10 },
  icon: { fontSize: 16, opacity: 0.6 },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '13px 0' },
  eyeBtn: { cursor: 'pointer', fontSize: 16, opacity: 0.6 },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  btn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  switchText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', margin: 0 },
  link: { color: '#667eea', cursor: 'pointer', fontWeight: 600 },
};
