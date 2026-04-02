import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import { hexToHslStruct, hslToHex, calculateContrastRatio, generateRandomColor } from './utils/colors';
import './GradientMaker.css'; /* Reusing standard core layout */
import './ContrastMaker.css';

export default function ContrastMaker({ colors }) {
  // Initialize from palette if available (top two colours structurally map directly if length >= 2)
  const [textHsl, setTextHsl] = useState({ h: 220, s: 10, l: 15 });
  const [bgHsl, setBgHsl] = useState({ h: 180, s: 50, l: 95 });
  const [displayRatio, setDisplayRatio] = useState(0);

  const mainRef = useRef(null);
  const ratioRef = useRef(null);

  const textHex = useMemo(() => hslToHex(textHsl.h, textHsl.s, textHsl.l), [textHsl]);
  const bgHex = useMemo(() => hslToHex(bgHsl.h, bgHsl.s, bgHsl.l), [bgHsl]);
  const contrastNum = useMemo(() => calculateContrastRatio(textHex, bgHex), [textHex, bgHex]);

  // Counter animation
  useGSAP(() => {
    const obj = { val: displayRatio };
    gsap.to(obj, {
      val: contrastNum,
      duration: 0.5,
      onUpdate: () => setDisplayRatio(obj.val),
      ease: "power2.out"
    });
  }, { dependencies: [contrastNum] });

  // Badge pop animation
  useGSAP(() => {
    gsap.fromTo(".wcag-badge", 
      { scale: 0.8, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, { scope: mainRef });

  // Track synchronization on mount
  useEffect(() => {
    if (colors && colors.length >= 2) {
      // Background first (color[0]), text second (color[1]) maps more logically visually
      setBgHsl(hexToHslStruct(colors[0].hex));
      setTextHsl(hexToHslStruct(colors[1].hex));
    } else if (colors && colors.length === 1) {
      setBgHsl(hexToHslStruct(colors[0].hex));
    }
  }, []);

  const randomizeAll = () => {
    setTextHsl(hexToHslStruct(generateRandomColor()));
    setBgHsl(hexToHslStruct(generateRandomColor()));
  };

  const reverseColors = () => {
    setTextHsl(bgHsl);
    setBgHsl(textHsl);
  };

  const contrastRatio = contrastNum.toFixed(2);

  // WCAG Scoring Badges
  const passesAASmall = contrastNum >= 4.5;
  const passesAALarge = contrastNum >= 3.0; // Large text is >= 18pt or >= 14pt bold
  const passesAAASmall = contrastNum >= 7.0;
  
  const renderBadge = (label, passes) => (
    <div className={`wcag-badge ${passes ? 'pass' : 'fail'}`}>
      <span>{label}</span>
      {passes ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
    </div>
  );

  return (
    <div className="gradient-maker" ref={mainRef}>
      
      {/* Massive Visual Sandbox Canvas */}
      <div 
        className="gradient-preview-container contrast-canvas" 
        style={{ 
          backgroundColor: bgHex, 
          color: textHex,
          transition: 'background-color 0.15s ease, color 0.15s ease'
        }}
      >
        <div className="contrast-demo-box">
          <h1 className="contrast-huge-text">Aa</h1>
          <div className="contrast-score-display">
            <span className="contrast-number">{displayRatio.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="gradient-controls contrast-controls">
        
        {/* WCAG Score Badges - Moved to Sidebar */}
        <div className="control-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ marginBottom: '1rem', display: 'block' }}>Contrast Accessibility</label>
          <div className="wcag-badge-grid sidebar-badges">
            {renderBadge('AA Small (4.5)', passesAASmall)}
            {renderBadge('AA Large (3.0)', passesAALarge)}
            {renderBadge('AAA (7.0)', passesAAASmall)}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '1rem 0' }} />

        {/* TEXT COLOR CONTROLLER */}
        <div className="control-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Text Color</h3>
            <span className="node-hex-label">{textHex.toUpperCase()}</span>
          </div>
          
          <div className="slider-container">
            <span className="slider-label" style={{ width: '30px' }}>H</span>
            <input type="range" min="0" max="360" value={textHsl.h} onChange={e => setTextHsl({...textHsl, h: Number(e.target.value)})} />
            <span className="slider-value">{textHsl.h}°</span>
          </div>
          <div className="slider-container">
            <span className="slider-label" style={{ width: '30px' }}>S</span>
            <input type="range" min="0" max="100" value={textHsl.s} onChange={e => setTextHsl({...textHsl, s: Number(e.target.value)})} />
            <span className="slider-value">{textHsl.s}%</span>
          </div>
          <div className="slider-container">
            <span className="slider-label" style={{ width: '30px' }}>L</span>
            <input type="range" min="0" max="100" value={textHsl.l} onChange={e => setTextHsl({...textHsl, l: Number(e.target.value)})} />
            <span className="slider-value">{textHsl.l}%</span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '0.5rem 0' }} />

        {/* BACKGROUND COLOR CONTROLLER */}
        <div className="control-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Background Color</h3>
            <span className="node-hex-label">{bgHex.toUpperCase()}</span>
          </div>
          
          <div className="slider-container">
            <span className="slider-label" style={{ width: '30px' }}>H</span>
            <input type="range" min="0" max="360" value={bgHsl.h} onChange={e => setBgHsl({...bgHsl, h: Number(e.target.value)})} />
            <span className="slider-value">{bgHsl.h}°</span>
          </div>
          <div className="slider-container">
            <span className="slider-label" style={{ width: '30px' }}>S</span>
            <input type="range" min="0" max="100" value={bgHsl.s} onChange={e => setBgHsl({...bgHsl, s: Number(e.target.value)})} />
            <span className="slider-value">{bgHsl.s}%</span>
          </div>
          <div className="slider-container">
            <span className="slider-label" style={{ width: '30px' }}>L</span>
            <input type="range" min="0" max="100" value={bgHsl.l} onChange={e => setBgHsl({...bgHsl, l: Number(e.target.value)})} />
            <span className="slider-value">{bgHsl.l}%</span>
          </div>
        </div>

        <div className="control-group" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={reverseColors}
            style={{ 
              background: 'white', border: '1px solid #e2e8f0', padding: '0.75rem', 
              borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center',
              alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#475569'
            }}
          >
            <RefreshCcw size={16} /> Swap Colors
          </button>
          
          <button 
            onClick={randomizeAll}
            style={{ 
              background: '#3b82f6', border: 'none', padding: '0.75rem', 
              borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center',
              alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'white'
            }}
          >
            Randomize Contrast
          </button>
        </div>

      </div>
    </div>
  );
}
