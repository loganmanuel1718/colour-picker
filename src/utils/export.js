import { getContrastColor } from './colors';

/**
 * Renders the color palette onto an in-memory canvas and triggers a download.
 * @param {Array} colors - Array of color objects { id, hex, isLocked }
 */
export const exportPaletteAsImage = (colors) => {
  if (!colors || colors.length === 0) return;

  const canvas = document.createElement('canvas');
  // High res for crisp text
  const width = 1200;
  const height = 800;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  const columnWidth = width / colors.length;

  colors.forEach((color, index) => {
    // 1. Draw background
    ctx.fillStyle = color.hex;
    ctx.fillRect(index * columnWidth, 0, columnWidth, height);

    // 2. Prepare text style
    const textColor = getContrastColor(color.hex);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Outfit", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3. Draw Hex Code near the bottom
    const textX = (index * columnWidth) + (columnWidth / 2);
    // Draw near bottom, similar to standard UI, matching standard proportions
    const textY = height - 100;
    
    // The uppercase hex without #
    ctx.fillText(color.hex.toUpperCase().replace('#', ''), textX, textY);
  });

  // 4. Convert and download
  const dataPath = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataPath;
  link.download = `palette-${Date.now()}.png`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
