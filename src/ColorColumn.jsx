import React, { useState, useRef } from 'react';
import { Copy, Lock, Unlock, CopyPlus, Grid, X, GripVertical } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getContrastColor, hexToRgb, hexToHsl, hexToCmyk, generateShades } from './utils/colors';

export default function ColorColumn({ id, color, isLocked, onToggleLock, onCopy, onDuplicate, onChangeColor }) {
  const [isViewingShades, setIsViewingShades] = useState(false);
  const columnRef = useRef(null);
  const hexRef = useRef(null);
  const textColor = getContrastColor(color);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: color,
    color: textColor,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative'
  };

  // Animate hex value on color change
  useGSAP(() => {
    gsap.fromTo(hexRef.current, 
      { y: 10, opacity: 0, scale: 0.9 }, 
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }, { scope: columnRef, dependencies: [color] });

  // Format getters
  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);
  const cmyk = hexToCmyk(color);

  const displayFormats = [
    { label: rgb, value: rgb },
    { label: hsl, value: hsl },
    { label: cmyk, value: cmyk }
  ];

  return (
    <div 
      className="color-column" 
      ref={setNodeRef}
      style={style}
    >
      {/* Drag Handle */}
      <div 
        className="drag-handle" 
        {...attributes} 
        {...listeners}
        style={{ 
          position: 'absolute', 
          top: '20px', 
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: 0.4,
          padding: '10px',
          zIndex: 5
        }}
      >
        <GripVertical size={20} />
      </div>
      {isViewingShades && (
        <div className="shades-overlay">
          <button 
            className="shades-close-btn" 
            onClick={() => setIsViewingShades(false)}
            title="Close Shades"
          >
            <X size={16} />
          </button>
          
          {generateShades(color).map((shade, idx) => (
            <div 
              key={idx} 
              className="shade-block" 
              style={{ backgroundColor: shade }}
              onClick={() => {
                onChangeColor(shade);
                setIsViewingShades(false);
              }}
              title={shade}
            >
              <span className="shade-hex-label" style={{ color: getContrastColor(shade) }}>
                {shade.replace('#', '').toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="color-info" style={{ opacity: isViewingShades ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: isViewingShades ? 'none' : 'auto' }}>
        <div className="hex-wrapper">
          <button 
            className="hex-value"
            ref={hexRef}
            onClick={() => onCopy(color)}
            aria-label={`Copy color ${color}`}
            title="Copy HEX"
          >
            {color.replace('#', '')}
          </button>
        </div>
        
        <div className="alt-formats">
          {displayFormats.map((fmt, idx) => (
            <button 
              key={idx} 
              className="alt-format-btn"
              onClick={() => onCopy(fmt.value.replace(/^(RGB|HSL|CMYK) /, ''))} // Copy just the value without label prefix if preferred, or copy full if preferred. Let's copy the full thing or just the content. Actually let's just copy the string.
              title={`Copy ${fmt.label.split(' ')[0]}`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
        
        <div className="controls" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            className={`icon-btn ${isLocked ? 'locked' : ''}`}
            onClick={onToggleLock}
            aria-label={isLocked ? "Unlock color" : "Lock color"}
            title={isLocked ? "Unlock color" : "Lock color"}
          >
            {isLocked ? <Lock size={22} /> : <Unlock size={22} />}
          </button>
          
          <button 
            className="icon-btn"
            onClick={() => onCopy(color)}
            aria-label="Copy color"
            title="Copy color"
          >
            <Copy size={22} />
          </button>

          <button 
            className="icon-btn"
            onClick={() => setIsViewingShades(true)}
            aria-label="View Shades"
            title="View Shades"
          >
            <Grid size={22} />
          </button>

          {onDuplicate && (
            <button 
              className="icon-btn"
              onClick={onDuplicate}
              aria-label="Duplicate color"
              title="Duplicate color"
            >
              <CopyPlus size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
