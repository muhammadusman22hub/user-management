import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (search) result = result.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search)
    );
    if (filterRole !== 'all') result = result.filter(u => u.role === filterRole);
    setFiltered(result);
  }, [search, filterRole, users]);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFiltered(usersRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone || '', gender: user.gender || '', role: user.role });
    setShowModal(true);
  };

  const saveEdit = async () => {
    try {
      await api.put(`/admin/users/${selectedUser.id}`, editForm);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u));
      setShowModal(false);
      showMsg('User updated successfully!');
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      showMsg(`${name} has been deleted.`);
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const promoteUser = async (id, name) => {
    try {
      await api.patch(`/admin/users/${id}/promote`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'admin' } : u));
      showMsg(`${name} promoted to Admin!`);
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const demoteUser = async (id, name) => {
    try {
      await api.patch(`/admin/users/${id}/demote`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'user' } : u));
      showMsg(`${name} demoted to User.`);
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  if (loading) return (
    <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#667eea', fontSize: 18 }}>Loading Admin Dashboard...</div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.brand}>
          <div style={S.logo}>A</div>
          <div>
            <div style={S.brandName}>UserHub</div>
            <div style={S.brandSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={S.nav}>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'users', icon: '👥', label: 'All Users' },
            { id: 'admins', icon: '🛡️', label: 'Admins' },
          ].map(tab => (
            <div key={tab.id} style={{ ...S.navItem, ...(activeTab === tab.id ? S.navActive : {}) }} onClick={() => setActiveTab(tab.id)}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'users' && <span style={S.badge}>{users.filter(u => u.role === 'user').length}</span>}
              {tab.id === 'admins' && <span style={{ ...S.badge, background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>{users.filter(u => u.role === 'admin').length}</span>}
            </div>
          ))}
        </nav>

        <div style={S.sideBottom}>
          <div style={S.switchBtn} onClick={() => navigate('/dashboard')}>
            👤 My Profile
          </div>
          <div style={{ ...S.switchBtn, marginTop: 8, color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }} onClick={logout}>
            🚪 Logout
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {/* HEADER */}
        <div style={S.header}>
          <div>
            <h1 style={S.pageTitle}>
              {activeTab === 'overview' && '📊 Dashboard Overview'}
              {activeTab === 'users' && '👥 User Management'}
              {activeTab === 'admins' && '🛡️ Admin Management'}
            </h1>
            <p style={S.pageSub}>Full control over all registered accounts</p>
          </div>
          <div style={S.headerRight}>
            <div style={S.adminBadge}>🛡️ Admin</div>
          </div>
        </div>

        {/* MESSAGE BANNER */}
        {message.text && (
          <div style={{ ...S.banner, background: message.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', borderColor: message.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)', color: message.type === 'error' ? '#f87171' : '#4ade80' }}>
            {message.text}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div>
            {/* Stat Cards */}
            <div style={S.statsGrid}>
              {[
                { icon: '👥', label: 'Total Users', value: stats.total, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
                { icon: '🛡️', label: 'Admins', value: stats.admins, color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
                { icon: '👤', label: 'Regular Users', value: stats.regularUsers, color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
                { icon: '🆕', label: 'New This Week', value: stats.newThisWeek, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
              ].map(card => (
                <div key={card.label} style={S.statCard}>
                  <div style={{ ...S.statIconBox, background: card.bg }}>
                    <span style={{ fontSize: 26 }}>{card.icon}</span>
                  </div>
                  <div>
                    <div style={S.statLabel}>{card.label}</div>
                    <div style={{ ...S.statVal, color: card.color }}>{card.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Users */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <h3 style={S.cardTitle}>Recently Joined Users</h3>
                <span style={S.viewAll} onClick={() => setActiveTab('users')}>View All →</span>
              </div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['User', 'Email', 'Phone', 'Gender', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((u, i) => (
                      <tr key={u.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={S.td}>
                          <div style={S.userCell}>
                            <div style={{ ...S.avatar, background: u.role === 'admin' ? 'linear-gradient(135deg,#fb923c,#f59e0b)' : 'linear-gradient(135deg,#667eea,#764ba2)' }}>{getInitials(u.name)}</div>
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={S.td}>{u.email}</td>
                        <td style={S.td}>{u.phone || '—'}</td>
                        <td style={S.td}>{u.gender || '—'}</td>
                        <td style={S.td}><span style={{ ...S.rolePill, background: u.role === 'admin' ? 'rgba(251,146,60,0.15)' : 'rgba(102,126,234,0.15)', color: u.role === 'admin' ? '#fb923c' : '#a5b4fc' }}>{u.role}</span></td>
                        <td style={S.td}>{formatDate(u.createdAt)}</td>
                        <td style={S.td}>
                          <div style={S.actionBtns}>
                            <button style={S.editBtn} onClick={() => openEdit(u)}>✏️</button>
                            <button style={S.delBtn} onClick={() => deleteUser(u.id, u.name)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {(activeTab === 'users' || activeTab === 'admins') && (
          <div>
            {/* Search & Filter */}
            <div style={S.toolbar}>
              <div style={S.searchWrap}>
                <span style={{ fontSize: 16, opacity: 0.5 }}>🔍</span>
                <input
                  placeholder="Search by name, email or phone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={S.searchInput}
                />
                {search && <span style={{ cursor: 'pointer', opacity: 0.5, fontSize: 14 }} onClick={() => setSearch('')}>✕</span>}
              </div>
              <div style={S.filterWrap}>
                {['all', 'user', 'admin'].map(r => (
                  <button key={r} style={{ ...S.filterBtn, ...(filterRole === r ? S.filterActive : {}) }} onClick={() => setFilterRole(r)}>
                    {r === 'all' ? '👥 All' : r === 'user' ? '👤 Users' : '🛡️ Admins'}
                  </button>
                ))}
              </div>
              <div style={S.totalCount}>{filtered.length} records</div>
            </div>

            {/* Users Table */}
            <div style={S.card}>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['#', 'User', 'Email', 'Phone', 'Gender', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'admins' ? filtered.filter(u => u.role === 'admin') : filtered).map((u, i) => (
                      <tr key={u.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ ...S.td, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{i + 1}</td>
                        <td style={S.td}>
                          <div style={S.userCell}>
                            <div style={{ ...S.avatar, background: u.role === 'admin' ? 'linear-gradient(135deg,#fb923c,#f59e0b)' : 'linear-gradient(135deg,#667eea,#764ba2)' }}>{getInitials(u.name)}</div>
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={S.td}>{u.email}</td>
                        <td style={S.td}>{u.phone || '—'}</td>
                        <td style={S.td}>{u.gender || '—'}</td>
                        <td style={S.td}>
                          <span style={{ ...S.rolePill, background: u.role === 'admin' ? 'rgba(251,146,60,0.15)' : 'rgba(102,126,234,0.15)', color: u.role === 'admin' ? '#fb923c' : '#a5b4fc' }}>
                            {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                          </span>
                        </td>
                        <td style={S.td}>{formatDate(u.createdAt)}</td>
                        <td style={S.td}>
                          <div style={S.actionBtns}>
                            <button style={S.editBtn} onClick={() => openEdit(u)} title="Edit">✏️</button>
                            {u.role === 'user'
                              ? <button style={S.promoteBtn} onClick={() => promoteUser(u.id, u.name)} title="Promote to Admin">⬆️</button>
                              : <button style={S.demoteBtn} onClick={() => demoteUser(u.id, u.name)} title="Demote to User">⬇️</button>
                            }
                            <button style={S.delBtn} onClick={() => deleteUser(u.id, u.name)} title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div style={S.empty}>No users found matching your search.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showModal && selectedUser && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>Edit User</h3>
              <span style={S.modalClose} onClick={() => setShowModal(false)}>✕</span>
            </div>

            <div style={S.modalAvatar}>{getInitials(selectedUser.name)}</div>
            <p style={S.modalSubtitle}>ID: {selectedUser.id.slice(0, 8)}...</p>

            <div style={S.modalForm}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', icon: '👤' },
                { label: 'Email Address', key: 'email', type: 'email', icon: '✉️' },
                { label: 'Phone Number', key: 'phone', type: 'tel', icon: '📞' },
              ].map(field => (
                <div key={field.key} style={S.modalField}>
                  <label style={S.modalLabel}>{field.label}</label>
                  <div style={S.modalInputWrap}>
                    <span style={{ fontSize: 15 }}>{field.icon}</span>
                    <input
                      type={field.type}
                      value={editForm[field.key] || ''}
                      onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      style={S.modalInput}
                    />
                  </div>
                </div>
              ))}

              <div style={S.modalField}>
                <label style={S.modalLabel}>Gender</label>
                <div style={S.modalInputWrap}>
                  <span style={{ fontSize: 15 }}>⚥</span>
                  <select value={editForm.gender || ''} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} style={{ ...S.modalInput, background: 'transparent' }}>
                    <option value="" style={{ background: '#1a1a2e' }}>Select gender</option>
                    <option value="male" style={{ background: '#1a1a2e' }}>Male</option>
                    <option value="female" style={{ background: '#1a1a2e' }}>Female</option>
                    <option value="other" style={{ background: '#1a1a2e' }}>Other</option>
                    <option value="prefer_not" style={{ background: '#1a1a2e' }}>Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={S.modalField}>
                <label style={S.modalLabel}>Role</label>
                <div style={S.modalInputWrap}>
                  <span style={{ fontSize: 15 }}>🛡️</span>
                  <select value={editForm.role || 'user'} onChange={e => setEditForm({ ...editForm, role: e.target.value })} style={{ ...S.modalInput, background: 'transparent' }}>
                    <option value="user" style={{ background: '#1a1a2e' }}>👤 User</option>
                    <option value="admin" style={{ background: '#1a1a2e' }}>🛡️ Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={S.modalActions}>
              <button style={S.saveBtn} onClick={saveEdit}>✅ Save Changes</button>
              <button style={S.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#0f0f1a', color: '#fff' },
  sidebar: { width: 240, background: '#1a1a2e', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 28px' },
  logo: { width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#fb923c,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 },
  brandName: { color: '#fff', fontSize: 16, fontWeight: 700 },
  brandSub: { color: '#fb923c', fontSize: 11, fontWeight: 600, letterSpacing: 1 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 9, cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 500, transition: 'all 0.2s' },
  navActive: { background: 'rgba(102,126,234,0.12)', color: '#fff', borderLeft: '3px solid #667eea', paddingLeft: 9 },
  badge: { marginLeft: 'auto', background: 'rgba(102,126,234,0.2)', color: '#a5b4fc', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 600 },
  sideBottom: { padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 16 },
  switchBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  main: { flex: 1, padding: '28px 32px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle: { fontSize: 24, fontWeight: 700, margin: '0 0 4px' },
  pageSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  adminBadge: { background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)', color: '#fb923c', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600 },
  banner: { padding: '12px 16px', borderRadius: 10, border: '1px solid', fontSize: 14, marginBottom: 20, fontWeight: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 },
  statCard: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px', display: 'flex', alignItems: 'center', gap: 14 },
  statIconBox: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 4 },
  statVal: { fontSize: 26, fontWeight: 700 },
  card: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 },
  viewAll: { color: '#667eea', fontSize: 13, cursor: 'pointer', fontWeight: 500 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap' },
  td: { padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' },
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 },
  rolePill: { borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  actionBtns: { display: 'flex', gap: 6 },
  editBtn: { background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.2)', color: '#a5b4fc', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontSize: 13 },
  promoteBtn: { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontSize: 13 },
  demoteBtn: { background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)', color: '#fb923c', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontSize: 13 },
  delBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', fontSize: 13 },
  toolbar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchWrap: { flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 10, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0 14px' },
  searchInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, padding: '11px 0' },
  filterWrap: { display: 'flex', gap: 6 },
  filterBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  filterActive: { background: 'rgba(102,126,234,0.15)', borderColor: 'rgba(102,126,234,0.3)', color: '#a5b4fc' },
  totalCount: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
  empty: { textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: 14 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: '#1a1a2e', border: '1px solid rgba(102,126,234,0.2)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 },
  modalClose: { color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18, lineHeight: 1 },
  modalAvatar: { width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, margin: '0 auto 8px' },
  modalSubtitle: { color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', margin: '0 0 20px' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: 14 },
  modalField: { display: 'flex', flexDirection: 'column', gap: 6 },
  modalLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500 },
  modalInputWrap: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '0 14px' },
  modalInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '11px 0' },
  modalActions: { display: 'flex', gap: 10, marginTop: 22 },
  saveBtn: { flex: 1, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: '#fff', borderRadius: 9, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 9, padding: '12px 20px', fontSize: 14, cursor: 'pointer' },
};
