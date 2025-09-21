export const getGridColumnsClass = (participantCount: number): string => {
  if (participantCount === 1) return 'grid-cols-1';
  if (participantCount === 2) return 'grid-cols-1 md:grid-cols-2';
  if (participantCount <= 4) return 'grid-cols-1 md:grid-cols-2';
  if (participantCount <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  if (participantCount <= 9) return 'grid-cols-2 md:grid-cols-3';
  return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
};