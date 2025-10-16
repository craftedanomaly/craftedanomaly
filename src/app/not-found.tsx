import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <h1 className="text-8xl lg:text-9xl font-bold text-accent mb-4">404</h1>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-heading text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            This page is an anomaly... or not.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/projects">
                <Search className="h-4 w-4 mr-2" />
                Browse Projects
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-1">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/3 rounded-full blur-2xl -z-10"></div>
      </div>
    </div>
  );
}
