"use client";

import { Button } from "@/components/ui/button";

export default function BookingError({ reset }: { reset: () => void }) {
  return (
    <div className="py-12 text-center">
      <h2 className="text-xl font-semibold mb-2">Unable to load booking</h2>
      <p className="text-sm text-muted-foreground mb-4">Please try again or reload the page.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
