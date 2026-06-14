import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { UserCheck, UserX, Trash2, Shield, ChevronLeft, UserPlus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'viewer' });

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(r => { setUsers(r.data.users); setLoading(false); });
  };
  useEffect(load, []);

  const approve = id => api.put(`/admin/users/${id}/approve`).then(() => { toast.success('User approved'); load(); });
  const suspend = id => api.put(`/admin/users/${id}/suspend`).then(() => { toast.success('User suspended'); load(); });
  const del = id => { if (!window.confirm('Delete this user?')) return; api.delete(`/admin/users/${id}`).then(() => { toast.success('User deleted'); load(); }); };

  const createUser = async e => {
    e.preventDefault();
    try { await api.post('/admin/users', newUser); toast.success('User created'); setShowCreate(false); setNewUser({ name: '', email: '', password: '', role: 'viewer' }); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const filtered = users.filter(u => {
    if (filter !== 'all' && u.status !== filter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid #2d1054', borderRadius: '8px', padding: '10px 12px', color: '#F5F0FF', fontSize: '13px', outline: 'none' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7A6A8A', textDecoration: 'none', fontSize: '13px', marginBottom: '24px' }}>
        <ChevronLeft size={14} /> Dashboard
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#F5F0FF', fontWeight: 700 }}>Members</h1>
        <button onClick={() => setShowCreate(!showCreate)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '10px', padding: '10px 18px', color: '#0D0118', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
          <UserPlus size={15} /> Add Member
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createUser} style={{ background: 'var(--purple-card)', border: '1px solid #D4AF37', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#D4AF37', marginBottom: '16px' }}>ADD MEMBER</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {[['name', 'text', 'Full Name'], ['email', 'email', 'Email'], ['password', 'password', 'Password']].map(([k, t, p]) => (
              <input key={k} type={t} placeholder={p} required value={newUser[k]} onChange={e => setNewUser({ ...newUser, [k]: e.target.value })} style={inp} />
            ))}
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={inp}>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #D4AF37, #A8892A)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#0D0118', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Create</button>
            <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'transparent', border: '1px solid #2d1054', borderRadius: '8px', padding: '10px 20px', color: '#7A6A8A', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'active', 'pending', 'suspended'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 16px', borderRadius: '20px', border: `1px solid ${filter === f ? '#D4AF37' : '#2d1054'}`, background: filter === f ? 'rgba(212,175,55,0.15)' : 'transparent', color: filter === f ? '#D4AF37' : '#7A6A8A', cursor: 'pointer', fontSize: '12px', fontWeight: 500, textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7A6A8A' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." style={{ ...inp, paddingLeft: '30px', width: '200px' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--purple-card)', border: '1px solid var(--purple-border)', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2d1054' }}>
              {['Member', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', color: '#7A6A8A', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#7A6A8A', fontSize: '13px' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#7A6A8A', fontSize: '13px' }}>No members found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(45,16,84,0.4)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0D0118', flexShrink: 0 }}>{u.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#F5F0FF', fontWeight: 500 }}>{u.name}</p>
                      <p style={{ fontSize: '11px', color: '#7A6A8A' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: u.role === 'admin' ? 'rgba(212,175,55,0.15)' : 'rgba(159,122,234,0.12)', color: u.role === 'admin' ? '#D4AF37' : '#9F7AEA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 16px' }}><StatusBadge status={u.status} /></td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#7A6A8A' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {u.status === 'pending' && <ActionBtn icon={<UserCheck size={13} />} color="#38A169" title="Approve" onClick={() => approve(u.id)} />}
                    {u.status === 'active' && <ActionBtn icon={<UserX size={13} />} color="#E53E3E" title="Suspend" onClick={() => suspend(u.id)} />}
                    {u.status === 'suspended' && <ActionBtn icon={<UserCheck size={13} />} color="#38A169" title="Reactivate" onClick={() => approve(u.id)} />}
                    <ActionBtn icon={<Trash2 size={13} />} color="#E53E3E" title="Delete" onClick={() => del(u.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const c = { active: '#38A169', pending: '#D69E2E', suspended: '#E53E3E' };
  return <span style={{ fontSize: '11px', fontWeight: 600, color: c[status] || '#7A6A8A', background: `${c[status] || '#7A6A8A'}15`, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{status}</span>;
}
function ActionBtn({ icon, color, title, onClick }) {
  return <button onClick={onClick} title={title} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${color}30`, background: `${color}12`, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = `${color}25`} onMouseLeave={e => e.currentTarget.style.background = `${color}12`}>{icon}</button>;
}
