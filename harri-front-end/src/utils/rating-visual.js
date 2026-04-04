export function getRatingVisualState(rawAverage) {
  const average = Number(rawAverage || 0);
  const clamped = Number.isFinite(average) ? Math.max(0, Math.min(5, average)) : 0;
  const fullStars = Math.floor(clamped);
  const showHalfOnFifthStar = clamped >= 4.5 && clamped < 5;

  return {
    average: clamped,
    fullStars,
    showHalfOnFifthStar,
  };
}

