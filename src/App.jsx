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
import { initLibrary, saveToLibrary } from './utils/storage';

function App() {
  const [activeTab, setActiveTab] = useState('palette'); // 'palette' or 'gradient'
  const [gradientType, setGradientType] = useState('linear');
  const [viewMode, setViewMode] = useState('create'); // 'create' or 'explore'
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
  }, []);

  // Force viewMode gracefully back to specific layouts if user traverses unsupported global tabs
  useEffect(() => {
    if (activeTab === 'glass' || activeTab === 'contrast') {
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

  const handleExport = () => {
    exportPaletteAsImage(colors);
    setToastMessage("Palette exported to image!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePublish = async () => {
    if (activeTab === 'palette') {
      const success = await saveToLibrary('palette', colors);
      if (success) {
        setToastMessage("Palette published to Community!");
        setViewMode('explore');
      } else {
        setToastMessage("Failed to publish palette.");
      }
    } else if (activeTab === 'gradient') {
      if (gradientRef.current) {
        const payload = gradientRef.current.getExportPayload();
        const success = await saveToLibrary('gradient', payload);
        if (success) {
          setToastMessage("Gradient published to Community!");
          setViewMode('explore');
        } else {
          setToastMessage("Failed to publish gradient.");
        }
      }
    } else {
      setToastMessage("Publishing is only available for Palettes & Gradients currently.");
    }
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
          </div>

          {/* Contextual Action Tooling */}
          <div style={{ flex: 1, display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
             {(activeTab === 'palette' || activeTab === 'gradient') && viewMode === 'create' && (
                <>
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
