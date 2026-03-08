"use client";

import { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Download, Maximize2, Minimize2 } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  exportData?: { headers: string[]; rows: (string | number)[][] };
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  exportData,
  className,
}: ChartCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExportCSV = useCallback(() => {
    if (!exportData) return;
    const { headers, rows } = exportData;
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",")
              ? `"${cell}"`
              : String(cell)
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, "_").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [exportData, title]);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      cardRef.current?.requestFullscreen?.().catch(() => {
        // Fallback: just toggle state for CSS-based fullscreen
      });
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsFullscreen((f) => !f);
  }, [isFullscreen]);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "transition-all",
        isFullscreen &&
          "fixed inset-0 z-50 rounded-none border-0 overflow-auto",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="mt-1">{subtitle}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-1">
          {exportData && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleExportCSV}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
