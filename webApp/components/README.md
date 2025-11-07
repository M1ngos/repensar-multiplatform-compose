# Components

## Nature Loading System

Beautiful, nature-inspired loading animations integrated globally throughout the application.

### Quick Start

```tsx
import { useLoading } from '@/lib/hooks/useLoading'

function MyComponent() {
  const { startLoading, stopLoading } = useLoading()

  const handleSave = async () => {
    try {
      startLoading('Planting your changes...')
      await api.save(data)
    } finally {
      stopLoading()
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

### Available Components

#### Core Loaders
- **`NatureLoader`** - Main spinning leaves animation
- **`NatureLoaderDeluxe`** - Enhanced with multiple variants
  - `default` - Spinning with particles
  - `falling-leaves` - Autumn animation
  - `blooming` - Flower petals
  - `seasons` - Spring/autumn cycle

#### Demos
- **`LoadingDemo`** - Interactive global loader demo
- **`NatureLoaderExamples`** - Visual gallery of all variants
- **`LoadingExamplesAdvanced`** - Advanced patterns & helpers

### Documentation

- 📖 [Full Documentation](../docs/GLOBAL_LOADING.md)
- ⚡ [Quick Reference](../docs/LOADING_QUICK_REFERENCE.md)
- 📋 [Implementation Summary](../docs/NATURE_LOADER_SUMMARY.md)
- 🎨 [Component Details](./nature-loader.md)

### Helper Utilities

```tsx
import { createLoadingHelpers, LoadingMessages } from '@/lib/hooks/useLoadingHelpers'

const helpers = createLoadingHelpers(startLoading, stopLoading)

// Wrap functions
const save = helpers.wrap(api.save, LoadingMessages.saving)

// Use preset messages
startLoading(LoadingMessages.fetching)
```

### Integration

The global loading system is already active! The `LoadingOverlay` component in your root layout automatically displays the nature loader when `startLoading()` is called from anywhere in the app.

### Examples

See the demo components for live examples:
- `components/loading-demo.tsx`
- `components/loading-examples-advanced.tsx`
- `components/nature-loader-example.tsx`
