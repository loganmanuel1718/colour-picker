import React from 'react';
import { Palette, Sparkles, Download, Layers, HeartPulse } from 'lucide-react';

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
  onLogout
}) {
  return (
    <header className="header" style={{ padding: '1rem 2rem' }}>
      <div className="brand" style={{ flex: 1 }}>
        <span className="brand-emoji" style={{ fontSize: '28px', lineHeight: '1' }}>😉</span>
        <span>Chromator</span>
      </div>
      
      {/* Centered Tab Switcher */}
      <div 
        style={{ 
          background: '#f1f5f9', 
          padding: '0.4rem', 
          borderRadius: '999px',
          display: 'flex',
          gap: '0.5rem',
          margin: '0 2rem'
        }}
        className="nav-tabs"
      >
        <button onClick={() => setActiveTab('palette')} style={{ background: activeTab === 'palette' ? 'white' : 'transparent', color: activeTab === 'palette' ? '#3b82f6' : '#64748b', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'palette' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Palette</button>
        <button onClick={() => setActiveTab('gradient')} style={{ background: activeTab === 'gradient' ? 'white' : 'transparent', color: activeTab === 'gradient' ? '#3b82f6' : '#64748b', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'gradient' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Gradient</button>
        <button onClick={() => setActiveTab('glass')} style={{ background: activeTab === 'glass' ? 'white' : 'transparent', color: activeTab === 'glass' ? '#3b82f6' : '#64748b', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'glass' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Glass</button>
        <button onClick={() => setActiveTab('contrast')} style={{ background: activeTab === 'contrast' ? 'white' : 'transparent', color: activeTab === 'contrast' ? '#3b82f6' : '#64748b', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'contrast' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Contrast</button>
        <button onClick={() => setActiveTab('brand-ai')} style={{ background: activeTab === 'brand-ai' ? 'white' : 'transparent', color: activeTab === 'brand-ai' ? '#3b82f6' : '#64748b', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'brand-ai' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>Brand AI</button>
      </div>

      <div className="header-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
        {/* Tip removed to be moved to toolbar */}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{user.email}</span>
            <button 
              onClick={onLogout}
              style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
