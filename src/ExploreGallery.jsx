import React, { useState, useEffect } from 'react';
import { Heart, Download, Loader2 } from 'lucide-react';
import { getLibrary, likeItem, hasLiked } from './utils/storage';
import './ExploreGallery.css';

export default function ExploreGallery({ activeTab, onLoadData }) {
  const [items, setItems] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      const loaded = await getLibrary(activeTab);
      setItems(loaded);
      
      const userLikes = loaded.filter(item => hasLiked(item.id)).map(item => item.id);
      setLikedIds(userLikes);
      setLoading(false);
    };

    fetchGallery();
  }, [activeTab]);

  const handleLike = async (id) => {
    const success = await likeItem(id);
    if (success) {
      setLikedIds([...likedIds, id]);
      setItems(items.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
    }
  };

  if (loading) {
    return (
      <div className="explore-empty">
        <Loader2 className="animate-spin" size={48} color="#3b82f6" />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Fetching from the cloud...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="explore-empty">
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#334155' }}>No community presets yet!</h2>
        <p style={{ color: '#64748b' }}>Be the first to publish a {activeTab} using the upload button above.</p>
      </div>
    );
  }

  return (
    <div className="explore-gallery-wrapper">
      <div className="explore-gallery-grid">
        {items.map(item => {
          const isLiked = likedIds.includes(item.id);
          
          return (
            <div key={item.id} className="gallery-card">
              
              <div className="gallery-card-header">
                <h3 className="gallery-title">{item.name || 'Untitled'}</h3>
                <span className="gallery-date">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>

              {/* Specialized Renderer depending on the Tool Context */}
              {activeTab === 'palette' && (
                <div className="gallery-preview-palette">
                  {item.data.map((c, idx) => (
                    <div key={idx} style={{ backgroundColor: c.hex, flex: 1 }} title={c.hex} />
                  ))}
                </div>
              )}

              {/* Gradient Preview Renderer */}
              {activeTab === 'gradient' && item.data && item.data.styleObj && (
                <div className="gallery-preview-gradient" style={item.data.styleObj} />
              )}
              
              <div className="gallery-card-footer">
                <div className="gallery-actions" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <button 
                    onClick={() => handleLike(item.id)} 
                    className={`gallery-btn btn-like ${isLiked ? 'liked' : ''}`}
                    disabled={isLiked}
                  >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> {item.likes}
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
          );
        })}
      </div>
    </div>
  );
}
