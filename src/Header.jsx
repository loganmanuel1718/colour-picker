import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const tabs = [
  { id: 'palette', label: 'Palette' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'glass', label: 'Glass' },
  { id: 'contrast', label: 'Contrast' },
  { id: 'brand-ai', label: 'Brand AI' },
];

const tabBtnStyle = (active) => ({
  background: active ? 'white' : 'transparent',
  color: active ? '#3b82f6' : '#64748b',
  border: 'none',
  padding: '0.5rem 1.25rem',
  borderRadius: '999px',
  fontFamily: 'var(--font-primary)',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
  whiteSpace: 'nowrap',
  fontSize: '0.9rem',
});

export default function Header({
  activeTab,
  setActiveTab,
  setGradientType,
  onGenerate,
  onExport,
  onPublish,
  viewMode,
  user,
  onOpenAuth,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMenuOpen(false);
  };

  return (
    <header className="header" style={{ padding: '0.875rem 1.25rem' }}>
      {/* Brand */}
      <div className="brand" style={{ flex: '0 0 auto' }}>
        <span className="brand-emoji" style={{ fontSize: '26px', lineHeight: '1' }}>😉</span>
        <span>Chromator</span>
      </div>

      {/* Desktop tab switcher — hidden on mobile */}
      <div className="header-tabs-desktop">
        <div className="nav-tabs-inner">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => handleTabClick(t.id)} style={tabBtnStyle(activeTab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right-side actions */}
      <div className="header-actions" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="user-email-label" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
              {user.email}
            </span>
            <button
              onClick={onLogout}
              style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0.5rem 1.1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
          >
            Sign In
          </button>
        )}

        {/* Hamburger — mobile only */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.4rem', display: 'flex', alignItems: 'center' }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {menuOpen && (
        <div className="mobile-nav-dropdown">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: activeTab === t.id ? '#eff6ff' : 'transparent',
                color: activeTab === t.id ? '#3b82f6' : '#475569',
                border: 'none',
                padding: '0.85rem 1.25rem',
                fontFamily: 'var(--font-primary)',
                fontWeight: activeTab === t.id ? '700' : '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderRadius: '10px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
