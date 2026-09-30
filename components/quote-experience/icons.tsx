import type { StepIcon } from '@/lib/quote-experience/types'

/**
 * Inline stroke icons. No icon library — the funnel needs nine glyphs and a
 * dependency would cost more bytes than the whole page.
 *
 * All are decorative: every one sits beside a visible text label, so they are
 * hidden from assistive technology rather than announced twice.
 */

type IconProps = { className?: string }

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...STROKE}
    >
      {children}
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
    </Svg>
  )
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21c4-4.4 6-7.6 6-10.2A6 6 0 0 0 6 10.8C6 13.4 8 16.6 12 21Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </Svg>
  )
}

export function CardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10h18M7 14.5h3" />
    </Svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 11.2 12 4.5l8 6.7" />
      <path d="M6.2 12.6V19a.8.8 0 0 0 .8.8h10a.8.8 0 0 0 .8-.8v-6.4" />
    </Svg>
  )
}

/**
 * Rent. A key, not a second house — the Own and Rent cards sit side by side,
 * and two house silhouettes are indistinguishable at a glance. A key also
 * avoids implying that renting means an apartment.
 */
export function BuildingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8.5" cy="15.5" r="3.5" />
      <path d="m11 13 7.5-7.5" />
      <path d="m16 7.5 2 2" />
      <path d="m18.5 5 2 2" />
    </Svg>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 4h2.2l1.4 3.4-1.7 1.2a10.5 10.5 0 0 0 5 5l1.2-1.7 3.4 1.4v2.2a2 2 0 0 1-2.2 2A14.6 14.6 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
    </Svg>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 8 7.1 4.8a1.6 1.6 0 0 0 1.8 0L20 8" />
    </Svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </Svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12h15M13.5 6.5 19.5 12l-6 5.5" />
    </Svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeWidth={2} />
    </Svg>
  )
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.8" />
    </Svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 5.5 6v5.6c0 3.7 2.6 7.1 6.5 8.4 3.9-1.3 6.5-4.7 6.5-8.4V6Z" />
      <path d="m9.4 12 1.9 1.9 3.5-3.6" />
    </Svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6.5 9.5 5.5 5 5.5-5" />
    </Svg>
  )
}

const STEP_ICONS: Record<StepIcon, (props: IconProps) => JSX.Element> = {
  user: UserIcon,
  pin: PinIcon,
  card: CardIcon,
  home: HomeIcon,
  building: BuildingIcon,
  phone: PhoneIcon,
  mail: MailIcon,
}

/** Resolves a config's icon name to a component. Closed union — cannot miss. */
export function StepGlyph({ name, className }: { name: StepIcon; className?: string }) {
  const Icon = STEP_ICONS[name]
  return <Icon className={className} />
}
