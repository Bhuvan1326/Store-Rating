import React, { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { validators, parseApiErrors } from '../../utils/validators';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    const passErr = validators.password(form.newPassword);
    if (passErr) errs.newPassword = passErr;
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      await api.put('/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setApiError(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Change Password</h1>
      </div>

      <div className="card" style={{ maxWidth: 440 }}>
        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current password</label>
            <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} className={errors.currentPassword ? 'error' : ''} placeholder="Your current password" />
            {errors.currentPassword && <div className="field-error">{errors.currentPassword}</div>}
          </div>

          <div className="form-group">
            <label>New password</label>
            <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className={errors.newPassword ? 'error' : ''} placeholder="8–16 chars, 1 uppercase, 1 special" />
            {errors.newPassword && <div className="field-error">{errors.newPassword}</div>}
          </div>

          <div className="form-group">
            <label>Confirm new password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'error' : ''} placeholder="Repeat new password" />
            {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
