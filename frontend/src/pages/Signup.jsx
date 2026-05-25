import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', gender: '', password: '', confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        password: form.password,
      });
      setMessage('');
      navigate('/login?registered=true');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
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
        <h1 style={styles.heroText}>Manage your<br />team with ease.</h1>
        <p style={styles.heroSub}>A simple, powerful user management system built for modern teams.</p>
        <div style={styles.dots}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ ...styles.dot, opacity: 0.2 + i * 0.1 }} />
          ))}
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Fill in your details to get started</p>

          <div style={styles.form}>
            {/* Name */}
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrap}>
                <span style={styles.icon}>👤</span>
                <input
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.inputWrap}>
                <span style={styles.icon}>📞</span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={form.phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Gender */}
            <div style={styles.field}>
              <label style={styles.label}>Gender</label>
              <div style={styles.inputWrap}>
                <span style={styles.icon}>⚥</span>
                <select 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange} 
                  style={{ ...styles.input, background: '#1a1a2e', color: '#fff' }}
                >
                  <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>Select gender</option>
                  <option value="male" style={{ background: '#1a1a2e', color: '#fff' }}>Male</option>
                  <option value="female" style={{ background: '#1a1a2e', color: '#fff' }}>Female</option>
                  <option value="other" style={{ background: '#1a1a2e', color: '#fff' }}>Other</option>
                  <option value="prefer_not" style={{ background: '#1a1a2e', color: '#fff' }}>Prefer not to say</option>
              </select>
              </div>
            </div>

            {/* Password */}
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.icon}>🔒</span>
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                />
                <span style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.icon}>🔐</span>
                <input
                  name="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            {message && <div style={styles.error}>{message}</div>}

            <button onClick={handleSubmit} disabled={loading} style={styles.btn}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>

            <p style={styles.switchText}>
              Already have an account?{' '}
              <span style={styles.link} onClick={() => navigate('/login')}>Sign In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#0f0f1a' },
  left: { flex: 1, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  brand: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 },
  logo: { width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 },
  brandName: { color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: 1 },
  heroText: { color: '#fff', fontSize: 42, fontWeight: 800, lineHeight: 1.2, margin: '0 0 20px' },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.6, maxWidth: 320 },
  dots: { display: 'flex', gap: 8, marginTop: 60 },
  dot: { width: 10, height: 10, borderRadius: '50%', background: '#667eea' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' },
  card: { background: '#1a1a2e', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 440, border: '1px solid rgba(102,126,234,0.2)' },
  title: { color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 6px' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 28px' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 },
  inputWrap: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0 14px', gap: 10, transition: 'border 0.2s' },
  icon: { fontSize: 16, opacity: 0.6 },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '13px 0', width: '100%' },
  eyeBtn: { cursor: 'pointer', fontSize: 16, opacity: 0.6 },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  btn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'opacity 0.2s' },
  switchText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', margin: 0 },
  link: { color: '#667eea', cursor: 'pointer', fontWeight: 600 },
};
