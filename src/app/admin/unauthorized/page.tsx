export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, Home, LogOut } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>This could be because:</p>
            <ul className="text-left space-y-1 ml-4">
              <li>• Your account is not activated</li>
              <li>• You don't have admin privileges</li>
              <li>• Your session has expired</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/admin/login">
                <LogOut className="h-4 w-4 mr-2" />
                Try Login Again
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 text-xs text-muted-foreground">
            <p>Contact the system administrator if you believe this is an error</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
