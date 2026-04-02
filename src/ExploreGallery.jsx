import React, { useState, useEffect } from 'react';
import { Heart, Download, Check } from 'lucide-react';
import { getLibrary, likeItem, hasLiked } from './utils/storage';
import './ExploreGallery.css';

export default function ExploreGallery({ activeTab, onLoadData }) {
  const [items, setItems] = useState([]);
  const [likedIds, setLikedIds] = useState([]);

  useEffect(() => {
    // Fetch initial items straight from localStorage depending on the actively selected tool
    const loaded = getLibrary(activeTab);
    setItems(loaded);
    
    // Check locally which items have already been liked
    const userLikes = loaded.filter(item => hasLiked(item.id)).map(item => item.id);
    setLikedIds(userLikes);
  }, [activeTab]);

  const handleLike = (id) => {
    if (likeItem(activeTab, id)) {
      setLikedIds([...likedIds, id]);
      setItems(items.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
    }
  };

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
              
              {/* Specialized Renderer depending on the Tool Context */}
              {activeTab === 'palette' && (
                <div className="gallery-preview-palette">
                  {item.data.map((c, idx) => (
                    <div key={idx} style={{ backgroundColor: c.hex, flex: 1 }} title={c.hex} />
                  ))}
                </div>
              )}

              {/* Gradient Preview Renderer (Simple rendering logic if expanding) */}
              {activeTab === 'gradient' && item.data && item.data.styleObj && (
                <div className="gallery-preview-gradient" style={item.data.styleObj} />
              )}
              
              <div className="gallery-card-footer">
                <div className="gallery-meta">
                  <span className="gallery-date">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="gallery-actions">
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
