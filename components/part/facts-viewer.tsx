"use client";

interface FactsViewerProps {
  content: string;
}

export function FactsViewer({ content }: FactsViewerProps) {
  const facts = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return (
    <ol className="space-y-2">
      {facts.map((fact, i) => (
        <li key={i} className="flex gap-3.5 items-baseline">
          <span className="flex-shrink-0 w-6 text-right text-xs font-semibold text-gold/60 tabular-nums mt-[1px]">
            {i + 1}
          </span>
          <span className="text-sm text-text leading-relaxed">{fact}</span>
        </li>
      ))}
    </ol>
  );
}
