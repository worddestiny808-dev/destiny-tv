import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, Grid, LogOut, Settings, Upload, Users, Ticket, BarChart2, Menu, X, Tv, ChevronDown } from 'lucide-react';

const S = {
  layout: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--purple-deep)' },
  nav: { background: 'rgba(13,1,24,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(212,175,55,0.15)', position: 'sticky', top: 0, zIndex: 100, padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoIcon: { width: 36, height: 36, background: 'linear-gradient(135deg, #D4AF37, #A8892A)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { display: 'flex', flexDirection: 'column', lineHeight: 1.1 },
  logoTitle: { fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 700, color: '#D4AF37', letterSpacing: '1px' },
  logoSub: { fontSize: '9px', color: '#7A6A8A', letterSpacing: '2px', textTransform: 'uppercase' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '4px' },
  navLink: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', color: '#C4B5D9', transition: 'all 0.2s', border: 'none', cursor: 'pointer', background: 'transparent' },
  navLinkActive: { background: 'rgba(212,175,55,0.12)', color: '#D4AF37' },
  userMenu: { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(212,175,55,0.08)', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(212,175,55,0.15)' },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #A8892A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0D0118' },
  dropdown: { position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#1a0533', border: '1px solid #2d1054', borderRadius: '12px', minWidth: '180px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#C4B5D9', fontSize: '14px', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', textDecoration: 'none', transition: 'background 0.2s' },
  main: { flex: 1 },
  mobileMenuBtn: { display: 'none', background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', padding: '8px' },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/', label: 'Home', icon: <Home size={16} /> },
    { to: '/search', label: 'Search', icon: <Search size={16} /> },
    { to: '/category/sermons', label: 'Sermons', icon: <Tv size={16} /> },
  ];

  const adminItems = user?.role === 'admin' ? [
    { to: '/admin', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { to: '/admin/upload', label: 'Upload', icon: <Upload size={16} /> },
    { to: '/admin/users', label: 'Users', icon: <Users size={16} /> },
    { to: '/admin/invites', label: 'Invites', icon: <Ticket size={16} /> },
  ] : [];

  return (
    <div style={S.layout}>
      <nav style={S.nav}>
        <Link to="/" style={S.logo}>
          <div style={S.logoIcon}>
            <Tv size={18} color="#0D0118" strokeWidth={2.5} />
          </div>
          <div style={S.logoText}>
            <span style={S.logoTitle}>DESTINY TV</span>
            <span style={S.logoSub}>Word Ministries Intl</span>
          </div>
        </Link>

        <div style={S.navLinks} className="desktop-nav">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} style={{ ...S.navLink, ...(isActive(item.to) ? S.navLinkActive : {}) }}>
              {item.icon} {item.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <div style={{ position: 'relative' }}>
              <button style={{ ...S.navLink, ...(location.pathname.startsWith('/admin') ? S.navLinkActive : {}) }}
                onClick={() => setShowDropdown(d => !d)}>
                <Settings size={16} /> Admin <ChevronDown size={12} />
              </button>
              {showDropdown && (
                <div style={{ ...S.dropdown, left: 0, right: 'auto', minWidth: '160px' }}>
                  {adminItems.map(item => (
                    <Link key={item.to} to={item.to} style={S.dropdownItem} onClick={() => setShowDropdown(false)}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={S.userMenu} onClick={() => setShowDropdown(d => !d)} className="user-menu-trigger">
            <div style={S.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <span style={{ fontSize: '13px', color: '#C4B5D9', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</span>
            <ChevronDown size={12} color="#7A6A8A" />
          </div>
          {showDropdown && (
            <div style={{ ...S.dropdown, right: 0 }} onClick={() => setShowDropdown(false)}>
              <div style={{ ...S.dropdownItem, borderBottom: '1px solid #2d1054', paddingBottom: '12px', marginBottom: '4px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0FF' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: '#7A6A8A' }}>{user?.email}</div>
                </div>
              </div>
              <button style={{ ...S.dropdownItem, color: '#E53E3E' }} onClick={handleLogout}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,62,62,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main style={S.main} onClick={() => showDropdown && setShowDropdown(false)}>
        <Outlet />
      </main>

      <footer style={{ borderTop: '1px solid rgba(212,175,55,0.1)', padding: '20px 24px', textAlign: 'center', color: '#7A6A8A', fontSize: '12px' }}>
        <p style={{ fontFamily: 'Cinzel, serif', color: '#D4AF37', marginBottom: '4px', fontSize: '13px' }}>Destiny Word Ministries International</p>
        <p>© {new Date().getFullYear()} · All rights reserved · Private Member Access Only</p>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        .user-menu-trigger:hover { background: rgba(212,175,55,0.15) !important; }
      `}</style>
    </div>
  );
}
