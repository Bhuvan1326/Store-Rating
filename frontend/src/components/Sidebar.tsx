import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '◈' },
    { label: 'Users', path: '/admin/users', icon: '◉' },
    { label: 'Stores', path: '/admin/stores', icon: '◫' },
  ],
  user: [
    { label: 'Stores', path: '/stores', icon: '◫' },
    { label: 'Change Password', path: '/change-password', icon: '◎' },
  ],
  store_owner: [
    { label: 'Dashboard', path: '/owner/dashboard', icon: '◈' },
    { label: 'Change Password', path: '/owner/change-password', icon: '◎' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const items = NAV_ITEMS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Store<span>★</span>
      </div>

      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 2 }}>Signed in as</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
        <span className={`role-chip ${user.role}`} style={{ marginTop: 6, display: 'inline-block' }}>
          {user.role.replace('_', ' ')}
        </span>
      </div>

      <nav style={{ flex: 1, paddingTop: 12 }}>
        {items.map((item) => (
          <button
            key={item.path}
            className={`sidebar-link${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <button className="sidebar-link logout" onClick={handleLogout}>
        <span>⊗</span> Log out
      </button>
    </aside>
  );
}
