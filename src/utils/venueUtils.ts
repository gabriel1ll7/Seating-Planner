
// Pastel colors for venue elements
export const PASTEL_COLORS = [
  "#F2FCE2", // Soft Green
  "#FEF7CD", // Soft Yellow
  "#FEC6A1", // Soft Orange
  "#E5DEFF", // Soft Purple
  "#FFDEE2", // Soft Pink
  "#FDE1D3", // Soft Peach
  "#D3E4FD", // Soft Blue
  "#F1F0FB", // Soft Gray
];

// Helper function to get a random pastel color
export const getRandomPastelColor = (): string => {
  const colorIndex = Math.floor(Math.random() * PASTEL_COLORS.length);
  return PASTEL_COLORS[colorIndex];
};
