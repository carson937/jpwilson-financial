import { BrandMark } from '@/components/BrandLogo'
/**
 * `showCallLink` is off on the out-of-area screen only. That panel already
 * leads with a full-width "Call (866) 786-1585" button, and repeating the
 * number as a quiet text link under it reads as two competing asks at the one
 * moment the phone call IS the outcome.
 */
export default function CommercialShell({ children, showProgress = false, progressCurrent = 0, progressTotal = 1, showCallLink = true }: {
  children: React.ReactNode; showProgress?: boolean; progressCurrent?: number; progressTotal?: number; showCallLink?: boolean
}) {
  return (
    <div className="commercial-flow min-h-dvh bg-bone px-5 pb-5 pt-5 text-navy-950 sm:pt-10">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-7 flex items-center justify-between gap-5">
          <BrandMark size={38} />
          {showProgress && <span className="text-[12px] font-medium text-navy-900/75">{progressCurrent} / {progressTotal}</span>}
        </div>
        {showProgress && <div className="mb-7 h-[3px] overflow-hidden rounded-full bg-navy-900/15" role="progressbar" aria-valuemin={1} aria-valuemax={progressTotal} aria-valuenow={progressCurrent} aria-label={`Step ${progressCurrent} of ${progressTotal}`}>
          <div className="h-full rounded-full bg-gold-dark transition-[width] duration-200" style={{width: `${progressCurrent / progressTotal * 100}%`}} />
        </div>}
        {children}
        {showCallLink && <div className="mt-5 text-center"><a href="tel:+18667861585" className="inline-flex min-h-11 items-center rounded text-[12px] text-navy-900/75 underline underline-offset-4 focus-visible:outline focus-visible:outline-2">Prefer to talk? Call Patrick</a></div>}
      </div>
    </div>
  )
}
