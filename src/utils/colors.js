// Generate a random hex color
export const generateRandomColor = () => {
  const characters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += characters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Determine if the text should be black or white based on the background color luminance
// Uses standard WCAG luminance formula
export const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Format converters
export const hexToRgb = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `RGB ${r}, ${g}, ${b}`;
};

export const hexToHsl = (hexColor) => {
  const hex = hexColor.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `HSL ${h}°, ${s}%, ${l}%`;
};

export const hexToCmyk = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  let k = 1 - Math.max(r, g, b);
  if (k === 1) return 'CMYK 0%, 0%, 0%, 100%';

  let c = (1 - r - k) / (1 - k);
  let m = (1 - g - k) / (1 - k);
  let y = (1 - b - k) / (1 - k);

  c = Math.round(c * 100);
  m = Math.round(m * 100);
  y = Math.round(y * 100);
  k = Math.round(k * 100);

  return `CMYK ${c}%, ${m}%, ${y}%, ${k}%`;
};

// Math to mix and extract colour sets based natively off white/black boundaries
export const generateShades = (hex, halfSteps = 10) => {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const rgb = [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)];
  
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hexStr = x.toString(16);
      return hexStr.length === 1 ? '0' + hexStr : hexStr;
    }).join('');
  };

  const tints = [];
  for (let i = halfSteps; i > 0; i--) {
    const factor = i / (halfSteps + 1);
    const r = Math.round(rgb[0] + (255 - rgb[0]) * factor);
    const g = Math.round(rgb[1] + (255 - rgb[1]) * factor);
    const b = Math.round(rgb[2] + (255 - rgb[2]) * factor);
    tints.push(rgbToHex(r, g, b));
  }

  const base = hex;

  const shades = [];
  for (let i = 1; i <= halfSteps; i++) {
    const factor = i / (halfSteps + 1);
    const r = Math.round(rgb[0] * (1 - factor));
    const g = Math.round(rgb[1] * (1 - factor));
    const b = Math.round(rgb[2] * (1 - factor));
    shades.push(rgbToHex(r, g, b));
  }

  return [...tints, base, ...shades];
};

// Precise WCAG 2.0 Math logic
export const getRelativeLuminance = (hex) => {
  const c = hex.replace('#', '');
  // Sanity check length
  let validHex = c;
  if (c.length === 3) validHex = c.split('').map(x => x + x).join('');
  const rgb = [parseInt(validHex.substr(0, 2), 16), parseInt(validHex.substr(2, 2), 16), parseInt(validHex.substr(4, 2), 16)];
  
  const rsRGB = rgb[0] / 255;
  const gsRGB = rgb[1] / 255;
  const bsRGB = rgb[2] / 255;
  
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const calculateContrastRatio = (hex1, hex2) => {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  // Using standard WCAG ratio (+ 0.05 padding)
  return (lightest + 0.05) / (darkest + 0.05);
};

export const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return "#" + r + g + b;
};

// Structural HSL Extractor (Returns direct math object for slider mappings instead of formatted strings)
export const hexToHslStruct = (hexColor) => {
  let c = hexColor.replace('#', '');
  // Sanity check length
  let validHex = c;
  if (c.length === 3) validHex = c.split('').map(x => x + x).join('');

  let r = parseInt(validHex.substring(0, 2), 16) / 255;
  let g = parseInt(validHex.substring(2, 4), 16) / 255;
  let b = parseInt(validHex.substring(4, 6), 16) / 255;

  let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  return {
    h: h,
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};
