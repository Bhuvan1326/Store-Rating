import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { validators, parseApiErrors } from '../../utils/validators';

export default function AdminAddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const nameErr = validators.name(form.name); if (nameErr) errs.name = nameErr;
    const emailErr = validators.email(form.email); if (emailErr) errs.email = emailErr;
    const passErr = validators.password(form.password); if (passErr) errs.password = passErr;
    const addrErr = validators.address(form.address); if (addrErr) errs.address = addrErr;
    if (!form.role) errs.role = 'Role is required';
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
      await api.post('/admin/users', form);
      setSuccess(`User "${form.name}" created successfully.`);
      setForm({ name: '', email: '', password: '', address: '', role: 'user' });
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
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/users')}>← Back</button>
          <h1 className="page-title">Add User</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input name="name" value={form.name} onChange={handleChange} className={errors.name ? 'error' : ''} placeholder="At least 20 characters" />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} placeholder="user@example.com" />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className={errors.password ? 'error' : ''} placeholder="8–16 chars, 1 uppercase, 1 special" />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label>Address <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
            <input name="address" value={form.address} onChange={handleChange} className={errors.address ? 'error' : ''} placeholder="Street address" />
            {errors.address && <div className="field-error">{errors.address}</div>}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange} className={errors.role ? 'error' : ''}>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <div className="field-error">{errors.role}</div>}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create user'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/admin/users')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
