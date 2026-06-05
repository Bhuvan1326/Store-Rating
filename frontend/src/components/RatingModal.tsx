import React, { useState } from 'react';
import StarRating from './StarRating';
import api from '../services/api';
import { parseApiErrors } from '../utils/validators';

interface Props {
  store: { id: string; name: string };
  existingRatingId?: string | null;
  existingRating?: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function RatingModal({ store, existingRatingId, existingRating, onClose, onSaved }: Props) {
  const [rating, setRating] = useState(existingRating || 0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!existingRatingId;

  const handleSubmit = async () => {
    if (!rating) { setError('Select a star rating before submitting.'); return; }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/ratings/${existingRatingId}`, { rating });
      } else {
        await api.post('/ratings', { store_id: store.id, rating });
      }
      onSaved();
    } catch (err: any) {
      setError(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{isEdit ? 'Update your rating' : 'Rate this store'}</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 24, fontSize: 14 }}>{store.name}</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <StarRating value={rating} onChange={setRating} size={36} />
        </div>

        {rating > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>
            {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
          </p>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update rating' : 'Submit rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
