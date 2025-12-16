"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Reload</Button>
        </div>
        {process.env.NODE_ENV !== "production" && (
          <pre className="text-left text-xs bg-muted p-3 rounded overflow-auto max-h-48">{String(error?.message || "")}</pre>
        )}
      </div>
    </div>
  );
}
