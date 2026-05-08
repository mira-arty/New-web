"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Алдаа гарлаа</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Хуудсыг ачаалахад алдаа гарлаа. Дахин оролдоно уу.
      </p>
      <Button onClick={reset} variant="outline">
        Дахин ачаалах
      </Button>
    </div>
  );
}
