'use client'

import { cn } from '../lib/utils'

interface NatureLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function NatureLoader({ size = 'md', className, text }: NatureLoaderProps) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-40 h-40'
  }

  const leafSizeMap = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-9 h-9',
    xl: 'w-14 h-14'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative', sizeMap[size])}>
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-radial from-leaf/10 via-transparent to-transparent blur-xl" />

        {/* Animated leaves */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 animate-spin-slow"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '4s',
              animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div
              className={cn(
                'absolute top-0 left-1/2 -translate-x-1/2',
                leafSizeMap[size]
              )}
              style={{
                transform: `translateX(-50%) rotate(${i * 60}deg) translateY(-${size === 'sm' ? 24 : size === 'md' ? 28 : size === 'lg' ? 40 : 60}px)`,
                opacity: 0.65 + (i % 3) * 0.1
              }}
            >
              <LeafIcon
                className={cn('animate-leaf-float', leafSizeMap[size])}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            </div>
          </div>
        ))}

        {/* Center growing seedling */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-grow-pulse">
            <SeedlingIcon className={cn(leafSizeMap[size], 'text-growth drop-shadow-lg')} />
          </div>
        </div>
      </div>

      {text && (
        <p className="text-sm text-muted-foreground animate-pulse-soft font-medium tracking-wide max-w-xs text-center">
          {text}
        </p>
      )}
    </div>
  )
}

function LeafIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-leaf drop-shadow-md', className)}
      style={style}
    >
      <path
        d="M12 2C12 2 4 6 4 14C4 18.4183 7.58172 22 12 22C12 22 12 14 12 2Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <path
        d="M12 2C12 2 20 6 20 14C20 18.4183 16.4183 22 12 22C12 22 12 14 12 2Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <path
        d="M12 2L12 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M12 8C12 8 14 10 16 11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M12 8C12 8 10 10 8 11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  )
}

function SeedlingIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 22V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 10C12 10 8 8 8 4C8 2 9 1 10.5 2C12 3 12 10 12 10Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M12 10C12 10 16 8 16 4C16 2 15 1 13.5 2C12 3 12 10 12 10Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  )
}

// Global full-screen loader
export function GlobalNatureLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <NatureLoader size="lg" text={text} />
    </div>
  )
}