import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import SortableTh from '../../components/SortableTh';
import StarRating from '../../components/StarRating';
import api from '../../services/api';

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number | null;
  ratingCount: number;
  owner: { id: string; name: string; email: string } | null;
  createdAt: string;
}

export default function AdminStoresList() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'asc' as 'asc' | 'desc' });

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.name && { name: filters.name }),
        ...(filters.address && { address: filters.address }),
        sortBy: sort.field,
        sortOrder: sort.order,
      });
      const res = await api.get(`/admin/stores?${params}`);
      setStores(res.data);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (field: string) => {
    setSort((s) => ({ field, order: s.field === field && s.order === 'asc' ? 'desc' : 'asc' }));
  };

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Stores</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/stores/new')}>+ Add Store</button>
      </div>

      <div className="filters">
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={handleFilter} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={handleFilter} />
      </div>

      {loading ? (
        <div className="loading">Loading stores…</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32 }}>◫</div>
          <p>No stores found.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <SortableTh label="Name" field="name" currentSort={sort} onSort={handleSort} />
                <th>Email</th>
                <SortableTh label="Address" field="address" currentSort={sort} onSort={handleSort} />
                <th>Owner</th>
                <th>Rating</th>
                <th># Ratings</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-2)' }}>{s.email}</td>
                  <td style={{ color: 'var(--text-2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</td>
                  <td>
                    {s.owner ? (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{s.owner.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.owner.email}</div>
                      </div>
                    ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td>
                    {s.averageRating !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarRating value={Math.round(s.averageRating)} readonly size={14} />
                        <span className="rating-badge">★ {s.averageRating}</span>
                      </div>
                    ) : <span style={{ color: 'var(--text-3)', fontSize: 13 }}>No ratings</span>}
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{s.ratingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
