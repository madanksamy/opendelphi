"use client";

import { cn } from "@/lib/utils/cn";
import { CheckCircle2 } from "lucide-react";

interface CompletionScreenProps {
  message?: string;
  className?: string;
}

export function CompletionScreen({
  message = "Thank you for completing this survey! Your responses have been recorded.",
  className,
}: CompletionScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-green-400/20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-[scale-in_0.5s_ease-out]" />
        </div>
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-3">
        Response Submitted
      </h2>
      <p className="text-muted-foreground max-w-md text-base leading-relaxed">
        {message}
      </p>
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
