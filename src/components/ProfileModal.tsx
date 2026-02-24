import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  favoritedIds: Set<string>;
  onRemoveFavorite: (key: string) => void;
  onSignOut: () => void;
}

type ResetStatus = 'idle' | 'loading' | 'sent' | 'error';

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  user,
  favoritedIds,
  onRemoveFavorite,
  onSignOut,
}) => {
  const [resetStatus, setResetStatus] = useState<ResetStatus>('idle');
  const [resetError, setResetError] = useState('');

  if (!open) return null;

  const handlePasswordReset = async () => {
    setResetStatus('loading');
    setResetError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email!);
      if (error) {
        setResetError(error.message);
        setResetStatus('error');
      } else {
        setResetStatus('sent');
        setTimeout(() => setResetStatus('idle'), 3000);
      }
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Unknown error');
      setResetStatus('error');
    }
  };

  const handleSignOut = () => {
    onSignOut();
    onClose();
  };

  // Resolve favorites to snack names
  const favoriteSnacks = Array.from(favoritedIds)
    .map((key) => {
      const [restaurant, item] = key.split('|||');
      return { key, restaurant, item };
    })
    .sort((a, b) => a.restaurant.localeCompare(b.restaurant));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2 style={{ margin: '0 0 24px 0', color: 'var(--text-primary)' }}>
          Your Profile
        </h2>

        {/* Email Section */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 600,
              marginBottom: '8px',
              letterSpacing: '0.5px',
            }}
          >
            Email
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            {user.email}
          </div>
        </div>

        {/* Password Reset Section */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={handlePasswordReset}
            disabled={resetStatus === 'loading'}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'var(--disney-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: resetStatus === 'loading' ? 'not-allowed' : 'pointer',
              opacity: resetStatus === 'loading' ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (resetStatus !== 'loading') {
                e.currentTarget.style.backgroundColor = 'var(--disney-blue-dark)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--disney-blue)';
            }}
          >
            {resetStatus === 'loading' ? 'Sending...' : 'Send Password Reset Email'}
          </button>

          {resetStatus === 'sent' && (
            <div
              className="auth-success"
              style={{
                marginTop: '12px',
                padding: '12px 16px',
                backgroundColor: '#e8f5e9',
                borderLeft: '4px solid #4caf50',
                color: '#2e7d32',
                fontSize: '0.9rem',
                borderRadius: '4px',
              }}
            >
              ✓ Check your email for a password reset link
            </div>
          )}

          {resetStatus === 'error' && (
            <div
              className="auth-error"
              style={{
                marginTop: '12px',
                padding: '12px 16px',
                backgroundColor: '#ffebee',
                borderLeft: '4px solid #f44336',
                color: '#c62828',
                fontSize: '0.9rem',
                borderRadius: '4px',
              }}
            >
              ✕ {resetError || 'Failed to send reset email'}
            </div>
          )}
        </div>

        {/* Favorites Section */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 600,
              marginBottom: '12px',
              letterSpacing: '0.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Your Favorites</span>
            {favoriteSnacks.length > 0 && (
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--disney-blue)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {favoriteSnacks.length}
              </span>
            )}
          </div>

          {favoriteSnacks.length === 0 ? (
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
              }}
            >
              No favorites yet — tap ♡ on a snack to save it
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {favoriteSnacks.map(({ key, restaurant, item }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div>
                    <strong>{restaurant}</strong>
                    {item && <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>— {item}</span>}
                  </div>
                  <button
                    onClick={() => onRemoveFavorite(key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontSize: '1.2rem',
                      padding: '4px 8px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#f44336';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                    title="Remove from favorites"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d32f2f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f44336';
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
