import React, { useState, useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Copy } from 'lucide-react';
import './GradientMaker.css';

export default function GlassMaker({ colors, setToastMessage }) {
  const [glassColor, setGlassColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(25);
  const [blur, setBlur] = useState(12);
  const [outlineSize, setOutlineSize] = useState(1);
  const [outlineAlpha, setOutlineAlpha] = useState(30);
  const [shadowAlpha, setShadowAlpha] = useState(37);

  const mainRef = useRef(null);
  const glassRef = useRef(null);

  // Floating & Stagger animation
  useGSAP(() => {
    // Floating animation
    gsap.to(glassRef.current, {
      y: -15,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Staggered entry
    gsap.fromTo(".control-group", 
      { x: 30, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, { scope: mainRef });

  // Deriving background mesh natively from palette to visualize the blur beautifully
  const bgStyles = useMemo(() => {
    if (!colors || colors.length === 0) return { background: '#f8fafc' };
    const bgColor = colors[0].hex;
    let radials = [];
    const targetColors = colors.length > 1 ? colors.slice(1) : colors;
    
    targetColors.forEach((colorObj, i) => {
      const color = colorObj.hex;
      // Deterministic layout for static glass background based on array length so jumping tabs doesn't shuffle it aggressively
      const px = ((i * 37) % 80) + 10;
      const py = ((i * 53) % 80) + 10;
      const extent = 45 + ((i * 10) % 35);
      const transparentFader = color + '00';
      radials.push(`radial-gradient(at ${px}% ${py}%, ${color} 0px, ${transparentFader} ${extent}%)`);
    });
    
    const bgImageVal = radials.join(',\n  ');
    return {
      backgroundColor: bgColor,
      backgroundImage: bgImageVal.replace(/\n|  /g, ' ')
    };
  }, [colors]);

  const cssString = useMemo(() => {
    // RGB extraction natively
    const r = parseInt(glassColor.slice(1, 3), 16) || 255;
    const g = parseInt(glassColor.slice(3, 5), 16) || 255;
    const b = parseInt(glassColor.slice(5, 7), 16) || 255;
    const alphaVal = (opacity / 100).toFixed(2);
    const outlineVal = (outlineAlpha / 100).toFixed(2);
    const shadowVal = (shadowAlpha / 100).toFixed(2);
    
    return `background: rgba(${r}, ${g}, ${b}, ${alphaVal});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: 16px;
border: ${outlineSize}px solid rgba(255, 255, 255, ${outlineVal});
box-shadow: 0 4px 30px rgba(0, 0, 0, ${shadowVal});`;
  }, [glassColor, opacity, blur, outlineSize, outlineAlpha, shadowAlpha]);

  const glassStyleObj = useMemo(() => {
    const r = parseInt(glassColor.slice(1, 3), 16) || 255;
    const g = parseInt(glassColor.slice(3, 5), 16) || 255;
    const b = parseInt(glassColor.slice(5, 7), 16) || 255;
    const alphaVal = opacity / 100;
    const outlineVal = outlineAlpha / 100;
    const shadowVal = shadowAlpha / 100;

    return {
      background: `rgba(${r}, ${g}, ${b}, ${alphaVal})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderRadius: '16px',
      border: `${outlineSize}px solid rgba(255, 255, 255, ${outlineVal})`,
      boxShadow: `0 4px 30px rgba(0, 0, 0, ${shadowVal})`,
      padding: '2.5rem',
      color: '#ffffff', // Usually white text looks best on glass, but depends on background tint
      textShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      width: '340px',
      textAlign: 'center',
      fontFamily: 'var(--font-primary)',
      transition: 'all 0.1s ease'
    };
  }, [glassColor, opacity, blur, outlineSize, outlineAlpha, shadowAlpha]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cssString).then(() => {
      setToastMessage("Glass CSS Copied to clipboard!");
      setTimeout(() => setToastMessage(null), 2500);
    });
  };

  return (
    <div className="gradient-maker" ref={mainRef}>
      <div className="gradient-preview-container" style={{ ...bgStyles, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Render internal text dynamically scaling using contrast or shadow to guarantee readability across all opacities */}
        <div style={glassStyleObj} ref={glassRef}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Glassmorphism</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 400 }}>
            Modern transparency seamlessly layered directly over your live colour palette.
          </p>
        </div>
      </div>

      <div className="gradient-controls">
        <div className="control-group">
          <label>Base Layer</label>
          <div className="node-color-picker">
            <input 
              type="color" 
              value={glassColor}
              onChange={(e) => setGlassColor(e.target.value)}
            />
            <span className="node-hex-label">{glassColor.toUpperCase()}</span>
          </div>
        </div>

        <div className="control-group">
          <label>Transparency</label>
          <div className="slider-container">
            <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(Number(e.target.value))} />
            <span className="slider-value">{opacity}%</span>
          </div>
        </div>

        <div className="control-group">
          <label>Background Blur</label>
          <div className="slider-container">
            <input type="range" min="0" max="64" value={blur} onChange={e => setBlur(Number(e.target.value))} />
            <span className="slider-value">{blur}px</span>
          </div>
        </div>

        <div className="control-group">
          <label>Edge Highlight (Border)</label>
          <div className="slider-container" style={{ marginBottom: '0.5rem' }}>
            <span className="slider-label" style={{ width: '40px' }}>Size:</span>
            <input type="range" min="0" max="5" value={outlineSize} onChange={e => setOutlineSize(Number(e.target.value))} />
            <span className="slider-value">{outlineSize}px</span>
          </div>
          <div className="slider-container">
            <span className="slider-label" style={{ width: '40px' }}>Alpha:</span>
            <input type="range" min="0" max="100" value={outlineAlpha} onChange={e => setOutlineAlpha(Number(e.target.value))} />
            <span className="slider-value">{outlineAlpha}%</span>
          </div>
        </div>

        <div className="control-group">
          <label>Drop Shadow Intensity</label>
          <div className="slider-container">
            <input type="range" min="0" max="100" value={shadowAlpha} onChange={e => setShadowAlpha(Number(e.target.value))} />
            <span className="slider-value">{shadowAlpha}%</span>
          </div>
        </div>

        <div className="control-group" style={{ marginTop: 'auto' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>CSS Output</span>
            <button onClick={handleCopyCode} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }} title="Copy Output">
              <Copy size={16} /> Code
            </button>
          </label>
          <pre className="code-output">{cssString}</pre>
        </div>
      </div>
    </div>
  );
}
