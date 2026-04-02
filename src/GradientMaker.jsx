import React, { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Copy, RefreshCw, Plus, Trash2, CopyPlus, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { generateRandomColor } from './utils/colors';
import './GradientMaker.css';

const GradientMaker = forwardRef(({ colors, setToastMessage, gradientType, setGradientType, pendingGradient, setPendingGradient }, ref) => {
  const [linearAngle, setLinearAngle] = useState(90);
  
  // Unified Local state for customized gradient nodes initialized from the palette
  const [nodes, setNodes] = useState([]);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [draggingPosId, setDraggingPosId] = useState(null);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const previewRef = useRef(null);
  const controlsRef = useRef(null);
  const mainRef = useRef(null);

  // Entrance animation
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(".gradient-preview-container", 
      { scale: 0.9, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo(".control-group", 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      "-=0.4"
    );
  }, { scope: mainRef });

  // Initialize
  useEffect(() => {
    if (pendingGradient) {
      setGradientType(pendingGradient.gradientType);
      setLinearAngle(pendingGradient.linearAngle);
      setNodes(pendingGradient.nodes);
      // Immediately clear the pending state so future palette loads naturally trigger correctly.
      setPendingGradient(null);
      return;
    }

    const unifiedNodes = colors.map((c, i) => ({
      id: c.id,
      baseHex: c.hex,
      alpha: 100,
      position: Math.round((i / Math.max(1, colors.length - 1)) * 100),
      px: Math.floor(Math.random() * 100),
      py: Math.floor(Math.random() * 100),
      extent: Math.floor(Math.random() * 40 + 40)
    }));
    setNodes(unifiedNodes);
  }, [colors, pendingGradient]);

  const generateMeshLayout = () => {
    setNodes(prev => prev.map(n => ({
      ...n,
      px: Math.floor(Math.random() * 100),
      py: Math.floor(Math.random() * 100),
      extent: Math.floor(Math.random() * 40 + 40)
    })));
  };

  const handleNodeChange = (id, field, value) => {
    setNodes(prev => prev.map(n => 
      n.id === id ? { ...n, [field]: value } : n
    ));
  };

  const handleAddNode = (e, explicitX = null, explicitY = null) => {
    if (nodes.length >= 10) return; // Prevent excessive nodes
    
    // Default to random fallback if explicit coordinates not given
    const x = explicitX !== null ? explicitX : Math.floor(Math.random() * 100);
    const y = explicitY !== null ? explicitY : Math.floor(Math.random() * 100);

    const newNode = {
      id: `custom-col-${Date.now()}`,
      baseHex: generateRandomColor(),
      alpha: 100,
      position: 100,
      px: x,
      py: y,
      extent: Math.floor(Math.random() * 40 + 40)
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleRemoveNode = (id) => {
    if (nodes.length <= 2) {
      setToastMessage("Gradient must have at least 2 nodes!");
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const handleDuplicateNode = (id) => {
    if (nodes.length >= 10) return;
    const nodeToCopy = nodes.find(n => n.id === id);
    const newNode = {
      ...nodeToCopy,
      id: `custom-col-${Date.now()}`,
      position: Math.min(100, (nodeToCopy.position || 0) + 5),
      px: Math.min(100, nodeToCopy.px + 5), // slightly offset
      py: Math.min(100, nodeToCopy.py + 5)
    };
    const idx = nodes.findIndex(n => n.id === id);
    const newNodes = [...nodes];
    newNodes.splice(idx + 1, 0, newNode);
    setNodes(newNodes);
  };

  const getComputedColor = (node) => {
    if (node.alpha === 100) return node.baseHex;
    const alphaHex = Math.round((node.alpha / 100) * 255).toString(16).padStart(2, '0');
    return `${node.baseHex}${alphaHex}`;
  };

  const gradientStyles = useMemo(() => {
    if (nodes.length === 0) return { cssString: 'background: #fff;', styleObj: { background: '#fff' } };

    const renderNodes = nodes.map(getComputedColor);

    if (gradientType === 'linear') {
      const sortedNodes = [...nodes].sort((a,b) => a.position - b.position);
      const renderStr = sortedNodes.map(n => `${getComputedColor(n)} ${Math.round(n.position)}%`).join(', ');
      const val = `linear-gradient(${linearAngle}deg, ${renderStr})`;
      return { cssString: `background: ${val};`, styleObj: { background: val } };
    } 
    
    if (gradientType === 'radial') {
      const sortedNodes = [...nodes].sort((a,b) => a.position - b.position);
      const renderStr = sortedNodes.map(n => `${getComputedColor(n)} ${Math.round(n.position)}%`).join(', ');
      const val = `radial-gradient(circle at center, ${renderStr})`;
      return { cssString: `background: ${val};`, styleObj: { background: val } };
    } 
    
    if (gradientType === 'mesh') {
      const bgColor = '#ffffff'; // Neutral base, allowing all colours to act purely as point lights
      let radials = [];
      
      // Map ALL nodes into radial gradients so they all exist as manipulatable layers
      nodes.forEach((node) => {
        const color = getComputedColor(node);
        const transparentFader = color.length === 7 ? color + '00' : color.substring(0,7) + '00';
        radials.push(`radial-gradient(at ${Math.round(node.px)}% ${Math.round(node.py)}%, ${color} 0px, ${transparentFader} ${node.extent}%)`);
      });
      
      const bgImageVal = radials.join(',\n  ');
      return {
        cssString: `background-color: ${bgColor};\nbackground-image: \n  ${bgImageVal};`,
        styleObj: { 
          backgroundColor: bgColor, 
          backgroundImage: bgImageVal.replace(/\n|  /g, ' ') 
        }
      };
    }
  }, [nodes, gradientType, linearAngle]);

  // Expose the complete layout configuration upstream securely allowing global publishing triggers
  useImperativeHandle(ref, () => ({
    getExportPayload: () => ({
       cssString: gradientStyles.cssString,
       styleObj: gradientStyles.styleObj,
       gradientType,
       linearAngle,
       nodes
    })
  }));

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gradientStyles.cssString).then(() => {
      setToastMessage("CSS Copied to clipboard!");
      setTimeout(() => setToastMessage(null), 2500);
    });
  };

  const handleExportImage = () => {
    if (previewRef.current === null) return;
    setToastMessage("Generating image...");
    // Render exceptionally high quality canvas (3x resolution)
    toPng(previewRef.current, { pixelRatio: 3, quality: 1.0 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `gradient-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        setToastMessage("Image downloaded successfully!");
        setTimeout(() => setToastMessage(null), 2500);
      })
      .catch((err) => {
        console.error('Failed to export image', err);
        setToastMessage("Failed to export image.");
        setTimeout(() => setToastMessage(null), 2500);
      });
  };

  // Dragging event handlers
  const onPointerDownHandle = (e, id) => {
    if (e.button !== 0 && e.nativeEvent.pointerType === 'mouse') return;
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDraggingNodeId(id);
  };

  const onPointerMove = (e) => {
    if (!draggingNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setNodes(prev => prev.map(n => 
      n.id === draggingNodeId ? { ...n, px: x, py: y } : n
    ));
  };

  const onPointerUp = (e) => {
    if (draggingNodeId) {
      if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
      setDraggingNodeId(null);
    }
  };

  const onPointerDownTrack = (e, id) => {
    if (e.button !== 0 && e.nativeEvent.pointerType === 'mouse') return;
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDraggingPosId(id);
  };

  const onPointerMoveTrack = (e) => {
    if (!draggingPosId || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    x = Math.max(0, Math.min(100, x));
    setNodes(prev => prev.map(n => n.id === draggingPosId ? { ...n, position: x } : n));
  };

  const onPointerUpTrack = (e) => {
    if (draggingPosId) {
      if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
        e.target.releasePointerCapture(e.pointerId);
      }
      setDraggingPosId(null);
    }
  };

  // Double Click tracking directly on container
  const onDoubleClickContainer = (e) => {
    if (gradientType !== 'mesh') return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    
    handleAddNode(null, x, y);
  };

  return (
    <div className="gradient-maker" ref={mainRef}>
      <div 
        className="gradient-preview-container" 
        ref={containerRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onDoubleClick={onDoubleClickContainer}
      >
        <div 
          className="gradient-preview"
          ref={previewRef}
          style={gradientStyles.styleObj}
        />
        
        {/* Render Anchor Handles over the preview if in mesh mode */}
        {gradientType === 'mesh' && nodes.map((node, i) => {

          return (
            <div 
              key={node.id}
              className={`node-handle ${draggingNodeId === node.id ? 'dragging' : ''}`}
              style={{
                left: `${node.px}%`,
                top: `${node.py}%`,
                backgroundColor: node.baseHex
              }}
              onPointerDown={(e) => onPointerDownHandle(e, node.id)}
              onPointerUp={onPointerUp}
              title="Drag to reposition layer"
            />
          );
        })}
      </div>

      <div className="gradient-controls">
        <div className="control-group">
          <label>Type</label>
          <div className="type-switch">
            <button className={`type-btn ${gradientType === 'linear' ? 'active' : ''}`} onClick={() => setGradientType('linear')}>Linear</button>
            <button className={`type-btn ${gradientType === 'radial' ? 'active' : ''}`} onClick={() => setGradientType('radial')}>Radial</button>
            <button className={`type-btn ${gradientType === 'mesh' ? 'active' : ''}`} onClick={() => setGradientType('mesh')}>Mesh</button>
          </div>
        </div>

        {gradientType === 'linear' && (
          <div className="control-group">
            <label>Angle</label>
            <div className="slider-container">
              <input type="range" min="0" max="360" value={linearAngle} onChange={e => setLinearAngle(e.target.value)} />
              <span className="slider-value">{linearAngle}°</span>
            </div>
          </div>
        )}

        {(gradientType === 'linear' || gradientType === 'radial') && (
          <div className="control-group">
            <label>Color Stops</label>
            <div 
              className="gradient-position-track" 
              ref={trackRef}
              onPointerMove={onPointerMoveTrack}
              onPointerUp={onPointerUpTrack}
              onPointerLeave={onPointerUpTrack}
              style={{
                 height: '24px', borderRadius: '12px', position: 'relative', marginTop: '0.5rem', marginBottom: '1rem',
                 boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                 position: 'absolute', inset: 0, borderRadius: '12px', pointerEvents: 'none',
                 background: `linear-gradient(90deg, ${[...nodes].sort((a,b)=>a.position-b.position).map(n => `${getComputedColor(n)} ${Math.round(n.position)}%`).join(', ')})`
              }} />
              
              {nodes.map(n => (
                <div 
                  key={n.id}
                  className={`position-handle ${draggingPosId === n.id ? 'dragging' : ''}`}
                  onPointerDown={(e) => onPointerDownTrack(e, n.id)}
                  title={`Drag ${n.baseHex} to update position`}
                  style={{
                    position: 'absolute', top: '50%', left: `${n.position}%`,
                    width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: n.baseHex, border: '3px solid white',
                    transform: 'translate(-50%, -50%)', cursor: 'grab',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)', zIndex: draggingPosId === n.id ? 10 : 1
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {gradientType === 'mesh' && (
          <div className="control-group">
            <button className="btn-secondary" onClick={generateMeshLayout}>
              <RefreshCw size={18} /> Reroll Mesh Vectors
            </button>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
              Tip: Drag handles or double click the canvas!
            </span>
          </div>
        )}

        <div className="control-group">
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Color Nodes</span>
            <button 
              onClick={handleAddNode}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
              title="Add Node"
            >
              <Plus size={16} /> Add
            </button>
          </label>
          <div className="nodes-list">
            {nodes.map((node, idx) => (
              <div key={node.id} className="node-editor">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <div className="node-color-picker">
                    <input 
                      type="color" 
                      value={node.baseHex}
                      onChange={(e) => handleNodeChange(node.id, 'baseHex', e.target.value)}
                    />
                    <span className="node-hex-label">{node.baseHex.toUpperCase()}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleDuplicateNode(node.id)}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                      title="Duplicate Node"
                    >
                      <CopyPlus size={16} />
                    </button>
                    <button 
                      onClick={() => handleRemoveNode(node.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Remove Node"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="node-opacity">
                  <span className="slider-label">Opacity: </span>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={node.alpha} 
                    onChange={e => handleNodeChange(node.id, 'alpha', Number(e.target.value))} 
                  />
                  <span className="slider-value">{node.alpha}%</span>
                </div>
                
                {(gradientType === 'linear' || gradientType === 'radial') && (
                  <div className="node-opacity" style={{ marginTop: '0.5rem' }}>
                    <span className="slider-label">Pos: </span>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={Math.round(node.position)} 
                      onChange={e => handleNodeChange(node.id, 'position', Number(e.target.value))} 
                    />
                    <span className="slider-value">{Math.round(node.position)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="control-group" style={{ marginTop: 'auto' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>CSS Output</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleExportImage} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }} title="Export Image">
                <Download size={16} /> Image
              </button>
              <button onClick={handleCopyCode} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }} title="Copy Output">
                <Copy size={16} /> Code
              </button>
            </div>
          </label>
          <pre className="code-output">{gradientStyles.cssString}</pre>
        </div>
      </div>
    </div>
  );
});

export default GradientMaker;
