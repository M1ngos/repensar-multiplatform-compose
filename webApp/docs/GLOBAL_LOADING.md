# Global Loading System

A beautiful, nature-inspired global loading system that can be triggered from anywhere in your application.

## Features

- Beautiful nature-themed loading animation with leaves and seedlings
- Global state management via React Context
- Custom loading text support
- Smooth transitions and animations
- Dark mode compatible
- Already integrated into your app layout
- Easy-to-use hooks

## Architecture

The system consists of three main parts:

1. **LoadingProvider** - Context provider that manages global loading state
2. **LoadingOverlay** - Visual component that displays the nature loader
3. **useLoading** - Hook to control the loading state from anywhere

## Setup

The global loading system is already set up in your app! It's configured in:

```tsx
// src/app/[locale]/layout.tsx
<LoadingProvider>
  <LoadingReset />
  <LoadingOverlay />
  {children}
</LoadingProvider>
```

## Usage

### Basic Usage

```tsx
'use client'

import { useLoading } from '@/lib/hooks/useLoading'

export function MyComponent() {
  const { startLoading, stopLoading } = useLoading()

  const handleClick = async () => {
    startLoading()
    await someAsyncOperation()
    stopLoading()
  }

  return <button onClick={handleClick}>Do Something</button>
}
```

### With Custom Text

```tsx
const handleSubmit = async (data) => {
  startLoading('Planting your changes...')
  await api.submit(data)
  stopLoading()
}
```

### In Form Handlers

```tsx
const onSubmit = async (formData) => {
  try {
    startLoading('Saving your data...')
    const result = await saveToDatabase(formData)
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    stopLoading()
  }
}
```

### In Data Fetching

```tsx
useEffect(() => {
  const loadData = async () => {
    startLoading('Fetching resources...')
    try {
      const data = await fetchData()
      setData(data)
    } finally {
      stopLoading()
    }
  }
  loadData()
}, [])
```

### With Router Navigation

```tsx
import { useRouter } from 'next/navigation'
import { useLoading } from '@/lib/hooks/useLoading'

export function NavigationButton() {
  const router = useRouter()
  const { startLoading } = useLoading()

  const navigate = () => {
    startLoading('Loading page...')
    router.push('/destination')
    // stopLoading will be called automatically by LoadingReset
  }

  return <button onClick={navigate}>Navigate</button>
}
```

## API Reference

### `useLoading()`

Returns an object with the following properties and methods:

#### Properties

- `isLoading: boolean` - Current loading state
- `loadingText?: string` - Current loading text

#### Methods

- `setLoading(loading: boolean, text?: string)` - Manually set loading state
- `startLoading(text?: string)` - Start loading with optional custom text
- `stopLoading()` - Stop loading

### Examples

```tsx
const { isLoading, loadingText, setLoading, startLoading, stopLoading } = useLoading()

// Start with default text
startLoading()

// Start with custom text
startLoading('Growing your forest...')

// Check current state
if (isLoading) {
  console.log('Currently loading:', loadingText)
}

// Manual control
setLoading(true, 'Custom message')
setLoading(false)

// Stop loading
stopLoading()
```

## Custom Loading Messages

Here are some nature-themed loading messages that fit your brand:

```tsx
// Data operations
startLoading('Growing your data...')
startLoading('Cultivating results...')
startLoading('Nurturing your request...')

// Saving operations
startLoading('Planting your changes...')
startLoading('Sowing your updates...')
startLoading('Rooting your data...')

// Fetching operations
startLoading('Harvesting information...')
startLoading('Gathering resources...')
startLoading('Sprouting results...')

// Form submissions
startLoading('Blossoming your submission...')
startLoading('Branching out...')
startLoading('Taking root...')

// Page transitions
startLoading('Growing new paths...')
startLoading('Blooming into view...')
startLoading('Flourishing ahead...')
```

## Best Practices

### 1. Always Use Try-Finally

```tsx
try {
  startLoading('Processing...')
  await riskyOperation()
} finally {
  stopLoading() // Always stops, even if error occurs
}
```

### 2. Minimum Loading Time

The system automatically ensures a minimum display time of 800ms (configured in LoadingReset) to prevent flickering for very fast operations.

### 3. Don't Nest Loading States

```tsx
// ❌ Bad - nested loading
startLoading('First task')
await task1()
startLoading('Second task') // This will work but may look odd
await task2()
stopLoading()

// ✅ Good - sequential with single loading state
startLoading('Processing tasks...')
await task1()
await task2()
stopLoading()
```

### 4. Clear Loading Text

Use descriptive, action-oriented text that tells users what's happening:

```tsx
// ❌ Vague
startLoading('Please wait...')

// ✅ Descriptive
startLoading('Saving your project...')
```

## Customization

### Change Loading Animation Variant

To use a different nature loader variant, edit the LoadingOverlay component:

```tsx
// components/ui/loading-overlay.tsx
import { NatureLoaderDeluxe } from '@/components/nature-loader-deluxe'

// Change to deluxe variant
<NatureLoaderDeluxe
  size="lg"
  variant="falling-leaves" // or 'blooming', 'seasons'
  text={loadingText || t('loading')}
/>
```

### Change Animation Size

```tsx
<NatureLoader
  size="xl" // or 'sm', 'md', 'lg'
  text={loadingText || t('loading')}
/>
```

### Custom Backdrop

Edit the overlay div in `components/ui/loading-overlay.tsx`:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/90 backdrop-blur-md">
  {/* Custom background color and blur */}
</div>
```

## Troubleshooting

### Loading doesn't appear

Make sure your component is wrapped in the LoadingProvider (it should be by default in the layout).

### Loading doesn't disappear

Always call `stopLoading()` in a `finally` block to ensure it's called even if errors occur.

### Text doesn't update

The loading text updates immediately when you call `startLoading()` with a new message.

## Advanced Usage

### Using Helper Utilities

The `createLoadingHelpers` utility provides convenient wrappers:

```tsx
import { useLoading } from '@/lib/hooks/useLoading'
import { createLoadingHelpers, LoadingMessages } from '@/lib/hooks/useLoadingHelpers'

function MyComponent() {
  const { startLoading, stopLoading } = useLoading()
  const helpers = createLoadingHelpers(startLoading, stopLoading)

  // Wrap async functions
  const saveData = helpers.wrap(
    async (data) => await api.save(data),
    LoadingMessages.saving
  )

  // Execute with callbacks
  const fetchData = async () => {
    await helpers.execute({
      execute: async () => await api.fetch(),
      text: LoadingMessages.fetching,
      onSuccess: (data) => setData(data),
      onError: (err) => showError(err)
    })
  }

  // Use preset messages
  startLoading(helpers.getMessage('creating'))

  return <button onClick={() => saveData(myData)}>Save</button>
}
```

### Preset Nature-Themed Messages

Use the `LoadingMessages` object for consistent messaging:

```tsx
import { LoadingMessages } from '@/lib/hooks/useLoadingHelpers'

startLoading(LoadingMessages.saving)        // "Planting your changes..."
startLoading(LoadingMessages.fetching)      // "Harvesting information..."
startLoading(LoadingMessages.creating)      // "Sprouting new growth..."
startLoading(LoadingMessages.uploading)     // "Planting your files..."
// ... and many more!
```

### Progress Tracking

For longer operations, you can update the text to show progress:

```tsx
const processItems = async (items) => {
  for (let i = 0; i < items.length; i++) {
    startLoading(`Processing item ${i + 1} of ${items.length}...`)
    await processItem(items[i])
  }
  stopLoading()
}
```

## Related Components

- `NatureLoader` - The basic nature-inspired loader component
- `NatureLoaderDeluxe` - Enhanced version with multiple animation variants
- `GlobalNatureLoader` - Standalone global loader (not used in this system)

## See Also

- [Nature Loader Documentation](../components/nature-loader.md)
- [Loading Demo Component](../components/loading-demo.tsx)
