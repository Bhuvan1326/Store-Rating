import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { validators, parseApiErrors } from '../../utils/validators';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {
      name: validators.name(form.name),
      email: validators.email(form.email),
      password: validators.password(form.password),
      address: validators.address(form.address),
    };
    // Remove empty error strings
    Object.keys(errs).forEach((k) => !errs[k] && delete errs[k]);
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setApiError(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <h1>Create account</h1>
        <p className="subtitle">Browse and rate stores near you</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="At least 20 characters"
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="you@example.com"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="8–16 chars, 1 uppercase, 1 special"
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label>Address <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
              placeholder="Your address"
            />
            {errors.address && <div className="field-error">{errors.address}</div>}
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
