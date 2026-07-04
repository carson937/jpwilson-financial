import Image from 'next/image'

interface CrestLogoProps {
  size?: number
  className?: string
  showBars?: boolean
  variant?: 'mark' | 'full'
}

export default function CrestLogo({
  size = 48,
  className = '',
  showBars = false,
}: CrestLogoProps) {
  if (showBars) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="crest-bar-line reverse" style={{ minWidth: 48 }} />
        <CrestMark size={size} />
        <div className="crest-bar-line" style={{ minWidth: 48 }} />
      </div>
    )
  }
  return <CrestMark size={size} className={className} />
}

function CrestMark({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/logo.png"
        alt=""
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority
      />
    </div>
  )
}
