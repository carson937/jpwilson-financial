import Image from 'next/image'

/**
 * ============================================================================
 * OFFICIAL BRAND MARKS — DO NOT SUBSTITUTE
 * ============================================================================
 *
 * Source of truth: client intake `2026-07-29-official-logos`
 *   CLIENT_PROJECTS/jp-wilson/00_INBOX/Processed/2026/07/2026-07-29-official-logos/manifest.json
 *
 * The files in `public/brand/` are byte-identical copies of the curated
 * originals in `CLIENT_PROJECTS/jp-wilson/04_ASSETS/Brand`. Never redraw,
 * trace, recolour, crop, stretch, or regenerate them. If a new variant is
 * needed, it comes from the client — not from this repo.
 *
 * A hand-drawn SVG approximation of the crest previously stood in for the real
 * mark (`public/favicon.svg`, removed 2026-07-30). Do not reintroduce it.
 *
 * KNOWN GAP: the client has not supplied a reversed (light-on-dark) or
 * transparent master. Every supplied file has a white background baked in, and
 * the wordmark is dark navy ink. So on any non-white surface the artwork sits
 * on a white plate rather than being altered to fit. Once a reversed master
 * arrives, pass `plate={false}` and swap the source file.
 * ============================================================================
 */

/** Intrinsic pixel dimensions of public/brand/jpw-lockup-horizontal.png. */
const LOCKUP_W = 1231
const LOCKUP_H = 373

type BrandLockupProps = {
  /** Rendered height in px. Width follows the official aspect ratio. */
  height: number
  /**
   * Surface the lockup sits on. `light` renders the artwork directly (correct
   * on white). `dark` wraps it in a white plate, because no reversed master
   * exists.
   */
  surface?: 'light' | 'dark'
  className?: string
  /** Accessible name. Empty string marks it decorative next to visible text. */
  alt?: string
}

/**
 * No `sizes` and no `priority` on these marks, deliberately.
 *
 * `sizes` switches next/image to the full responsive device-width srcset and
 * points the fallback `src` at the largest entry — a 3840px render for a 30px
 * logo. Omitting it gives the correct fixed-size 1x/2x srcset for retina.
 *
 * `priority` preloaded both the mobile and desktop variants even though only
 * one is ever displayed, producing "preloaded but not used" console warnings.
 * The LCP element here is the hero headline text, not the logo.
 */
export default function BrandLockup({
  height,
  surface = 'light',
  className = '',
  alt = 'J.P. Wilson Financial Group',
}: BrandLockupProps) {
  const width = Math.round((height * LOCKUP_W) / LOCKUP_H)

  const image = (
    <Image
      src="/brand/jpw-lockup-horizontal.png"
      alt={alt}
      width={width}
      height={height}
      className="block h-full w-auto"
      style={{ height, width }}
    />
  )

  if (surface === 'dark') {
    return (
      <span
        className={`inline-flex items-center justify-center bg-white ${className}`}
        style={{ padding: Math.round(height * 0.22) }}
      >
        {image}
      </span>
    )
  }

  return <span className={`inline-flex items-center ${className}`}>{image}</span>
}

/** Intrinsic pixel dimensions of public/brand/jpw-crest-tile.png. */
const TILE_W = 756
const TILE_H = 760

/**
 * The crest tile on its own — navy rounded square, gold crowned lion shield.
 * Used where a compact square mark reads better than the full lockup, and on
 * dark surfaces where the wordmark's navy ink would disappear.
 *
 * The supplied file carries a thin white margin outside its rounded corners.
 * That margin is removed by CLIPPING (a rounded container plus a small uniform
 * overscale), never by editing the file. The artwork's own proportions are
 * preserved — the scale is uniform on both axes.
 */
const CREST_CLIP_OVERSCALE = 1.06

export function BrandCrest({
  size = 48,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const height = Math.round((size * TILE_H) / TILE_W)

  return (
    <span
      aria-hidden="true"
      className={`relative block flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height, borderRadius: '22%' }}
    >
      <Image
        src="/brand/jpw-crest-tile.png"
        alt=""
        width={size}
        height={height}
        className="absolute left-1/2 top-1/2 max-w-none"
        style={{
          width: size * CREST_CLIP_OVERSCALE,
          height: height * CREST_CLIP_OVERSCALE,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </span>
  )
}
