import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Sparkles, ArrowRight, Copy, Check, Palette } from 'lucide-react';
import { hslToHex, generateRandomColor } from './utils/colors';
import './BrandAI.css';

const BRAND_POOLS = {
  luxury: { h: [35, 55], s: [10, 30], l: [10, 40], name: "Luxury / Premium" },
  tech: { h: [200, 230], s: [70, 90], l: [40, 60], name: "Tech / Modern" },
  nature: { h: [100, 150], s: [30, 60], l: [30, 50], name: "Nature / Eco" },
  bold: { h: [0, 20], s: [80, 100], l: [40, 60], name: "Bold / Energetic" },
  minimal: { h: [0, 360], s: [0, 5], l: [80, 95], name: "Minimal / Clean" },
  cyberpunk: { h: [280, 320], s: [80, 100], l: [40, 60], name: "Cyberpunk / Neon" }
};

export default function BrandAI({ onApplyPalette, setToastMessage }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const resultsRef = useRef(null);

  const generateAIPalette = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResults(null);

    // Simulate "Thinking" time
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      let pool = BRAND_POOLS.tech; // Default

      if (lowerPrompt.includes('luxury') || lowerPrompt.includes('gold') || lowerPrompt.includes('premium') || lowerPrompt.includes('expensive')) {
        pool = BRAND_POOLS.luxury;
      } else if (lowerPrompt.includes('nature') || lowerPrompt.includes('eco') || lowerPrompt.includes('green') || lowerPrompt.includes('plant') || lowerPrompt.includes('forest')) {
        pool = BRAND_POOLS.nature;
      } else if (lowerPrompt.includes('bold') || lowerPrompt.includes('fire') || lowerPrompt.includes('red') || lowerPrompt.includes('energy') || lowerPrompt.includes('sport')) {
        pool = BRAND_POOLS.bold;
      } else if (lowerPrompt.includes('minimal') || lowerPrompt.includes('white') || lowerPrompt.includes('soft') || lowerPrompt.includes('clean') || lowerPrompt.includes('calm')) {
        pool = BRAND_POOLS.minimal;
      } else if (lowerPrompt.includes('cyber') || lowerPrompt.includes('neon') || lowerPrompt.includes('future') || lowerPrompt.includes('punk') || lowerPrompt.includes('pink') || lowerPrompt.includes('purple')) {
        pool = BRAND_POOLS.cyberpunk;
      } else if (lowerPrompt.includes('tech') || lowerPrompt.includes('blue') || lowerPrompt.includes('software') || lowerPrompt.includes('ai') || lowerPrompt.includes('modern')) {
        pool = BRAND_POOLS.tech;
      }

      // Build 5 colors based on pool
      const newPalette = [
        { type: 'Primary', h: pool.h[0], s: pool.s[0] + 10, l: pool.l[0] },
        { type: 'Secondary', h: (pool.h[0] + 30) % 360, s: pool.s[0], l: pool.l[0] + 20 },
        { type: 'Accent', h: (pool.h[0] + 180) % 360, s: 80, l: 50 },
        { type: 'Surface', h: pool.h[0], s: 5, l: 95 },
        { type: 'Deep', h: pool.h[0], s: 20, l: 15 }
      ].map(c => ({
        id: `ai-${Date.now()}-${Math.random()}`,
        type: c.type,
        hex: hslToHex(c.h, c.s, c.l),
        isLocked: false
      }));

      setResults(newPalette);
      setIsGenerating(false);
    }, 2000);
  };

  useGSAP(() => {
    if (results) {
      gsap.fromTo(".ai-card", 
        { y: 30, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }
      );
      gsap.fromTo(".ai-apply-all", 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, delay: 0.8 }
      );
    }
  }, { scope: resultsRef, dependencies: [results] });

  const copyColor = (hex) => {
    navigator.clipboard.writeText(hex).then(() => {
      setToastMessage(`${hex} copied to clipboard!`);
    });
  };

  return (
    <div className="brand-ai-container">
      {!results && !isGenerating && (
        <div className="ai-intro">
          <div className="ai-badge">
            <Sparkles size={14} /> Brand Genesis AI
          </div>
          <h2>Define Your Identity</h2>
          <p>
            Describe your brand’s mission, vibe, or industry. Our semantic engine will craft a professional 
            palette based on color psychology and modern design patterns.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="ai-thinking-overlay">
          <div className="ai-spinner-container">
            <div className="ai-spinner-ring"></div>
            <div className="ai-spinner-pulse"></div>
          </div>
          <div className="ai-processing-text">GENERATING BRAND DNA...</div>
        </div>
      )}

      {!isGenerating && (
        <div className="ai-input-group">
          <input 
            type="text" 
            className="ai-main-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateAIPalette()}
            placeholder="e.g., A luxury watch brand that feels timeless..."
          />
          <button 
            className="btn-ai-generate" 
            onClick={generateAIPalette}
            disabled={!prompt.trim()}
          >
            Generate <ArrowRight size={18} />
          </button>
        </div>
      )}

      {results && !isGenerating && (
        <div ref={resultsRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="ai-results">
            {results.map((color) => (
              <div key={color.id} className="ai-card">
                <div 
                  className="ai-color-swatch" 
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className="ai-card-info">
                  <div className="ai-card-type">{color.type}</div>
                  <div className="ai-card-hex">{color.hex.toUpperCase()}</div>
                </div>
                <div className="ai-card-actions">
                  <button className="ai-mini-btn" onClick={() => copyColor(color.hex)} title="Copy HEX">
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="ai-apply-all" 
            onClick={() => onApplyPalette(results)}
          >
            <Palette size={20} /> Use This Palette
          </button>
        </div>
      )}
    </div>
  );
}
