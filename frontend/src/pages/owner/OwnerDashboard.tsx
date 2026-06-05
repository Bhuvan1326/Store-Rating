import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StarRating from '../../components/StarRating';
import SortableTh from '../../components/SortableTh';
import api from '../../services/api';

interface Rater {
  ratingId: string;
  rating: number;
  submittedAt: string;
  user: { id: string; name: string; email: string };
}

interface DashboardData {
  store: { id: string; name: string; email: string; address: string };
  averageRating: number | null;
  totalRatings: number;
  raters: Rater[];
}

export default function OwnerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({ field: 'submittedAt', order: 'desc' as 'asc' | 'desc' });

  useEffect(() => {
    api.get('/owner/dashboard')
      .then((r) => setData(r.data))
      .catch(() => setError('Could not load dashboard. Make sure your store has been set up by an admin.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field: string) => {
    setSort((s) => ({ field, order: s.field === field && s.order === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedRaters = data ? [...data.raters].sort((a, b) => {
    let valA: any = a.user.name, valB: any = b.user.name;
    if (sort.field === 'rating') { valA = a.rating; valB = b.rating; }
    if (sort.field === 'submittedAt') { valA = new Date(a.submittedAt); valB = new Date(b.submittedAt); }
    if (valA < valB) return sort.order === 'asc' ? -1 : 1;
    if (valA > valB) return sort.order === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Your Store</h1>
      </div>

      {loading && <div className="loading">Loading dashboard…</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {data && (
        <>
          {/* Store info + rating summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            <div className="card">
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: 16 }}>{data.store.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <InfoRow label="Email" value={data.store.email} />
                <InfoRow label="Address" value={data.store.address} />
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Average Rating</div>
              {data.averageRating !== null ? (
                <>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                    {data.averageRating}
                  </div>
                  <StarRating value={Math.round(data.averageRating)} readonly size={24} />
                  <div style={{ color: 'var(--text-3)', fontSize: 13 }}>from {data.totalRatings} rating{data.totalRatings !== 1 ? 's' : ''}</div>
                </>
              ) : (
                <div style={{ color: 'var(--text-3)', fontSize: 15 }}>No ratings yet</div>
              )}
            </div>
          </div>

          {/* Raters table */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Who rated you</h2>
          </div>

          {sortedRaters.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 32 }}>◉</div>
              <p>No one has rated your store yet.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <SortableTh label="Name" field="name" currentSort={sort} onSort={handleSort} />
                    <th>Email</th>
                    <SortableTh label="Rating" field="rating" currentSort={sort} onSort={handleSort} />
                    <SortableTh label="Submitted" field="submittedAt" currentSort={sort} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sortedRaters.map((r) => (
                    <tr key={r.ratingId}>
                      <td style={{ fontWeight: 500 }}>{r.user.name}</td>
                      <td style={{ color: 'var(--text-2)' }}>{r.user.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StarRating value={r.rating} readonly size={14} />
                          <span className="rating-badge">★ {r.rating}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-3)', fontSize: 13 }}>
                        {new Date(r.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
}
