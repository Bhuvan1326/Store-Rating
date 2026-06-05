import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Total Users</div>
              <div className="value">{stats?.totalUsers ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Stores</div>
              <div className="value">{stats?.totalStores ?? '—'}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Ratings</div>
              <div className="value">{stats?.totalRatings ?? '—'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Quick Actions</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/admin/users/new'); }}>+ Add User</button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/admin/stores/new'); }}>+ Add Store</button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/admin/users'); }}>View Users</button>
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/admin/stores'); }}>View Stores</button>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
