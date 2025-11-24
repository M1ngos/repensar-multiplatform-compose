'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface UnauthorizedProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function Unauthorized({
  title = 'Access Denied',
  description = "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
  showBackButton = true,
  showHomeButton = true,
}: UnauthorizedProps) {
  const router = useRouter();

  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-10">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
              <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Error Code:</strong> 403 Forbidden
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This page requires specific permissions that your account doesn't have.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-center">
          {showBackButton && (
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}
          {showHomeButton && (
            <Button onClick={() => router.push('/portal')}>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
