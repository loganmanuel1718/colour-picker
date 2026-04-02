import React, { useState } from 'react';
import { supabase } from './utils/supabase';
import { X, Mail, Lock, User } from 'lucide-react';
import './AuthModal.css';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onAuthSuccess(data.user);
      onClose();
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal" style={{ position: 'relative' }}>
        <button className="auth-close" onClick={onClose} style={{ border: 'none', background: 'none' }}>
          <X size={20} />
        </button>

        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back!' : 'Join Chromator'}</h2>
          <p>{isLogin ? 'Sign in to access your personal library' : 'Create an account to save your favorite palettes'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={16} 
                color="#94a3b8" 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
              />
              <input 
                type="email" 
                className="auth-input" 
                placeholder="you@example.com" 
                style={{ paddingLeft: '38px', width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={16} 
                color="#94a3b8" 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
              />
              <input 
                type="password" 
                className="auth-input" 
                placeholder="••••••••" 
                style={{ paddingLeft: '38px', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="btn-auth-submit" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
