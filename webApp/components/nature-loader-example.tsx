'use client'

import { NatureLoader, GlobalNatureLoader } from './nature-loader'
import { NatureLoaderDeluxe } from './nature-loader-deluxe'

/**
 * Example usage of the NatureLoader components
 *
 * This file demonstrates how to use the leaf-inspired loading animations
 * in different scenarios within your application.
 */

export function NatureLoaderExamples() {
  return (
    <div className="p-8 space-y-16">
      <section>
        <h1 className="text-3xl font-bold mb-8 text-center">Nature Loader Gallery</h1>
        <p className="text-muted-foreground text-center mb-12">
          Beautiful, nature-inspired loading animations for your sustainable application
        </p>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold mb-6">Basic Loader Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium mb-4">Small</h3>
            <NatureLoader size="sm" />
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium mb-4">Medium</h3>
            <NatureLoader size="md" />
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium mb-4">Large</h3>
            <NatureLoader size="lg" />
          </div>
          <div className="flex flex-col items-center p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium mb-4">Extra Large</h3>
            <NatureLoader size="xl" />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold mb-6">With Custom Text</h2>
        <div className="flex justify-center p-8 bg-card rounded-lg border">
          <NatureLoader size="md" text="Loading your sustainable journey..." />
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold mb-6">Deluxe Variants</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center p-8 bg-card rounded-lg border min-h-[300px]">
            <h3 className="text-sm font-medium mb-6">Default Enhanced</h3>
            <NatureLoaderDeluxe size="md" variant="default" text="Growing..." />
          </div>

          <div className="flex flex-col items-center p-8 bg-card rounded-lg border min-h-[300px]">
            <h3 className="text-sm font-medium mb-6">Falling Leaves</h3>
            <NatureLoaderDeluxe size="md" variant="falling-leaves" text="Autumn breeze..." />
          </div>

          <div className="flex flex-col items-center p-8 bg-card rounded-lg border min-h-[300px]">
            <h3 className="text-sm font-medium mb-6">Blooming Flower</h3>
            <NatureLoaderDeluxe size="md" variant="blooming" text="Blossoming..." />
          </div>

          <div className="flex flex-col items-center p-8 bg-card rounded-lg border min-h-[300px]">
            <h3 className="text-sm font-medium mb-6">Four Seasons</h3>
            <NatureLoaderDeluxe size="md" variant="seasons" text="Cycling through time..." />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold mb-6">Large Deluxe Variants</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center p-12 bg-gradient-to-br from-background to-muted rounded-lg border min-h-[400px]">
            <h3 className="text-lg font-medium mb-8">Extra Large Falling Leaves</h3>
            <NatureLoaderDeluxe size="xl" variant="falling-leaves" text="Nature at work..." />
          </div>

          <div className="flex flex-col items-center p-12 bg-gradient-to-br from-background to-muted rounded-lg border min-h-[400px]">
            <h3 className="text-lg font-medium mb-8">Extra Large Blooming</h3>
            <NatureLoaderDeluxe size="xl" variant="blooming" text="Spring awakening..." />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Global Full-Screen Loader</h2>
        <div className="p-6 bg-card rounded-lg border">
          <p className="mb-4 text-muted-foreground">
            Use this for page-level loading states. It will cover the entire screen
            with a backdrop blur effect.
          </p>
          <code className="block bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            {`<GlobalNatureLoader text="Preparing your workspace..." />`}
          </code>
        </div>
      </section>
    </div>
  )
}

/**
 * Usage Examples:
 *
 * 1. Basic inline loader:
 *    <NatureLoader />
 *
 * 2. Small loader with custom text:
 *    <NatureLoader size="sm" text="Loading..." />
 *
 * 3. Large centered loader:
 *    <div className="flex items-center justify-center min-h-screen">
 *      <NatureLoader size="lg" text="Growing your content..." />
 *    </div>
 *
 * 4. Global full-screen loader (for page transitions):
 *    {isLoading && <GlobalNatureLoader text="Loading page..." />}
 *
 * 5. Inside a card or section:
 *    <Card>
 *      <CardContent>
 *        {isLoading ? (
 *          <NatureLoader size="md" text="Fetching data..." />
 *        ) : (
 *          <YourContent />
 *        )}
 *      </CardContent>
 *    </Card>
 */
