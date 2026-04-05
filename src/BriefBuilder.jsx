import React, { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefreshCw, Copy, Sparkles } from 'lucide-react';
import './BriefBuilder.css';

const INDUSTRIES = [
  "Organic Skincare", "B2B SaaS Platform", "Artisan Coffee Roasters", 
  "Boutique Fitness Studio", "Fintech Startup", "Sustainable Fashion",
  "Craft Brewery", "Cybersecurity Firm", "Luxury Real Estate",
  "Vegan Restaurant", "Esports Organization", "Pet Care Brand"
];

const COMPANIES = [
  "Aura", "Nebula", "Lumina", "Forge", "Apex", "Nova", 
  "Zenith", "Pulse", "Echo", "Oasis", "Vanguard", "Canvas"
];

const OBJECTIVES = [
  "Complete brand identity from scratch",
  "Refresh the logo and basic brand guidelines",
  "Design a modern landing page highlighting a new product launch",
  "Create a comprehensive social media template system",
  "Rebrand to appeal to a younger Gen-Z audience",
  "Design a sleek mobile app interface for users",
  "Develop cohesive packaging design for a new product line"
];

const VIBES = [
  "Minimalist, Clean, Modern",
  "Bold, Energetic, Loud",
  "Luxurious, Elegant, Premium",
  "Playful, Quirky, Colorful",
  "Eco-friendly, Natural, Earthy",
  "Cyberpunk, Futuristic, Neon",
  "Trustworthy, Corporate, Professional",
  "Vintage, Retro, Nostalgic"
];

const TARGET_AUDIENCES = [
  "Urban professionals aged 25-35",
  "Tech-savvy teenagers and young adults",
  "Health-conscious individuals",
  "Small business owners and entrepreneurs",
  "High-income luxury consumers",
  "Environmentally aware millennials"
];

const DELIVERABLES = [
  "Logo design, Brand Guidelines, Business Cards",
  "Web design (Figma), Social graphic templates",
  "App UI Kit, App Icon",
  "Packaging design (Box & Label), 3D Render",
  "Typography selection, Color definitions, Full Brand Book",
  "Pitch Deck Design, Email Newsletter Templates"
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

export default function BriefBuilder({ onSendToBrandAI, setToastMessage }) {
  const [brief, setBrief] = useState(null);
  const cardRef = useRef(null);

  const generateBrief = () => {
    const newBrief = {
      companyName: getRandomElement(COMPANIES),
      industry: getRandomElement(INDUSTRIES),
      objective: getRandomElement(OBJECTIVES),
      vibe: getRandomElement(VIBES),
      audience: getRandomElement(TARGET_AUDIENCES),
      deliverables: getRandomElement(DELIVERABLES),
    };
    setBrief(newBrief);
  };

  useEffect(() => {
    generateBrief();
  }, []);

  useGSAP(() => {
    if (brief && cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { y: 20, opacity: 0, scale: 0.98 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, { scope: cardRef, dependencies: [brief] });

  const copyBrief = () => {
    if (!brief) return;
    const text = `
Brief for: ${brief.companyName} (${brief.industry})

Objective:
${brief.objective}

Brand Vibe:
${brief.vibe}

Target Audience:
${brief.audience}

Deliverables:
${brief.deliverables}
    `.trim();
    
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage("Brief copied to clipboard!");
    });
  };

  return (
    <div className="brief-builder-container" ref={cardRef}>
      <div className="brief-actions">
        <button className="btn-brief-primary" onClick={generateBrief}>
          <RefreshCw size={18} /> Generate New Brief
        </button>
        <button className="btn-brief-secondary" onClick={copyBrief} disabled={!brief}>
          <Copy size={18} /> Copy to Clipboard
        </button>
        <button className="btn-brief-magic" onClick={() => onSendToBrandAI(brief?.vibe)} disabled={!brief}>
          <Sparkles size={18} /> Send to Brand AI
        </button>
      </div>

      {brief && (
        <div className="brief-card">
          <div className="brief-header">
            <h2>{brief.companyName}</h2>
            <span className="brief-industry">{brief.industry}</span>
          </div>
          
          <div className="brief-body">
            <div className="brief-section">
              <h3>Project Objective</h3>
              <p>{brief.objective}</p>
            </div>

            <div className="brief-section">
              <h3>Brand Vibe & Keywords</h3>
              <p className="brief-vibe-text">{brief.vibe}</p>
            </div>

            <div className="brief-row">
              <div className="brief-section half-width">
                <h3>Target Audience</h3>
                <p>{brief.audience}</p>
              </div>
              <div className="brief-section half-width">
                <h3>Key Deliverables</h3>
                <p>{brief.deliverables}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
