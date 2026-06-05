import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import StarRating from '../../components/StarRating';
import RatingModal from '../../components/RatingModal';
import api from '../../services/api';

interface Store {
  id: string;
  name: string;
  address: string;
  email: string;
  averageRating: number | null;
  myRating: number | null;
  myRatingId: string | null;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalStore, setModalStore] = useState<Store | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/stores${params}`);
      setStores(res.data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchStores(), 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchStores]);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Stores</h1>
        <span style={{ color: 'var(--text-3)', fontSize: 14 }}>{stores.length} store{stores.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="filters" style={{ marginBottom: 24 }}>
        <input
          placeholder="Search by name or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 280 }}
        />
      </div>

      {loading ? (
        <div className="loading">Loading stores…</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 32 }}>◫</div>
          <p>{search ? 'No stores match your search.' : 'No stores available yet.'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Store</th>
                <th>Address</th>
                <th>Overall Rating</th>
                <th>Your Rating</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{store.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{store.email}</div>
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {store.address}
                  </td>
                  <td>
                    {store.averageRating !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarRating value={Math.round(store.averageRating)} readonly size={15} />
                        <span className="rating-badge">★ {store.averageRating}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>No ratings yet</span>
                    )}
                  </td>
                  <td>
                    {store.myRating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StarRating value={store.myRating} readonly size={15} />
                        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{store.myRating}/5</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Not rated</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setModalStore(store)}
                    >
                      {store.myRating ? 'Edit rating' : 'Rate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalStore && (
        <RatingModal
          store={modalStore}
          existingRatingId={modalStore.myRatingId}
          existingRating={modalStore.myRating}
          onClose={() => setModalStore(null)}
          onSaved={() => { setModalStore(null); fetchStores(); }}
        />
      )}
    </Layout>
  );
}
