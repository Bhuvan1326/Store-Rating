import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StarRating from '../../components/StarRating';
import api from '../../services/api';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  address: string;
  role: string;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    email: string;
    address: string;
    averageRating: number | null;
  };
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then((r) => setUser(r.data))
      .catch(() => setError('User not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Layout>
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>← Back</button>
      </div>

      {loading && <div className="loading">Loading…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {user && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 860 }}>
          <div className="card">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: 6 }}>{user.name}</div>
              <span className={`role-chip ${user.role}`}>{user.role.replace('_', ' ')}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Email" value={user.email} />
              <Field label="Address" value={user.address || '—'} />
              <Field label="Joined" value={new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
              <Field label="User ID" value={user.id} mono />
            </div>
          </div>

          {user.role === 'store_owner' && user.store && (
            <div className="card">
              <div style={{ fontSize: 13, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 16 }}>Their Store</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, fontFamily: 'Syne, sans-serif' }}>{user.store.name}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Store Email" value={user.store.email} />
                <Field label="Address" value={user.store.address} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>Average Rating</div>
                  {user.store.averageRating !== null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StarRating value={Math.round(user.store.averageRating)} readonly />
                      <span className="rating-badge">★ {user.store.averageRating}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-3)', fontSize: 14 }}>No ratings yet</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const valueStyle = mono
    ? { fontSize: 12, color: 'var(--text-2)', fontFamily: 'monospace' }
    : { fontSize: 14, color: 'var(--text)' };

  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}
