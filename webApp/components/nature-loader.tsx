'use client'

import { cn } from '../lib/utils'
import { useEffect, useState } from 'react'

interface NatureLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function NatureLoader({ size = 'md', className, text }: NatureLoaderProps) {
  const [stage, setStage] = useState(0) // 0: seed, 1: sprout, 2: leaves

  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56'
  }

  const iconSizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const particleSizeMap = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
    xl: 'w-3 h-3'
  }

  // Progressive animation: seed -> sprout -> leaves (faster cycle)
  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 400)
    const timer2 = setTimeout(() => setStage(2), 800)
    const cycleTimer = setInterval(() => {
      setStage(0)
      setTimeout(() => setStage(1), 400)
      setTimeout(() => setStage(2), 800)
    }, 2000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearInterval(cycleTimer)
    }
  }, [])

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      <div className={cn('relative', sizeMap[size])}>
        {/* Ambient glow with pulsing */}
        <div className="absolute inset-0 bg-gradient-radial from-leaf/20 via-leaf/5 to-transparent blur-2xl animate-pulse-soft" />

        {/* Rising particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className={cn(
              'absolute rounded-full bg-leaf/30 animate-particle-rise',
              particleSizeMap[size]
            )}
            style={{
              left: `${20 + i * 10}%`,
              bottom: '20%',
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          />
        ))}

        {/* Ground line with wave */}
        <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-3/4">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-leaf/40 to-transparent animate-wave-pulse" />
        </div>

        {/* Main plant container */}
        <div className="absolute inset-0 flex items-center justify-center pb-4">
          {/* Stage 0: Seed */}
          <div
            className={cn(
              'absolute transition-all duration-500 ease-out',
              stage === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            )}
          >
            <SeedIcon className={cn(iconSizeMap[size], 'text-growth drop-shadow-lg')} />
          </div>

          {/* Stage 1: Sprout */}
          <div
            className={cn(
              'absolute transition-all duration-500 ease-out',
              stage === 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
            )}
          >
            <SproutIcon className={cn(iconSizeMap[size], 'text-growth drop-shadow-lg')} />
          </div>

          {/* Stage 2: Plant with Leaves */}
          <div
            className={cn(
              'absolute transition-all duration-500 ease-out',
              stage === 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-4'
            )}
          >
            <PlantIcon className={cn(iconSizeMap[size], 'text-leaf drop-shadow-lg')} />
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

// Stage 0: Seed
function SeedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Seed shell */}
      <ellipse
        cx="12"
        cy="13"
        rx="4"
        ry="5"
        fill="currentColor"
        fillOpacity="0.8"
        className="animate-seed-pulse"
      />
      {/* Seed line detail */}
      <path
        d="M12 8C12 8 10 11 10 13C10 15 10 18 12 18C14 18 14 15 14 13C14 11 12 8 12 8Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Small roots starting */}
      <path
        d="M12 18C12 18 11 19 10 20M12 18C12 18 13 19 14 20"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  )
}

// Stage 1: Sprout
function SproutIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stem */}
      <path
        d="M12 22V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-grow-up"
      />
      {/* First tiny leaf */}
      <path
        d="M12 14C12 14 10 13 9 11C8.5 10 9 9 10 10C11 11 12 14 12 14Z"
        fill="currentColor"
        fillOpacity="0.6"
        className="animate-leaf-emerge"
      />
      {/* Root system */}
      <path
        d="M12 22C12 22 10 23 8 24M12 22C12 22 14 23 16 24M12 22V24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  )
}

// Stage 2: Full Plant
function PlantIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main stem */}
      <path
        d="M12 22V8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left leaf - larger */}
      <path
        d="M12 12C12 12 7 11 6 7C5 4 6 3 8 5C10 7 12 12 12 12Z"
        fill="currentColor"
        fillOpacity="0.75"
        className="animate-leaf-sway"
      />
      {/* Right leaf - larger */}
      <path
        d="M12 12C12 12 17 11 18 7C19 4 18 3 16 5C14 7 12 12 12 12Z"
        fill="currentColor"
        fillOpacity="0.65"
        className="animate-leaf-sway-alt"
      />
      {/* Top left small leaf */}
      <path
        d="M12 9C12 9 9 8.5 8 6C7.5 5 8 4 9 5C10 6 12 9 12 9Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      {/* Top right small leaf */}
      <path
        d="M12 9C12 9 15 8.5 16 6C16.5 5 16 4 15 5C14 6 12 9 12 9Z"
        fill="currentColor"
        fillOpacity="0.6"
      />
      {/* Leaf veins */}
      <path
        d="M12 12C11 10.5 9 9 7 8"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M12 12C13 10.5 15 9 17 8"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.3"
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