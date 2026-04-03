import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import { hexToHslStruct, hslToHex, calculateContrastRatio, generateRandomColor } from './utils/colors';
import './GradientMaker.css'; /* Reusing standard core layout */
import './ContrastMaker.css';

export default function ContrastMaker({ colors, onUseInPalette }) {
  // Initialize from palette if available (top two colours structurally map directly if length >= 2)
  const [textHsl, setTextHsl] = useState({ h: 220, s: 10, l: 15 });
  const [bgHsl, setBgHsl] = useState({ h: 180, s: 50, l: 95 });
  const [displayRatio, setDisplayRatio] = useState(0);

  const mainRef = useRef(null);
  const ratioRef = useRef(null);

  const textHex = useMemo(() => hslToHex(textHsl.h, textHsl.s, textHsl.l), [textHsl]);
  const bgHex = useMemo(() => hslToHex(bgHsl.h, bgHsl.s, bgHsl.l), [bgHsl]);
  const contrastNum = useMemo(() => calculateContrastRatio(textHex, bgHex), [textHex, bgHex]);

  // WCAG Scoring Badges
  const passesAASmall = contrastNum >= 4.5;
  const passesAALarge = contrastNum >= 3.0; // Large text is >= 18pt or >= 14pt bold
  const passesAAASmall = contrastNum >= 7.0;

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

  // Badge pop animation - triggers on mount and when thresholds are crossed
  useGSAP(() => {
    gsap.fromTo(".wcag-badge", 
      { scale: 0.8, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, { scope: mainRef, dependencies: [passesAASmall, passesAALarge, passesAAASmall] });

  // Track synchronization on mount
  useEffect(() => {
    if (colors && colors.length >= 2) {
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

  const BADGE_INFO = {
    'AA Small': {
      ratio: '4.5:1',
      summary: 'Normal text on any background',
      detail: 'Required by WCAG 2.1 Level AA for body text and UI components under 18pt (or 14pt bold). The most common accessibility standard enforced by law in many countries.',
    },
    'AA Large': {
      ratio: '3.0:1',
      summary: 'Large or bold text',
      detail: 'Required for text that is at least 18pt (24px) or 14pt bold (≈18.67px bold). Large text is easier to read so a lower ratio is acceptable.',
    },
    'AAA': {
      ratio: '7.0:1',
      summary: 'Enhanced — maximum legibility',
      detail: 'WCAG 2.1 Level AAA, the highest standard. Recommended for long-form reading, medical, or government content. Guarantees readability for users with severe visual impairments.',
    },
  };

  const renderBadge = (key, passes) => {
    const info = BADGE_INFO[key];
    const label = `${key} (${info.ratio})`;
    return (
      <div className="wcag-badge-wrapper" key={key}>
        <div className={`wcag-badge ${passes ? 'pass' : 'fail'}`}>
          <span>{label}</span>
          {passes ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
        </div>
        <div className="wcag-tooltip" role="tooltip">
          <div className="wcag-tooltip-header">
            <span className="wcag-tooltip-ratio">{info.ratio}</span>
            <span className={`wcag-tooltip-status ${passes ? 'pass' : 'fail'}`}>
              {passes ? '✓ Passes' : '✗ Fails'}
            </span>
          </div>
          <div className="wcag-tooltip-summary">{info.summary}</div>
          <p className="wcag-tooltip-detail">{info.detail}</p>
        </div>
      </div>
    );
  };

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
            {renderBadge('AA Small', passesAASmall)}
            {renderBadge('AA Large', passesAALarge)}
            {renderBadge('AAA', passesAAASmall)}
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={reverseColors}
              style={{ 
                flex: 1, background: 'white', border: '1px solid #e2e8f0', padding: '0.75rem', 
                borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center',
                alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#475569'
              }}
            >
              <RefreshCcw size={16} /> Swap
            </button>
            
            <button 
              onClick={() => onUseInPalette?.(textHex, bgHex)}
              style={{ 
                flex: 1.5, background: '#f0f9ff', border: '1px solid #0ea5e9', padding: '0.75rem', 
                borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center',
                alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#0369a1'
              }}
            >
              Use in Palette
            </button>
          </div>
          
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
