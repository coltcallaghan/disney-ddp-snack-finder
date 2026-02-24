import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import '../App.css';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function AuthModal({ open, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Reset form when modal closes or tab changes
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError(null);
      setSuccessMessage(null);
    }
  }, [open, tab]);

  if (!open) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onAuthSuccess();
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Check your email to confirm your account');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Check your email for a password reset link');
        setShowForgotPassword(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'signin' ? ' auth-tab--active' : ''}`}
            onClick={() => setTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${tab === 'signup' ? ' auth-tab--active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {!showForgotPassword ? (
          <form className="auth-form" onSubmit={tab === 'signin' ? handleSignIn : handleSignUp}>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {tab === 'signin' && (
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--disney-blue)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline',
                  padding: '8px 0',
                  marginTop: '8px',
                  marginBottom: '16px',
                }}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>
            )}

            {error && <div className="auth-error">{error}</div>}
            {successMessage && <div className="auth-success">{successMessage}</div>}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (tab === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                Reset Your Password
              </h3>
              <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div className="auth-field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={resetLoading}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {successMessage && <div className="auth-success">{successMessage}</div>}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={resetLoading}
              style={{ marginBottom: '12px' }}
            >
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                borderRadius: '6px',
                transition: 'all 0.2s',
              }}
              onClick={() => setShowForgotPassword(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
