'use client'

import { cn } from '../lib/utils'

interface NatureLoaderDeluxeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
  variant?: 'default' | 'falling-leaves' | 'blooming' | 'seasons'
}

/**
 * Deluxe nature loader with enhanced visual effects
 * Features multiple animation variants and particle effects
 */
export function NatureLoaderDeluxe({
  size = 'md',
  className,
  text,
  variant = 'default'
}: NatureLoaderDeluxeProps) {
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-44 h-44',
    xl: 'w-56 h-56'
  }

  const leafSizeMap = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      <div className={cn('relative', sizeMap[size])}>
        {/* Ambient glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-leaf/20 via-transparent to-transparent blur-2xl" />

        {variant === 'falling-leaves' && <FallingLeavesAnimation size={size} leafSize={leafSizeMap[size]} />}
        {variant === 'blooming' && <BloomingAnimation size={size} leafSize={leafSizeMap[size]} />}
        {variant === 'seasons' && <SeasonsAnimation size={size} leafSize={leafSizeMap[size]} />}
        {variant === 'default' && <DefaultAnimation size={size} leafSize={leafSizeMap[size]} />}

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-growth/40 rounded-full"
            style={{
              left: `${50 + Math.cos((i * Math.PI * 2) / 8) * 40}%`,
              top: `${50 + Math.sin((i * Math.PI * 2) / 8) * 40}%`,
              animation: `particle-float ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      {text && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground animate-pulse-soft font-medium tracking-wide">
            {text}
          </p>
          <div className="flex items-center justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={`dot-${i}`}
                className="w-1.5 h-1.5 rounded-full bg-growth"
                style={{
                  animation: 'bounce-dot 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DefaultAnimation({ size, leafSize }: { size: string; leafSize: string }) {
  return (
    <>
      {/* Outer rotating leaves */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`outer-${i}`}
          className="absolute inset-0 animate-spin-slow"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '4s'
          }}
        >
          <div
            className={cn('absolute top-0 left-1/2 -translate-x-1/2', leafSize)}
            style={{
              transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-${
                size === 'sm' ? 28 : size === 'md' ? 48 : size === 'lg' ? 64 : 88
              }px)`,
              opacity: 0.6 + (i % 4) * 0.1
            }}
          >
            <LeafIconDetailed
              className={cn('animate-leaf-float', leafSize)}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          </div>
        </div>
      ))}

      {/* Center tree */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-grow-pulse">
          <TreeIcon className={cn(leafSize, 'text-growth scale-125')} />
        </div>
      </div>
    </>
  )
}

function FallingLeavesAnimation({ size, leafSize }: { size: string; leafSize: string }) {
  return (
    <>
      {[...Array(12)].map((_, i) => (
        <div
          key={`falling-${i}`}
          className={cn('absolute', leafSize)}
          style={{
            left: `${10 + (i % 4) * 25}%`,
            animation: `leaf-fall-enhanced ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`
          }}
        >
          <LeafIconDetailed className={cn(leafSize, 'text-leaf')} />
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <TreeIcon className={cn(leafSize, 'text-growth scale-125 animate-grow-pulse')} />
      </div>
    </>
  )
}

function BloomingAnimation({ size, leafSize }: { size: string; leafSize: string }) {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div
          key={`bloom-${i}`}
          className="absolute inset-0"
          style={{
            animation: 'bloom-expand 2s ease-out infinite',
            animationDelay: `${i * 0.3}s`
          }}
        >
          <div
            className={cn('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', leafSize)}
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-${
                size === 'sm' ? 20 : size === 'md' ? 32 : size === 'lg' ? 44 : 60
              }px)`
            }}
          >
            <FlowerPetal className={cn(leafSize)} />
          </div>
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse-soft">
          <FlowerCenter className={cn(leafSize, 'scale-75')} />
        </div>
      </div>
    </>
  )
}

function SeasonsAnimation({ size, leafSize }: { size: string; leafSize: string }) {
  return (
    <>
      {/* Spring (green leaves) */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`spring-${i}`}
          className={cn('absolute', leafSize)}
          style={{
            left: `${25 + i * 25}%`,
            top: '10%',
            animation: 'season-cycle 8s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`
          }}
        >
          <LeafIconDetailed className={cn(leafSize, 'text-growth')} />
        </div>
      ))}
      {/* Autumn (orange leaves) */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`autumn-${i}`}
          className={cn('absolute', leafSize)}
          style={{
            left: `${25 + i * 25}%`,
            top: '70%',
            animation: 'season-cycle 8s ease-in-out infinite',
            animationDelay: `${4 + i * 0.2}s`
          }}
        >
          <LeafIconDetailed className={cn(leafSize, 'text-amber')} />
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <TreeIcon className={cn(leafSize, 'text-forest scale-125')} />
      </div>
    </>
  )
}

// SVG Icons
function LeafIconDetailed({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
      <path d="M12 2L12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M12 6C12 6 14 8 16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M12 6C12 6 10 8 8 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <path d="M12 12C12 12 14 13 16 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M12 12C12 12 10 13 8 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 22V8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M12 8C12 8 8 6 8 3C8 1.5 9 0.5 10.5 1.5C12 2.5 12 8 12 8Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <path
        d="M12 8C12 8 16 6 16 3C16 1.5 15 0.5 13.5 1.5C12 2.5 12 8 12 8Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M12 12C12 12 9 11 9 8C9 7 9.5 6.5 10.5 7C11.5 7.5 12 12 12 12Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <path
        d="M12 12C12 12 15 11 15 8C15 7 14.5 6.5 13.5 7C12.5 7.5 12 12 12 12Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  )
}

function FlowerPetal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="12" cy="8" rx="4" ry="8" fill="currentColor" fillOpacity="0.7" className="text-leaf" />
    </svg>
  )
}

function FlowerCenter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="6" fill="currentColor" className="text-amber" />
      <circle cx="12" cy="12" r="3" fill="currentColor" className="text-sunset" fillOpacity="0.8" />
    </svg>
  )
}
