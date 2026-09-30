import BrandLockup from '@/components/BrandLogo'
import { LockIcon } from './icons'
import Progress from './Progress'

/**
 * The card every screen lives in: brand mark, progress, content, secure note.
 *
 * Holding the chrome in one place is what makes the funnel feel like a single
 * product rather than six pages that resemble each other. It also means a new
 * product funnel inherits the whole frame for free.
 *
 * The "Your information is secure" line is a claim the implementation actually
 * backs: HTTPS transport, no lead data in the URL, no persistence to storage,
 * answers held in component state only, and a server that redacts PII from logs.
 */
export default function QuoteShell({
  step,
  totalSteps,
  children,
  variant = 'classic',
}: {
  /** 1-based visible step, or null on the intro and success screens. */
  step: number | null
  totalSteps: number
  children: React.ReactNode
  variant?: 'classic' | 'commercial'
}) {
  const commercial = variant === 'commercial'
  return (
    <div className={`w-full ${commercial ? 'max-w-[680px]' : 'max-w-[600px]'}`}>
      <div className={commercial
        ? 'rounded-[28px] border border-[#173D3A]/15 bg-[#F4F0E7] px-5 pb-7 pt-7 shadow-[0_24px_80px_-36px_rgba(7,31,29,0.55)] sm:px-10 sm:pb-10 sm:pt-9'
        : 'rounded-2xl border border-navy-900/[0.07] bg-white px-5 pb-6 pt-7 shadow-[0_1px_2px_rgba(12,24,41,0.04),0_12px_32px_-12px_rgba(12,24,41,0.16)] sm:px-9 sm:pb-8 sm:pt-9 lg:px-12 lg:pb-10 lg:pt-10'}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <BrandLockup height={26} alt="JP Wilson Financial Group" />
          {step !== null && (
            <span className="shrink-0 text-[13px] font-medium tabular-nums text-navy-900/45">
              {step} of {totalSteps}
            </span>
          )}
        </div>

        {step !== null && (
          <div className="mb-7">
            <Progress current={step} total={totalSteps} />
          </div>
        )}

        {children}
      </div>

      <p className={`mt-4 flex items-center justify-center gap-1.5 text-[12.5px] ${commercial ? 'text-[#173D3A]/60' : 'text-navy-900/40'}`}>
        <LockIcon className="h-3.5 w-3.5" />
        Your information is secure.
      </p>
    </div>
  )
}
