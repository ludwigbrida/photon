export const degrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const radians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};
