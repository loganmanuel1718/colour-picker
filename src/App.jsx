import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { HeartPulse, Layers, Download } from 'lucide-react';
import './App.css';
import Header from './Header';
import ColorColumn from './ColorColumn';
import GradientMaker from './GradientMaker';
import GlassMaker from './GlassMaker';
import ContrastMaker from './ContrastMaker';
import BrandAI from './BrandAI';
import AuthModal from './AuthModal';
import MyLibrary from './MyLibrary';
import ExploreGallery from './ExploreGallery';
import { generateRandomColor } from './utils/colors';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  horizontalListSortingStrategy 
} from '@dnd-kit/sortable';
import { exportPaletteAsImage } from './utils/export';
import { initLibrary, saveToLibrary, saveToUserLibrary } from './utils/storage';
import { supabase } from './utils/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('palette'); // 'palette' or 'gradient'
  const [gradientType, setGradientType] = useState('linear');
  const [viewMode, setViewMode] = useState('create'); // 'create' or 'explore'
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingGradient, setPendingGradient] = useState(null);
  const gradientRef = useRef(null);
  
  // State: array of objects { id, hex, isLocked }
  const [colors, setColors] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const paletteRef = useRef(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum 8px drag before starting sort
      },
    })
  );

  // Initial load stagger animation for palette
  useGSAP(() => {
    if (activeTab === 'palette' && colors.length > 0) {
      gsap.fromTo(".color-column", 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, { scope: paletteRef, dependencies: [activeTab, colors.length === 0] });

  // Initialize library once securely on launch
  useEffect(() => {
    initLibrary();

    // Check for existing session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Force viewMode gracefully back to specific layouts if user traverses unsupported global tabs
  useEffect(() => {
    if (activeTab === 'glass' || activeTab === 'contrast' || activeTab === 'brand-ai') {
      setViewMode('create');
    }
  }, [activeTab]);

  // Initialize and generate palette
  const generatePalette = useCallback(() => {
    setColors(prevColors => {
      if (prevColors.length === 0) {
        return Array.from({ length: 5 }, (_, i) => ({
          id: `col-${Date.now()}-${i}`,
          hex: generateRandomColor(),
          isLocked: false
        }));
      }

      return prevColors.map(color => {
        if (color.isLocked) return color;
        return {
          ...color,
          hex: generateRandomColor()
        };
      });
    });
  }, []);

  // Initial load
  useEffect(() => {
    generatePalette();
  }, [generatePalette]);

  // Spacebar integration
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent generation if pressing space inside an input
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault(); 
        generatePalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generatePalette]);

  // Actions
  const toggleLock = (id) => {
    setColors(prev => prev.map(color => 
      color.id === id ? { ...color, isLocked: !color.isLocked } : color
    ));
  };

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex).then(() => {
      setToastMessage(`${hex} copied!`);
      setTimeout(() => setToastMessage(null), 2500);
    });
  };

  const handleColorChange = (id, newHex) => {
    setColors(prev => prev.map(c => c.id === id ? { ...c, hex: newHex } : c));
  };

  const duplicateColor = (id) => {
    setColors(prev => {
      if (prev.length >= 10) {
        setToastMessage("Maximum 10 colors reached!");
        setTimeout(() => setToastMessage(null), 2500);
        return prev;
      }
      const idx = prev.findIndex(c => c.id === id);
      const newColor = { ...prev[idx], id: `col-${Date.now()}-${Math.random()}` };
      const nextColors = [...prev];
      nextColors.splice(idx + 1, 0, newColor);
      return nextColors;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setColors((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishName, setPublishName] = useState('');

  const handleExport = () => {
    exportPaletteAsImage(colors);
    setToastMessage("Palette exported to image!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePublish = () => {
    if (activeTab === 'palette' || activeTab === 'gradient') {
      setIsPublishing(true);
      setPublishName('');
    } else {
      setToastMessage("Publishing is only available for Palettes & Gradients currently.");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const confirmPublish = async () => {
    if (!publishName.trim()) {
      setToastMessage("Please enter a name for your preset.");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    let success = false;
    if (activeTab === 'palette') {
      success = await saveToLibrary('palette', colors, publishName);
    } else if (activeTab === 'gradient' && gradientRef.current) {
      const payload = gradientRef.current.getExportPayload();
      success = await saveToLibrary('gradient', payload, publishName);
    }

    if (success) {
      setToastMessage(`"${publishName}" published to Community!`);
      setIsPublishing(false);
      setViewMode('explore');
    } else {
      setToastMessage("Failed to publish. Check your connection.");
    }
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveToProfile = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const name = prompt("Name your creation:") || `My ${activeTab}`;
    let success = false;
    if (activeTab === 'palette') {
      success = await saveToUserLibrary('palette', colors, name);
    } else if (activeTab === 'gradient' && gradientRef.current) {
      const payload = gradientRef.current.getExportPayload();
      success = await saveToUserLibrary('gradient', payload, name);
    }

    if (success) {
      setToastMessage(`"${name}" saved to your profile!`);
    } else {
      setToastMessage("Failed to save. Check your connection.");
    }
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleApplyAIPalette = (aiColors) => {
    setColors(aiColors.map(c => ({
      id: c.id,
      hex: c.hex,
      isLocked: false
    })));
    setActiveTab('palette');
    setToastMessage("AI palette applied to generator!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUseContrastColors = (textHex, bgHex) => {
    setColors([
      { id: `col-${Date.now()}-0`, hex: bgHex, isLocked: false },
      { id: `col-${Date.now()}-1`, hex: textHex, isLocked: false },
      { id: `col-${Date.now()}-2`, hex: generateRandomColor(), isLocked: false },
      { id: `col-${Date.now()}-3`, hex: generateRandomColor(), isLocked: false },
      { id: `col-${Date.now()}-4`, hex: generateRandomColor(), isLocked: false },
    ]);
    setActiveTab('palette');
    setToastMessage("Contrast colors applied to palette!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setGradientType={setGradientType}
        onGenerate={generatePalette} 
        onExport={handleExport} 
        onPublish={handlePublish}
        viewMode={viewMode}
        setViewMode={setViewMode}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={() => supabase.auth.signOut()}
      />

      {(activeTab === 'palette' || activeTab === 'gradient') && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ffffff', padding: '0.75rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'relative', zIndex: 5 }}>
          
          {/* Spacer logic balancing the flex layout */}
          <div style={{ flex: 1 }}></div>

          <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setViewMode('create')}
              style={{ fontFamily: 'var(--font-primary)', padding: '0.4rem 2.5rem', borderRadius: '6px', border: 'none', background: viewMode === 'create' ? 'white' : 'transparent', color: viewMode === 'create' ? '#3b82f6' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: viewMode === 'create' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
            >
              Create
            </button>
            <button 
              onClick={() => setViewMode('explore')}
              style={{ fontFamily: 'var(--font-primary)', padding: '0.4rem 2.5rem', borderRadius: '6px', border: 'none', background: viewMode === 'explore' ? 'white' : 'transparent', color: viewMode === 'explore' ? '#3b82f6' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: viewMode === 'explore' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
            >
              Explore Community
            </button>
            {user && (
              <button 
                onClick={() => setViewMode('my-library')}
                style={{ fontFamily: 'var(--font-primary)', padding: '0.4rem 2.5rem', borderRadius: '6px', border: 'none', background: viewMode === 'my-library' ? 'white' : 'transparent', color: viewMode === 'my-library' ? '#3b82f6' : '#64748b', fontWeight: 'bold', cursor: 'pointer', boxShadow: viewMode === 'my-library' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
              >
                My Library
              </button>
            )}
          </div>

          {/* Contextual Action Tooling */}
          <div style={{ flex: 1, display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
             {(activeTab === 'palette' || activeTab === 'gradient') && viewMode === 'create' && (
                <>
                  <button 
                    onClick={handleSaveToProfile}
                    title="Save to your Profile"
                    style={{ background: '#eff6ff', color: '#3b82f6', border: '2px solid #3b82f6', padding: '0.4rem 1rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={16} /> {user ? 'Save to Profile' : 'Sign in to Save'}
                  </button>

                  <button 
                    onClick={handlePublish}
                    title="Publish to Community"
                    style={{ background: '#fef2f2', color: '#ef4444', border: '2px solid #ef4444', padding: '0.4rem 1rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <HeartPulse size={16} /> Publish
                  </button>

                  {activeTab === 'palette' && (
                    <>
                      <button 
                        onClick={() => { setGradientType('mesh'); setActiveTab('gradient'); }}
                        title="Turn into Mesh"
                        style={{ background: 'white', color: '#8b5cf6', border: '2px solid #8b5cf6', padding: '0.4rem 1rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Layers size={16} /> Mesh it!
                      </button>

                      <button 
                        onClick={handleExport}
                        title="Export Palette"
                        style={{ background: 'white', color: '#3b82f6', border: '2px solid #3b82f6', padding: '0.4rem 1rem', borderRadius: '999px', fontFamily: 'var(--font-primary)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={16} /> Export
                      </button>
                    </>
                  )}
                </>
             )}
          </div>
        </div>
      )}
      
      {viewMode === 'explore' ? (
        <ExploreGallery activeTab={activeTab} onLoadData={(data) => { 
          if(activeTab === 'palette') {
            setColors(data); 
          } else if(activeTab === 'gradient') {
            setPendingGradient(data);
          }
          setViewMode('create'); 
        }} />
      ) : viewMode === 'my-library' ? (
        <MyLibrary activeTab={activeTab} onLoadData={(data) => {
          if(activeTab === 'palette') {
            setColors(data);
          } else if(activeTab === 'gradient') {
            setPendingGradient(data);
          }
          setViewMode('create');
        }} />
      ) : activeTab === 'palette' ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <main className="palette-container" ref={paletteRef}>
            <SortableContext 
              items={colors.map(c => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {colors.map((color, idx) => (
                <ColorColumn
                  key={color.id}
                  id={color.id}
                  index={idx}
                  color={color.hex}
                  isLocked={color.isLocked}
                  onToggleLock={() => toggleLock(color.id)}
                  onCopy={copyToClipboard}
                  onDuplicate={() => duplicateColor(color.id)}
                  onChangeColor={(newHex) => handleColorChange(color.id, newHex)}
                />
              ))}
            </SortableContext>
          </main>
        </DndContext>
      ) : activeTab === 'gradient' ? (
        <GradientMaker 
          ref={gradientRef}
          colors={colors} 
          setToastMessage={setToastMessage}
          gradientType={gradientType}
          setGradientType={setGradientType}
          pendingGradient={pendingGradient}
          setPendingGradient={setPendingGradient}
        />
      ) : activeTab === 'glass' ? (
        <GlassMaker 
          colors={colors} 
          setToastMessage={setToastMessage}
        />
      ) : activeTab === 'brand-ai' ? (
        <BrandAI 
          onApplyPalette={handleApplyAIPalette}
          setToastMessage={(msg) => {
             setToastMessage(msg);
             setTimeout(() => setToastMessage(null), 2500);
          }}
        />
      ) : (
        <ContrastMaker 
          colors={colors} 
          onUseInPalette={handleUseContrastColors}
        />
      )}

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} />
      )}

      {/* Community Publish Modal */}
      {isPublishing && (
        <div className="publish-overlay">
          <div className="publish-modal">
            <h2>Give it a name</h2>
            <p>Your {activeTab} will be shared with the community. How would you describe this vibe?</p>
            
            <div className="publish-field">
              <label>Preset Name</label>
              <input 
                autoFocus
                type="text" 
                className="publish-input"
                placeholder="e.g. Neon Nights..."
                value={publishName}
                onChange={(e) => setPublishName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmPublish()}
              />
            </div>

            <div className="publish-actions">
              <button 
                className="btn-publish-cancel" 
                onClick={() => setIsPublishing(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-publish-confirm" 
                onClick={confirmPublish}
              >
                Publish Ready
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => setUser(user)}
        />
      )}
    </div>
  );
}

function Toast({ message }) {
  const toastRef = useRef(null);
  
  useGSAP(() => {
    gsap.fromTo(toastRef.current, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  }, { scope: toastRef });

  return (
    <div className="toast-container" ref={toastRef}>
      <div style={{ backgroundColor: '#22c55e', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>✓</span>
      </div>
      {message}
    </div>
  );
}

export default App;
