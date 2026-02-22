import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../api/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode, form) {
  const errs = {};
  if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required.';
  if (!form.email.trim()) {
    errs.email = 'Email is required.';
  } else if (!EMAIL_RE.test(form.email)) {
    errs.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errs.password = 'Password is required.';
  } else if (mode === 'register' && form.password.length < 6) {
    errs.password = 'Password must be at least 6 characters.';
  }
  return errs;
}

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [touched, setTouched] = useState({});

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    if (touched[key]) setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    setServerError('');
  };

  const blur = (key) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    const errs = validate(mode, form);
    setFieldErrors((prev) => ({ ...prev, [key]: errs[key] || '' }));
  };

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  const switchMode = (m) => {
    setMode(m);
    setServerError('');
    setFieldErrors({});
    setTouched({});
    setForm({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    const errs = validate(mode, form);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      triggerShake();
      return;
    }
    setServerError('');
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser({ name: form.name, email: form.email, password: form.password });
      login(data.user, data.token);
    } catch (err) {
      let msg = 'Something went wrong. Please try again.';
      try {
        const body = JSON.parse(err.message);
        msg = body.error || msg;
      } catch { /* use default */ }
      if (msg.toLowerCase().includes('invalid email or password')) {
        msg = 'Incorrect email or password. Please try again.';
      } else if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('taken')) {
        msg = 'An account with that email already exists.';
      }
      setServerError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { level: 1, label: 'Too short', color: '#DC2626' };
    if (pw.length < 8) return { level: 2, label: 'Weak', color: '#F59E0B' };
    const strong = /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
    const medium = /[A-Z]/.test(pw) || /[0-9]/.test(pw);
    if (strong) return { level: 4, label: 'Strong', color: '#16A34A' };
    if (medium) return { level: 3, label: 'Medium', color: '#D97706' };
    return { level: 2, label: 'Weak', color: '#F59E0B' };
  };

  const strength = mode === 'register' ? passwordStrength(form.password) : null;

  return (
    <div className="auth-page">
      <div className={`auth-card ${shake ? 'auth-card--shake' : ''}`}>
        <div className="auth-header">
          <h1 className="auth-title">{'\uD83D\uDC8D'} Shaadi Manager</h1>
          <p className="auth-subtitle">Private Profile Tracker</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Create Account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className={`auth-field ${fieldErrors.name ? 'auth-field--error' : ''}`}>
              <label>Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={set('name')}
                onBlur={blur('name')}
                autoComplete="name"
              />
              {fieldErrors.name && <span className="auth-field-error">{fieldErrors.name}</span>}
            </div>
          )}

          <div className={`auth-field ${fieldErrors.email ? 'auth-field--error' : ''}`}>
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={set('email')}
              onBlur={blur('email')}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
          </div>

          <div className={`auth-field ${fieldErrors.password ? 'auth-field--error' : ''}`}>
            <label>Password</label>
            <div className="auth-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
                value={form.password}
                onChange={set('password')}
                onBlur={blur('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '\uD83D\uDE48' : '\uD83D\uDC41\uFE0F'}
              </button>
            </div>
            {mode === 'register' && strength && (
              <div className="auth-strength">
                <div className="auth-strength__bars">
                  {[1,2,3,4].map((i) => (
                    <div
                      key={i}
                      className="auth-strength__bar"
                      style={{ background: i <= strength.level ? strength.color : undefined }}
                    />
                  ))}
                </div>
                <span className="auth-strength__label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
            {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
          </div>

          {serverError && (
            <div className="auth-server-error">
              <span className="auth-server-error__icon">{'\u26A0\uFE0F'}</span>
              {serverError}
            </div>
          )}

          <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner" />}
            {loading ? 'Please wait\u2026' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="btn btn--link" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}