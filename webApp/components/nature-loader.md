# Nature Loader

A beautiful, nature-inspired loading animation featuring animated leaves and a growing seedling. Perfect for eco-friendly and sustainability-focused applications.

## Features

- Multiple size variants (sm, md, lg, xl)
- Smooth, organic animations
- Custom text support
- Global full-screen variant
- Dark mode support
- Uses your existing nature-themed color palette
- Deluxe variants with enhanced visual effects

## Components

### `NatureLoader`

The main inline loading component with spinning leaves and a central seedling.

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Size variant (default: 'md')
- `className?: string` - Additional CSS classes
- `text?: string` - Optional loading text to display below the animation

### `NatureLoaderDeluxe`

Enhanced version with multiple animation variants and particle effects.

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Size variant (default: 'md')
- `className?: string` - Additional CSS classes
- `text?: string` - Optional loading text to display below the animation
- `variant?: 'default' | 'falling-leaves' | 'blooming' | 'seasons'` - Animation variant (default: 'default')

**Variants:**
- **default**: Enhanced spinning leaves with particles and glow effects
- **falling-leaves**: Leaves falling from top to bottom with rotation
- **blooming**: Flower petals expanding outward in a blooming animation
- **seasons**: Cycles through spring (green) and autumn (orange) leaves

### `GlobalNatureLoader`

A full-screen loading overlay with backdrop blur.

**Props:**
- `text?: string` - Loading text (default: 'Loading...')

## Usage Examples

### Basic Usage

```tsx
import { NatureLoader } from '@/components/nature-loader'

export function MyComponent() {
  return <NatureLoader />
}
```

### With Custom Size and Text

```tsx
<NatureLoader
  size="lg"
  text="Growing your sustainable future..."
/>
```

### Centered in a Container

```tsx
<div className="flex items-center justify-center min-h-[400px]">
  <NatureLoader size="md" text="Loading projects..." />
</div>
```

### Deluxe Variants

```tsx
import { NatureLoaderDeluxe } from '@/components/nature-loader-deluxe'

// Enhanced default with particles
<NatureLoaderDeluxe variant="default" size="lg" text="Loading..." />

// Falling leaves animation
<NatureLoaderDeluxe variant="falling-leaves" size="md" text="Gathering resources..." />

// Blooming flower animation
<NatureLoaderDeluxe variant="blooming" size="lg" text="Blossoming..." />

// Seasons cycling animation
<NatureLoaderDeluxe variant="seasons" size="md" text="Through the seasons..." />
```

### Full-Screen Loading State

```tsx
import { GlobalNatureLoader } from '@/components/nature-loader'

export function App() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      {isLoading && <GlobalNatureLoader text="Preparing your workspace..." />}
      <YourContent />
    </>
  )
}
```

### Conditional Loading in a Card

```tsx
<Card>
  <CardContent className="p-8">
    {isLoading ? (
      <NatureLoader size="md" text="Fetching data..." />
    ) : (
      <DataTable data={data} />
    )}
  </CardContent>
</Card>
```

### With Custom Styling

```tsx
<NatureLoader
  size="xl"
  className="my-8"
  text="Loading your environmental impact report..."
/>
```

## Animation Details

The loader features:

1. **Spinning Leaves** - Five leaves arranged in a circle, rotating with staggered timing
2. **Floating Effect** - Each leaf gently floats up and down
3. **Growing Seedling** - Center icon pulses to represent growth
4. **Organic Colors** - Uses your theme's nature-inspired color palette

## Customization

The component uses CSS custom properties from your global theme:
- `--leaf` - Leaf color
- `--growth` - Seedling color

You can customize these in your `globals.css` file to match your brand.

## Accessibility

- Uses semantic HTML
- Includes appropriate ARIA attributes (can be added)
- Respects prefers-reduced-motion (can be enhanced)

## Performance

- Pure CSS animations for smooth 60fps performance
- No JavaScript animation loops
- Minimal bundle size impact
