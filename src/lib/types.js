export const CONDITION_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  retired: 'Retired',
};

export const CONDITION_COLORS = {
  excellent: 'bg-success text-success-foreground',
  good: 'bg-primary text-primary-foreground',
  fair: 'bg-warning text-warning-foreground',
  poor: 'bg-destructive text-destructive-foreground',
  retired: 'bg-muted text-muted-foreground',
};

export function calculateDepreciation(purchaseCost, purchaseDate, usefulLifeYears, residualPercent = 0) {
  const now = new Date();
  const purchase = new Date(purchaseDate);
  const totalDays = usefulLifeYears * 365.25;
  const daysSince = Math.max(0, (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
  const residualValue = purchaseCost * (residualPercent / 100);
  const depreciableAmount = purchaseCost - residualValue;
  const depreciationFraction = Math.min(1, daysSince / totalDays);
  const currentValue = Math.max(residualValue, purchaseCost - depreciableAmount * depreciationFraction);
  const totalDepreciation = purchaseCost - currentValue;

  return {
    currentValue: Math.round(currentValue * 100) / 100,
    totalDepreciation: Math.round(totalDepreciation * 100) / 100,
    percentDepreciated: Math.round(depreciationFraction * 100),
    isFullyDepreciated: depreciationFraction >= 1,
  };
}
