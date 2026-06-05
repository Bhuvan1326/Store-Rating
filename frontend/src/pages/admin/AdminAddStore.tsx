import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { validators, parseApiErrors } from '../../utils/validators';

interface Owner { id: string; name: string; email: string; }

export default function AdminAddStore() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(true);

  // Fetch store owners for the dropdown
  useEffect(() => {
    api.get('/admin/store-owners')
      .then((r) => setOwners(r.data))
      .finally(() => setOwnersLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Store name is required';
    else if (form.name.length > 60) errs.name = 'Store name cannot exceed 60 characters';
    const emailErr = validators.email(form.email); if (emailErr) errs.email = emailErr;
    const addrErr = validators.address(form.address); if (addrErr) errs.address = addrErr;
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.ownerId) errs.ownerId = 'Select a store owner';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    setSuccess('');
    try {
      await api.post('/admin/stores', form);
      setSuccess(`Store "${form.name}" created successfully.`);
      setForm({ name: '', email: '', address: '', ownerId: '' });
    } catch (err: any) {
      setApiError(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/stores')}>← Back</button>
          <h1 className="page-title">Add Store</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Store name</label>
            <input name="name" value={form.name} onChange={handleChange} className={errors.name ? 'error' : ''} placeholder="Store name" />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Store email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} placeholder="store@example.com" />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} className={errors.address ? 'error' : ''} placeholder="Full street address" />
            {errors.address && <div className="field-error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label>Owner</label>
            {ownersLoading ? (
              <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '10px 0' }}>Loading owners…</div>
            ) : owners.length === 0 ? (
              <div style={{ color: 'var(--danger)', fontSize: 13, padding: '10px 0' }}>
                No store owners found. <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/admin/users/new')}>Create one first.</span>
              </div>
            ) : (
              <select name="ownerId" value={form.ownerId} onChange={handleChange} className={errors.ownerId ? 'error' : ''}>
                <option value="">Select an owner…</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name} — {o.email}</option>
                ))}
              </select>
            )}
            {errors.ownerId && <div className="field-error">{errors.ownerId}</div>}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading || ownersLoading}>{loading ? 'Creating…' : 'Create store'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/admin/stores')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
