/**
 * Truthful progress. One segment per real questionnaire screen — five for the
 * Life funnel.
 *
 * The intro is NOT a step and does not render this. Counting a marketing screen
 * as question one is the small lie that makes the rest of the funnel feel
 * longer than it is.
 */
export default function Progress({
  current,
  total,
}: {
  /** 1-based index of the visible step. */
  current: number
  total: number
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            index < current ? 'bg-navy-900' : 'bg-navy-900/10'
          }`}
        />
      ))}
    </div>
  )
}
