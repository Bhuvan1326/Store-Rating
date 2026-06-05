import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import SortableTh from '../../components/SortableTh';
import api from '../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'asc' as 'asc' | 'desc' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.name && { name: filters.name }),
        ...(filters.email && { email: filters.email }),
        ...(filters.address && { address: filters.address }),
        ...(filters.role && { role: filters.role }),
        sortBy: sort.field,
        sortOrder: sort.order,
      });
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field: string) => {
    setSort((s) => ({ field, order: s.field === field && s.order === 'asc' ? 'desc' : 'asc' }));
  };

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/users/new')}>+ Add User</button>
      </div>

      <div className="filters">
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={handleFilter} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={handleFilter} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={handleFilter} />
        <select name="role" value={filters.role} onChange={handleFilter}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32 }}>◉</div>
          <p>No users match your filters.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortableTh label="Name" field="name" currentSort={sort} onSort={handleSort} />
                <SortableTh label="Email" field="email" currentSort={sort} onSort={handleSort} />
                <th>Address</th>
                <SortableTh label="Role" field="role" currentSort={sort} onSort={handleSort} />
                <SortableTh label="Joined" field="createdAt" currentSort={sort} onSort={handleSort} />
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-2)' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                  <td><span className={`role-chip ${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                  <td style={{ color: 'var(--text-3)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/users/${u.id}`)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
