/**
 * Returns a colour for a star rating on a red-to-green scale.
 * 1 = red, 2 = orange, 3 = amber, 4 = yellow-green, 5 = green
 */
export function getRatingColor(rating: number): string {
  if (rating <= 1) return '#ef4444' // red
  if (rating <= 2) return '#f97316' // orange
  if (rating <= 3) return '#f59e0b' // amber
  if (rating <= 4) return '#84cc16' // lime
  return '#22c55e' // green
}
