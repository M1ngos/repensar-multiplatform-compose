'use client'

import { useLoading } from '@/lib/hooks/useLoading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Demo component showing how to use the global nature loader
 *
 * This component demonstrates various ways to trigger the global loading state
 */
export function LoadingDemo() {
  const { startLoading, stopLoading } = useLoading()

  const simulateShortTask = async () => {
    startLoading('Processing...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    stopLoading()
  }

  const simulateLongTask = async () => {
    startLoading('Fetching sustainable data...')
    await new Promise(resolve => setTimeout(resolve, 4000))
    stopLoading()
  }

  const simulateDataFetch = async () => {
    startLoading('Growing your forest...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    stopLoading()
  }

  const simulateFormSubmit = async () => {
    startLoading('Planting your changes...')
    await new Promise(resolve => setTimeout(resolve, 2500))
    stopLoading()
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Global Nature Loader Demo</h1>
        <p className="text-muted-foreground text-lg">
          Click any button below to see the beautiful nature-inspired loading animation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Short Task (2s)</CardTitle>
            <CardDescription>Triggers a brief loading state</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={simulateShortTask} className="w-full">
              Start Short Task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Long Task (4s)</CardTitle>
            <CardDescription>Demonstrates longer loading states</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={simulateLongTask} className="w-full">
              Start Long Task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Fetch</CardTitle>
            <CardDescription>Simulate fetching data from API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={simulateDataFetch} className="w-full" variant="outline">
              Fetch Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Submit</CardTitle>
            <CardDescription>Simulate form submission</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={simulateFormSubmit} className="w-full" variant="outline">
              Submit Form
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Basic Usage:</h3>
            <pre className="bg-background p-4 rounded-lg overflow-x-auto">
{`import { useLoading } from '@/lib/hooks/useLoading'

function MyComponent() {
  const { startLoading, stopLoading } = useLoading()

  const handleClick = async () => {
    startLoading('Loading...')
    await fetchData()
    stopLoading()
  }

  return <button onClick={handleClick}>Click me</button>
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">With Custom Text:</h3>
            <pre className="bg-background p-4 rounded-lg overflow-x-auto">
{`startLoading('Growing your sustainable future...')
await saveData()
stopLoading()`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">In Async Functions:</h3>
            <pre className="bg-background p-4 rounded-lg overflow-x-auto">
{`const handleSubmit = async (data) => {
  try {
    startLoading('Submitting your data...')
    await api.submit(data)
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    stopLoading()
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
