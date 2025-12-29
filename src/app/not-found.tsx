import Link from 'next/link';
import { Button } from '@/components/design-system/atoms/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  );
}

