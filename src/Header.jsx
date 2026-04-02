import React from 'react';
import { Palette, Sparkles, Download, Layers, HeartPulse } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, setGradientType, onGenerate, onExport, onPublish, viewMode }) {
  return (
    <header className="header" style={{ padding: '1rem 2rem' }}>
      <div className="brand" style={{ flex: 1 }}>
        <Palette className="brand-icon" size={28} strokeWidth={2.5} />
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
        <button 
          onClick={() => setActiveTab('palette')}
          style={{
            background: activeTab === 'palette' ? 'white' : 'transparent',
            color: activeTab === 'palette' ? '#3b82f6' : '#64748b',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '999px',
            fontFamily: 'var(--font-primary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'palette' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          Palette
        </button>
        <button 
          onClick={() => setActiveTab('gradient')}
          style={{
            background: activeTab === 'gradient' ? 'white' : 'transparent',
            color: activeTab === 'gradient' ? '#3b82f6' : '#64748b',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '999px',
            fontFamily: 'var(--font-primary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'gradient' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          Gradient
        </button>
        <button 
          onClick={() => setActiveTab('glass')}
          style={{
            background: activeTab === 'glass' ? 'white' : 'transparent',
            color: activeTab === 'glass' ? '#3b82f6' : '#64748b',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '999px',
            fontFamily: 'var(--font-primary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'glass' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          Glass
        </button>
        <button 
          onClick={() => setActiveTab('contrast')}
          style={{
            background: activeTab === 'contrast' ? 'white' : 'transparent',
            color: activeTab === 'contrast' ? '#3b82f6' : '#64748b',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '999px',
            fontFamily: 'var(--font-primary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'contrast' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          Contrast
        </button>
      </div>

      <div className="header-actions" style={{ flex: 1, justifyContent: 'flex-end' }}>
        
        {activeTab === 'palette' && viewMode === 'create' && (
          <span className="helper-text">Press Spacebar to generate</span>
        )}

        {viewMode === 'create' && (
          <button className="btn-generate" onClick={onGenerate}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Generate {activeTab === 'gradient' ? 'Colors' : ''}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
