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

  const addColor = () => {
    setColors(prev => {
      if (prev.length >= 12) {
        setToastMessage("Maximum 12 colors supported!");
        setTimeout(() => setToastMessage(null), 2500);
        return prev;
      }
      return [...prev, {
        id: `col-${Date.now()}`,
        hex: generateRandomColor(),
        isLocked: false
      }];
    });
  };

  const removeColor = (id) => {
    setColors(prev => {
      if (prev.length <= 2) {
        setToastMessage("Minimum 2 colors required!");
        setTimeout(() => setToastMessage(null), 2500);
        return prev;
      }
      return prev.filter(c => c.id !== id);
    });
  };

  const duplicateColor = (id) => {
    setColors(prev => {
      if (prev.length >= 12) {
        setToastMessage("Maximum 12 colors supported!");
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

  const [namingModal, setNamingModal] = useState({ isOpen: false, mode: 'publish', name: '' });

  const handleExport = () => {
    exportPaletteAsImage(colors);
    setToastMessage("Palette exported to image!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePublish = () => {
    if (activeTab === 'palette' || activeTab === 'gradient') {
      setNamingModal({ isOpen: true, mode: 'publish', name: '' });
    } else {
      setToastMessage("Publishing is only available for Palettes & Gradients currently.");
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const confirmNamingAction = async () => {
    if (!namingModal.name.trim()) {
      setToastMessage("Please enter a name for your preset.");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    let result = { success: false, error: 'Operation failed' };
    const { mode, name } = namingModal;

    if (mode === 'publish') {
      if (activeTab === 'palette') {
        result = await saveToLibrary('palette', colors, name);
      } else if (activeTab === 'gradient' && gradientRef.current) {
        const payload = gradientRef.current.getExportPayload();
        result = await saveToLibrary('gradient', payload, name);
      }
    } else if (mode === 'save') {
      if (activeTab === 'palette') {
        result = await saveToUserLibrary('palette', colors, name);
      } else if (activeTab === 'gradient' && gradientRef.current) {
        const payload = gradientRef.current.getExportPayload();
        result = await saveToUserLibrary('gradient', payload, name);
      }
    }

    if (result.success) {
      setToastMessage(mode === 'publish' ? `"${name}" published to Community!` : `"${name}" saved to your profile!`);
      setNamingModal({ isOpen: false, mode: 'publish', name: '' });
      if (mode === 'publish') setViewMode('explore');
    } else {
      setToastMessage(`Error: ${result.error || 'Failed to save.'}`);
    }
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveToProfile = () => {
    try {
      console.log('触发 handleSaveToProfile, 用户状态:', user);
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setNamingModal({ isOpen: true, mode: 'save', name: '' });
      setToastMessage("Opening save dialogue...");
      setTimeout(() => setToastMessage(null), 1500);
    } catch (err) {
      console.error('handleSaveToProfile 发生错误:', err);
    }
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
        <div className="sub-toolbar">
          
          {/* Left: Spacebar tip */}
          <div className="sub-toolbar-left">
            {activeTab === 'palette' && viewMode === 'create' && (
              <span className="space-tip">
                <span className="space-key">Space</span>
                <span className="space-label">to Generate</span>
              </span>
            )}
          </div>

          {/* Center: View mode switcher */}
          <div className="sub-toolbar-center">
            <div className="view-switch">
              <button
                onClick={() => setViewMode('create')}
                className={`view-btn ${viewMode === 'create' ? 'active' : ''}`}
              >
                Create
              </button>
              <button
                onClick={() => setViewMode('explore')}
                className={`view-btn ${viewMode === 'explore' ? 'active' : ''}`}
              >
                Explore
              </button>
              {user && (
                <button
                  onClick={() => setViewMode('my-library')}
                  className={`view-btn ${viewMode === 'my-library' ? 'active' : ''}`}
                >
                  My Library
                </button>
              )}
            </div>
          </div>

          {/* Right: Contextual action buttons */}
          {(activeTab === 'palette' || activeTab === 'gradient') && viewMode === 'create' && (
            <div className="sub-toolbar-right">
              <button onClick={handleSaveToProfile} className="toolbar-btn toolbar-btn--save">
                <Download size={15} />
                <span>{user ? 'Save' : 'Sign in'}</span>
              </button>

              <button onClick={handlePublish} className="toolbar-btn toolbar-btn--publish">
                <HeartPulse size={15} />
                <span>Publish</span>
              </button>

              {activeTab === 'palette' && (
                <>
                  <button
                    onClick={() => { setGradientType('mesh'); setActiveTab('gradient'); }}
                    className="toolbar-btn toolbar-btn--mesh"
                  >
                    <Layers size={15} />
                    <span>Mesh it!</span>
                  </button>

                  <button onClick={handleExport} className="toolbar-btn toolbar-btn--export">
                    <Download size={15} />
                    <span>Export</span>
                  </button>
                </>
              )}
            </div>
          )}
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
                  onRemove={() => removeColor(color.id)}
                  onChangeColor={(newHex) => handleColorChange(color.id, newHex)}
                />
              ))}
              
              {colors.length < 12 && (
                <button 
                  className="add-column-btn" 
                  onClick={addColor}
                  title="Add Color"
                >
                  <div className="add-column-plus">+</div>
                </button>
              )}
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

      {/* Community Publish / Save Modal */}
      {namingModal.isOpen && (
        <div className="publish-overlay" style={{ zIndex: 600 }}>
          <div className="publish-modal">
            <h2>{namingModal.mode === 'publish' ? 'Community Ready?' : 'Save to Profile'}</h2>
            <p>
              {namingModal.mode === 'publish' 
                ? `Your ${activeTab} will be shared with the community. How would you describe this vibe?`
                : `Give your ${activeTab} a name so you can find it later in your library.`}
            </p>
            
            <div className="publish-field">
              <label>Preset Name</label>
              <input 
                autoFocus
                type="text" 
                className="publish-input"
                placeholder={namingModal.mode === 'publish' ? 'e.g. Neon Nights...' : 'e.g. Brand Primary...'}
                value={namingModal.name}
                onChange={(e) => setNamingModal({ ...namingModal, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && confirmNamingAction()}
              />
            </div>

            <div className="publish-actions">
              <button 
                className="btn-publish-cancel" 
                onClick={() => setNamingModal({ ...namingModal, isOpen: false })}
              >
                Cancel
              </button>
              <button 
                className="btn-publish-confirm" 
                onClick={confirmNamingAction}
              >
                {namingModal.mode === 'publish' ? 'Publish Ready' : 'Secure Save'}
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
