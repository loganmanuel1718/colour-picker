import React, { useState, useMemo } from 'react';
import { Copy, Plus, Minus, MoveHorizontal, Type } from 'lucide-react';
import './FluidMaker.css';

const SCALES = {
  1.067: "Minor Second",
  1.125: "Major Second",
  1.200: "Minor Third",
  1.250: "Major Third",
  1.333: "Perfect Fourth",
  1.414: "Augmented Fourth",
  1.500: "Perfect Fifth",
  1.618: "Golden Ratio"
};

const STEPS = [
  { id: 'h1', name: 'Heading 1', level: 5 },
  { id: 'h2', name: 'Heading 2', level: 4 },
  { id: 'h3', name: 'Heading 3', level: 3 },
  { id: 'h4', name: 'Heading 4', level: 2 },
  { id: 'h5', name: 'Heading 5', level: 1 },
  { id: 'body', name: 'Body Text', level: 0 },
  { id: 'small', name: 'Small Text', level: -1 }
];

export default function FluidMaker({ setToastMessage }) {
  // Config state
  const [minVp, setMinVp] = useState(320);
  const [maxVp, setMaxVp] = useState(1280);
  const [minFs, setMinFs] = useState(16);
  const [maxFs, setMaxFs] = useState(20);
  const [scaleRatio, setScaleRatio] = useState(1.250); // Major Third
  
  // Interactive preview state
  const [currentVp, setCurrentVp] = useState(1280);

  // Math helper for clamp()
  const calculateClamp = (minSize, maxSize, minV, maxV) => {
    const slope = (maxSize - minSize) / (maxV - minV);
    const yIntercept = minSize - (slope * minV);
    
    const minSizeRem = (minSize / 16).toFixed(3);
    const maxSizeRem = (maxSize / 16).toFixed(3);
    const slopeVw = (slope * 100).toFixed(3);
    const interceptRem = (yIntercept / 16).toFixed(3);

    return `clamp(${minSizeRem}rem, ${slopeVw}vw + ${interceptRem}rem, ${maxSizeRem}rem)`;
  };

  // Generate hierarchy data
  const hierarchy = useMemo(() => {
    return STEPS.map(step => {
      const stepMinSize = minFs * Math.pow(scaleRatio, step.level);
      const stepMaxSize = maxFs * Math.pow(scaleRatio, step.level);
      
      const clampValue = calculateClamp(stepMinSize, stepMaxSize, minVp, maxVp);
      
      // Calculate current size based on simulated viewport
      let currentSize;
      if (currentVp <= minVp) {
        currentSize = stepMinSize;
      } else if (currentVp >= maxVp) {
        currentSize = stepMaxSize;
      } else {
        const slope = (stepMaxSize - stepMinSize) / (maxVp - minVp);
        currentSize = stepMinSize + slope * (currentVp - minVp);
      }

      return {
        ...step,
        min: stepMinSize.toFixed(1),
        max: stepMaxSize.toFixed(1),
        clamp: clampValue,
        current: currentSize.toFixed(1)
      };
    });
  }, [minVp, maxVp, minFs, maxFs, scaleRatio, currentVp]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage("CSS clamp copied!");
      setTimeout(() => setToastMessage(null), 2500);
    });
  };

  const handleCopyFullCSS = () => {
    const css = hierarchy.map(h => `--text-${h.id}: ${h.clamp};`).join('\n');
    navigator.clipboard.writeText(css).then(() => {
      setToastMessage("Full CSS variables copied!");
      setTimeout(() => setToastMessage(null), 2500);
    });
  };

  return (
    <div className="fluid-maker">
      <aside className="fluid-sidebar">
        <div>
          <h2>Fluid Typography</h2>
          <p>Create text that scales perfectly across devices using CSS Clamp.</p>
        </div>

        <div className="control-section">
          <h3>Viewport Range</h3>
          <div className="input-row">
            <div className="input-group">
              <label>Min (px)</label>
              <input 
                type="number" 
                className="fluid-input" 
                value={minVp} 
                onChange={(e) => setMinVp(Number(e.target.value))} 
              />
            </div>
            <div className="input-group">
              <label>Max (px)</label>
              <input 
                type="number" 
                className="fluid-input" 
                value={maxVp} 
                onChange={(e) => setMaxVp(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>Base Font Size</h3>
          <div className="input-row">
            <div className="input-group">
              <label>Min (px)</label>
              <input 
                type="number" 
                className="fluid-input" 
                value={minFs} 
                onChange={(e) => setMinFs(Number(e.target.value))} 
              />
            </div>
            <div className="input-group">
              <label>Max (px)</label>
              <input 
                type="number" 
                className="fluid-input" 
                value={maxFs} 
                onChange={(e) => setMaxFs(Number(e.target.value))} 
              />
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>Type Scale</h3>
          <div className="input-group">
            <label>Ratio</label>
            <select 
              className="fluid-select" 
              value={scaleRatio} 
              onChange={(e) => setScaleRatio(Number(e.target.value))}
            >
              {Object.entries(SCALES).map(([val, name]) => (
                <option key={val} value={val}>{name} ({val})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="fluid-export">
          <div className="export-header">
            <span>CSS VARIABLES</span>
            <button className="copy-btn" onClick={handleCopyFullCSS}>Copy All</button>
          </div>
          <div className="export-code">
{hierarchy.map(h => (
  <div key={h.id} style={{ marginBottom: '0.5rem' }}>
    <span style={{ color: '#818cf8' }}>--text-{h.id}</span>: {h.clamp};
  </div>
))}
          </div>
        </div>
      </aside>

      <main className="fluid-preview-container">
        <header className="preview-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MoveHorizontal size={20} color="#64748b" />
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>SIMULATED VIEWPORT</span>
          </div>
          <div className="viewport-slider-container">
            <input 
              type="range" 
              min="320" 
              max="1920" 
              value={currentVp} 
              onChange={(e) => setCurrentVp(Number(e.target.value))} 
            />
            <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: 'bold', color: '#3b82f6' }}>{currentVp}px</span>
          </div>
          <div style={{ width: '130px' }} /> {/* Spacer */}
        </header>

        <div className="preview-content" style={{ width: '100%', maxWidth: `${currentVp}px` }}>
          {hierarchy.map(step => (
            <div key={step.id} className="preview-step">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span className="step-label">{step.name}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {step.current}px ({step.min}px - {step.max}px)
                </span>
              </div>
              <div 
                className="step-text" 
                style={{ fontSize: `${step.current}px` }}
                onClick={() => copyToClipboard(step.clamp)}
                title="Click to copy clamp()"
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
          
          {/* Visual guides for current viewport */}
          <div className="width-indicator" style={{ left: '0' }}><div className="width-label">0px</div></div>
          <div className="width-indicator" style={{ left: '100%' }}><div className="width-label">{currentVp}px</div></div>
        </div>
      </main>
    </div>
  );
}
