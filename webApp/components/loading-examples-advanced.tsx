'use client'

import { useLoading } from '@/lib/hooks/useLoading'
import { createLoadingHelpers, LoadingMessages } from '@/lib/hooks/useLoadingHelpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Advanced examples showing helper utilities and best practices
 */
export function LoadingExamplesAdvanced() {
  const { startLoading, stopLoading } = useLoading()
  const helpers = createLoadingHelpers(startLoading, stopLoading)

  // Example 1: Using the wrap helper
  const saveData = helpers.wrap(
    async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Data saved:', data)
    },
    LoadingMessages.saving
  )

  // Example 2: Using the execute helper
  const fetchUserData = async () => {
    await helpers.execute({
      execute: async () => {
        await new Promise(resolve => setTimeout(resolve, 2500))
        return { user: 'John Doe', role: 'admin' }
      },
      text: LoadingMessages.fetching,
      onSuccess: (result) => {
        console.log('Fetched:', result)
      },
      onError: (error) => {
        console.error('Error:', error)
      }
    })
  }

  // Example 3: Custom messages from helpers
  const createProject = async () => {
    startLoading(helpers.getMessage('creating'))
    await new Promise(resolve => setTimeout(resolve, 2000))
    stopLoading()
  }

  // Example 4: Simulate loading for testing
  const testLoading = () => {
    helpers.simulate(3000, 'Testing loading animation...')
  }

  // Example 5: Multiple sequential operations
  const multiStepOperation = async () => {
    try {
      startLoading(LoadingMessages.validating)
      await new Promise(resolve => setTimeout(resolve, 1000))

      startLoading(LoadingMessages.processing)
      await new Promise(resolve => setTimeout(resolve, 1500))

      startLoading(LoadingMessages.saving)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      stopLoading()
    }
  }

  // Example 6: File upload
  const uploadFiles = helpers.wrap(
    async (files: File[]) => {
      await new Promise(resolve => setTimeout(resolve, 3000))
      console.log('Uploaded:', files)
    },
    LoadingMessages.uploading
  )

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Advanced Loading Examples</h1>
        <p className="text-muted-foreground text-lg">
          Using helper utilities and best practices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Wrapped Function</CardTitle>
            <CardDescription>Using helpers.wrap() for auto-loading</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => saveData({ name: 'test' })} className="w-full">
              Save Data (Wrapped)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execute Helper</CardTitle>
            <CardDescription>Using helpers.execute() with callbacks</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchUserData} className="w-full">
              Fetch User Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preset Messages</CardTitle>
            <CardDescription>Using getMessage() for consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createProject} className="w-full" variant="outline">
              Create Project
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulate Loading</CardTitle>
            <CardDescription>Testing loading states</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testLoading} className="w-full" variant="outline">
              Test Loading (3s)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multi-Step Operation</CardTitle>
            <CardDescription>Sequential operations with different messages</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={multiStepOperation} className="w-full" variant="secondary">
              Run Multi-Step
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>Wrapped file upload function</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => uploadFiles([new File([''], 'test.txt')])}
              className="w-full"
              variant="secondary"
            >
              Upload Files
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Available Nature-Themed Messages</CardTitle>
          <CardDescription>Pre-defined loading messages for consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(LoadingMessages).map(([key, value]) => (
              <div key={key} className="bg-background p-3 rounded-lg border">
                <code className="text-xs text-muted-foreground">{key}</code>
                <p className="text-sm mt-1">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. Wrap Functions:</h3>
            <pre className="bg-background p-4 rounded-lg overflow-x-auto text-sm">
{`const helpers = createLoadingHelpers(startLoading, stopLoading)

const saveData = helpers.wrap(
  async (data) => await api.save(data),
  LoadingMessages.saving
)

// Use it like a normal function
await saveData(myData)`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Execute with Callbacks:</h3>
            <pre className="bg-background p-4 rounded-lg overflow-x-auto text-sm">
{`await helpers.execute({
  execute: async () => await fetchData(),
  text: LoadingMessages.fetching,
  onSuccess: (data) => setData(data),
  onError: (err) => showError(err)
})`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Use Preset Messages:</h3>
            <pre className="bg-background p-4 rounded-lg overflow-x-auto text-sm">
{`startLoading(helpers.getMessage('saving'))
await saveOperation()
stopLoading()`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Test Loading States:</h3>
            <pre className="bg-background p-4 rounded-lg overflow-x-auto text-sm">
{`// Simulate 2 seconds of loading
await helpers.simulate(2000, 'Testing...')`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
