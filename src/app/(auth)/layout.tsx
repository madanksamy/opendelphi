import Link from "next/link";
import { Hexagon } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <Hexagon className="h-8 w-8 text-primary" strokeWidth={2.5} />
        <span className="text-2xl font-bold tracking-tight text-foreground">
          OpenDelphi
        </span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
        {children}
      </div>
    </div>
  );
}
