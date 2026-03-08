"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

interface WordCloudItem {
  text: string;
  value: number;
}

interface WordCloudProps {
  words: WordCloudItem[];
  maxFontSize?: number;
  minFontSize?: number;
  className?: string;
}

const WORD_COLORS = [
  "text-indigo-600 dark:text-indigo-400",
  "text-violet-600 dark:text-violet-400",
  "text-purple-600 dark:text-purple-400",
  "text-pink-600 dark:text-pink-400",
  "text-rose-600 dark:text-rose-400",
  "text-orange-600 dark:text-orange-400",
  "text-amber-600 dark:text-amber-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-teal-600 dark:text-teal-400",
  "text-cyan-600 dark:text-cyan-400",
  "text-blue-600 dark:text-blue-400",
  "text-sky-600 dark:text-sky-400",
];

export function WordCloud({
  words,
  maxFontSize = 40,
  minFontSize = 12,
  className,
}: WordCloudProps) {
  const processedWords = useMemo(() => {
    if (!words.length) return [];

    const maxVal = Math.max(...words.map((w) => w.value));
    const minVal = Math.min(...words.map((w) => w.value));
    const range = maxVal - minVal || 1;

    // Seeded shuffle for consistent layout
    const shuffled = [...words].sort(
      (a, b) => a.text.charCodeAt(0) - b.text.charCodeAt(0) + (a.value - b.value)
    );

    return shuffled.map((word, index) => {
      const normalized = (word.value - minVal) / range;
      const fontSize =
        minFontSize + normalized * (maxFontSize - minFontSize);
      const opacity = 0.5 + normalized * 0.5;
      const colorClass = WORD_COLORS[index % WORD_COLORS.length];

      return {
        ...word,
        fontSize,
        opacity,
        colorClass,
      };
    });
  }, [words, maxFontSize, minFontSize]);

  if (!processedWords.length) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-48 text-muted-foreground text-sm",
          className
        )}
      >
        No text data available
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4",
        className
      )}
    >
      {processedWords.map((word) => (
        <span
          key={word.text}
          className={cn(
            "inline-block font-semibold transition-all hover:scale-110 cursor-default",
            word.colorClass
          )}
          style={{
            fontSize: `${word.fontSize}px`,
            opacity: word.opacity,
            lineHeight: 1.2,
          }}
          title={`${word.text}: ${word.value}`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
