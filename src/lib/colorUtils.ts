// Funktion zur Berechnung der Textfarbe basierend auf Hintergrundfarbe
export const getTextColor = (bgColor: string): string => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// Funktion zur Berechnung der Eingabefeld-Hintergrundfarbe
export const getInputBackgroundColor = (bgColor: string): string => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Für helle Hintergründe: dunklerer Eingabefeld-Hintergrund
  // Für dunkle Hintergründe: hellerer Eingabefeld-Hintergrund
  if (brightness > 128) {
    // Helle Hintergrundfarbe - dunklerer Eingabefeld-Hintergrund
    const darkerR = Math.max(0, r - 40);
    const darkerG = Math.max(0, g - 40);
    const darkerB = Math.max(0, b - 40);
    return `rgba(${darkerR}, ${darkerG}, ${darkerB}, 0.1)`;
  } else {
    // Dunkle Hintergrundfarbe - hellerer Eingabefeld-Hintergrund
    const lighterR = Math.min(255, r + 40);
    const lighterG = Math.min(255, g + 40);
    const lighterB = Math.min(255, b + 40);
    return `rgba(${lighterR}, ${lighterG}, ${lighterB}, 0.2)`;
  }
};

// Funktion zur Berechnung der Button-Hintergrundfarbe
export const getButtonBackgroundColor = (bgColor: string): string => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  if (brightness > 128) {
    // Helle Hintergrundfarbe - dunklerer Button-Hintergrund
    const darkerR = Math.max(0, r - 60);
    const darkerG = Math.max(0, g - 60);
    const darkerB = Math.max(0, b - 60);
    return `rgba(${darkerR}, ${darkerG}, ${darkerB}, 0.3)`;
  } else {
    // Dunkle Hintergrundfarbe - hellerer Button-Hintergrund
    const lighterR = Math.min(255, r + 60);
    const lighterG = Math.min(255, g + 60);
    const lighterB = Math.min(255, b + 60);
    return `rgba(${lighterR}, ${lighterG}, ${lighterB}, 0.3)`;
  }
}; 