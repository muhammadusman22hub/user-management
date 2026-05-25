import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        setUser(res.data);
        setForm({ name: res.data.name, email: res.data.email, phone: res.data.phone || '', gender: res.data.gender || '' });
      })
      .catch(() => navigate('/login'));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdate = async () => {
    try {
      await api.put('/users/profile', form);
      setUser({ ...user, ...form });
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This will permanently delete your account.')) {
      await api.delete('/users/profile');
      localStorage.removeItem('token');
      navigate('/signup');
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const getJoinedDate = () => user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  if (!user) return (
    <div style={{ ...styles.page, alignItems: 'center', justifyContent: 'center' }}>
      <div style={styles.loader}>Loading...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logo}>U</div>
          <span style={styles.brandName}>UserHub</span>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'overview', icon: '🏠', label: 'Overview' },
            { id: 'profile', icon: '👤', label: 'My Profile' },
            { id: 'security', icon: '🔒', label: 'Security' },
          ].map(tab => (
            <div
              key={tab.id}
              style={{ ...styles.navItem, ...(activeTab === tab.id ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userMini}>
            <div style={styles.avatarSmall}>{getInitials(user.name)}</div>
            <div>
              <div style={styles.userMiniName}>{user.name}</div>
              <div style={styles.userMiniEmail}>{user.email}</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>🚪 Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'security' && 'Security Settings'}
            </h1>
            <p style={styles.pageSubtitle}>Welcome back, {user.name.split(' ')[0]}! 👋</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.avatar}>{getInitials(user.name)}</div>
          </div>
        </div>

        {message && (
          <div style={styles.successBanner}>{message}</div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat Cards */}
            <div style={styles.statsGrid}>
              {[
                { icon: '👤', label: 'Account Status', value: 'Active', color: '#4ade80' },
                { icon: '📅', label: 'Member Since', value: getJoinedDate(), color: '#60a5fa' },
                { icon: '⚥', label: 'Gender', value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not set', color: '#a78bfa' },
                { icon: '📞', label: 'Phone', value: user.phone || 'Not set', color: '#fb923c' },
              ].map(card => (
                <div key={card.label} style={styles.statCard}>
                  <div style={styles.statIcon}>{card.icon}</div>
                  <div>
                    <div style={styles.statLabel}>{card.label}</div>
                    <div style={{ ...styles.statValue, color: card.color }}>{card.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Summary */}
            <div style={styles.profileCard}>
              <div style={styles.profileCardHeader}>
                <h3 style={styles.cardTitle}>Profile Summary</h3>
                <button style={styles.editBtnSmall} onClick={() => { setActiveTab('profile'); setEditing(true); }}>
                  ✏️ Edit
                </button>
              </div>
              <div style={styles.profileHero}>
                <div style={styles.avatarLarge}>{getInitials(user.name)}</div>
                <div>
                  <div style={styles.profileName}>{user.name}</div>
                  <div style={styles.profileEmail}>✉️ {user.email}</div>
                  {user.phone && <div style={styles.profileEmail}>📞 {user.phone}</div>}
                  {user.gender && <div style={styles.profileEmail}>⚥ {user.gender}</div>}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={styles.actionsGrid}>
              <div style={styles.actionCard} onClick={() => { setActiveTab('profile'); setEditing(true); }}>
                <span style={{ fontSize: 28 }}>✏️</span>
                <span style={styles.actionLabel}>Edit Profile</span>
              </div>
              <div style={styles.actionCard} onClick={() => setActiveTab('security')}>
                <span style={{ fontSize: 28 }}>🔒</span>
                <span style={styles.actionLabel}>Security</span>
              </div>
              <div style={{ ...styles.actionCard, borderColor: 'rgba(239,68,68,0.3)' }} onClick={handleDelete}>
                <span style={{ fontSize: 28 }}>🗑️</span>
                <span style={{ ...styles.actionLabel, color: '#f87171' }}>Delete Account</span>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={styles.formCard}>
            <div style={styles.profileCardHeader}>
              <h3 style={styles.cardTitle}>Personal Information</h3>
              {!editing
                ? <button style={styles.editBtnSmall} onClick={() => setEditing(true)}>✏️ Edit</button>
                : <div style={{ display: 'flex', gap: 10 }}>
                    <button style={styles.saveBtn} onClick={handleUpdate}>✅ Save</button>
                    <button style={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                  </div>
              }
            </div>

            <div style={styles.formGrid}>
              {[
                { label: 'Full Name', key: 'name', icon: '👤', type: 'text', placeholder: 'John Doe' },
                { label: 'Email Address', key: 'email', icon: '✉️', type: 'email', placeholder: 'john@example.com' },
                { label: 'Phone Number', key: 'phone', icon: '📞', type: 'tel', placeholder: '+92 300 1234567' },
              ].map(field => (
                <div key={field.key} style={styles.formField}>
                  <label style={styles.formLabel}>{field.label}</label>
                  <div style={{ ...styles.inputWrap, opacity: editing ? 1 : 0.7 }}>
                    <span style={{ fontSize: 16 }}>{field.icon}</span>
                    <input
                      type={field.type}
                      value={form[field.key] || ''}
                      placeholder={field.placeholder}
                      disabled={!editing}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      style={{ ...styles.formInput, cursor: editing ? 'text' : 'default' }}
                    />
                  </div>
                </div>
              ))}

              <div style={styles.formField}>
                <label style={styles.formLabel}>Gender</label>
                <div style={{ ...styles.inputWrap, opacity: editing ? 1 : 0.7 }}>
                  <span style={{ fontSize: 16 }}>⚥</span>
                  <select
                    value={form.gender || ''}
                    disabled={!editing}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    style={{ ...styles.formInput, background: '#1a1a2e', color: '#fff', cursor: editing ? 'pointer' : 'default' }}
                  >
                    <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>Select gender</option>
                    <option value="male" style={{ background: '#1a1a2e', color: '#fff' }}>Male</option>
                    <option value="female" style={{ background: '#1a1a2e', color: '#fff' }}>Female</option>
                    <option value="other" style={{ background: '#1a1a2e', color: '#fff' }}>Other</option>
                    <option value="prefer_not" style={{ background: '#1a1a2e', color: '#fff' }}>Prefer not to say</option>
                </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div>
            <div style={styles.formCard}>
              <h3 style={styles.cardTitle}>Security Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
                {[
                  { icon: '✅', label: 'Password', desc: 'Your password is set and secure', color: '#4ade80' },
                  { icon: '✅', label: 'Email Verified', desc: user.email, color: '#4ade80' },
                  { icon: '⚠️', label: 'Two-Factor Auth', desc: 'Not enabled (coming soon)', color: '#fb923c' },
                ].map(item => (
                  <div key={item.label} style={styles.securityItem}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{item.desc}</div>
                    </div>
                    <div style={{ color: item.color, fontSize: 12, fontWeight: 600 }}>
                      {item.color === '#4ade80' ? 'Secure' : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...styles.formCard, borderColor: 'rgba(239,68,68,0.3)', marginTop: 20 }}>
              <h3 style={{ ...styles.cardTitle, color: '#f87171' }}>Danger Zone</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '12px 0 20px' }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button style={styles.deleteBtn} onClick={handleDelete}>
                🗑️ Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#0f0f1a', color: '#fff' },
  loader: { color: '#667eea', fontSize: 18 },
  sidebar: { width: 260, background: '#1a1a2e', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '28px 0' },
  brand: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px 32px' },
  logo: { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 },
  brandName: { color: '#fff', fontSize: 18, fontWeight: 700 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' },
  navItemActive: { background: 'rgba(102,126,234,0.15)', color: '#fff', borderLeft: '3px solid #667eea', paddingLeft: 11 },
  sidebarBottom: { padding: '20px 16px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20 },
  userMini: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 16px' },
  avatarSmall: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
  userMiniName: { color: '#fff', fontSize: 13, fontWeight: 600 },
  userMiniEmail: { color: 'rgba(255,255,255,0.4)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 },
  logoutBtn: { width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, padding: '10px', fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  main: { flex: 1, padding: '32px 36px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  pageTitle: { fontSize: 26, fontWeight: 700, margin: 0 },
  pageSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '4px 0 0' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  avatar: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 },
  successBanner: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 },
  statIcon: { fontSize: 28, width: 48, height: 48, background: 'rgba(102,126,234,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: 600 },
  profileCard: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px', marginBottom: 20 },
  profileCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 },
  editBtnSmall: { background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.3)', color: '#a5b4fc', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' },
  profileHero: { display: 'flex', alignItems: 'center', gap: 20 },
  avatarLarge: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0 },
  profileName: { fontSize: 20, fontWeight: 700, marginBottom: 6 },
  profileEmail: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 4 },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
  actionCard: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'border-color 0.2s' },
  actionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 },
  formCard: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '28px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 },
  formField: { display: 'flex', flexDirection: 'column', gap: 8 },
  formLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 },
  inputWrap: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0 14px', gap: 10, transition: 'opacity 0.2s' },
  formInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '12px 0' },
  saveBtn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  cancelBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer' },
  securityItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, padding: '12px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 },
};
