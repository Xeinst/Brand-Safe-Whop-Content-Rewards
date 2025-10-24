// Utility function to generate CSS classes for dynamic widths
export function getWidthClass(percentage: number): string {
  const rounded = Math.round(percentage)
  if (rounded >= 100) return 'width-100'
  if (rounded >= 90) return 'width-90'
  if (rounded >= 85) return 'width-85'
  if (rounded >= 70) return 'width-70'
  if (rounded >= 60) return 'width-60'
  if (rounded >= 30) return 'width-30'
  if (rounded >= 15) return 'width-15'
  return 'width-0'
}

// Utility function to generate inline style for dynamic widths (CSP-compliant)
export function getWidthStyle(percentage: number): React.CSSProperties {
  return { width: `${Math.max(0, Math.min(100, percentage))}%` }
}
