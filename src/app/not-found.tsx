import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-8xl font-bold text-da-indigo">404</h1>
      <p className="mt-4 text-2xl font-semibold text-da-text">
        This page doesn&apos;t exist yet.
      </p>
      <p className="mt-2 text-da-muted">
        Maybe you should build it. That&apos;s kind of our whole thing.
      </p>
      <Button href="/" variant="primary" size="lg" className="mt-8">
        Back to Home
      </Button>
    </div>
  );
}
