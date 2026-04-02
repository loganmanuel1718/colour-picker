import React, { useState, useEffect } from 'react';
import { Trash2, Download, Loader2, FolderHeart } from 'lucide-react';
import { getUserLibrary, deleteUserSave } from './utils/storage';
import './ExploreGallery.css'; 

export default function MyLibrary({ activeTab, onLoadData }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      const loaded = await getUserLibrary(activeTab);
      setItems(loaded);
      setLoading(false);
    };

    fetchLibrary();
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this save?")) {
      const success = await deleteUserSave(id);
      if (success) {
        setItems(items.filter(item => item.id !== id));
      }
    }
  };

  if (loading) {
    return (
      <div className="explore-empty">
        <Loader2 className="animate-spin" size={48} color="#3b82f6" />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Opening your vault...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="explore-empty">
        <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <FolderHeart size={40} color="#94a3b8" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#334155' }}>Your library is empty</h2>
        <p style={{ color: '#64748b' }}>Save your favorite {activeTab}s to see them here.</p>
      </div>
    );
  }

  return (
    <div className="explore-gallery-wrapper">
      <div className="explore-gallery-grid">
        {items.map(item => (
          <div key={item.id} className="gallery-card">
            <div className="gallery-card-header">
              <h3 className="gallery-title">{item.name}</h3>
              <span className="gallery-date">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>

            {activeTab === 'palette' && (
              <div className="gallery-preview-palette">
                {item.data.map((c, idx) => (
                  <div key={idx} style={{ backgroundColor: c.hex, flex: 1 }} title={c.hex} />
                ))}
              </div>
            )}

            {activeTab === 'gradient' && item.data && item.data.styleObj && (
              <div className="gallery-preview-gradient" style={item.data.styleObj} />
            )}
            
            <div className="gallery-card-footer">
              <div className="gallery-actions" style={{ width: '100%', justifyContent: 'space-between' }}>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="gallery-btn btn-load"
                  style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                  title="Delete Save"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button 
                  onClick={() => onLoadData(item.data)} 
                  className="gallery-btn btn-load"
                  title="Load into Editor"
                >
                  <Download size={16} /> Load
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
