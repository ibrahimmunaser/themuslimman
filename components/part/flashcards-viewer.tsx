"use client";

import { useState, useCallback } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import type { FlashcardSet, FlashcardLevel, Flashcard } from "@/lib/types";

interface FlashcardsViewerProps {
  flashcards: FlashcardSet;
}

const LEVELS: { id: FlashcardLevel; label: string }[] = [
  { id: "easy",   label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "full",   label: "Full" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function FlipCard({ card, index, total }: { card: Flashcard; index: number; total: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Progress dots */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="font-medium text-gold/80">
          Card {index + 1} of {total}
        </span>
        <div className="flex gap-1 flex-wrap justify-end max-w-[60%]">
          {Array.from({ length: Math.min(total, 20) }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-1 rounded-full transition-all",
                i < index   ? "bg-gold/40 w-3" :
                i === index ? "bg-gold w-5"     :
                              "bg-border w-3"
              )}
            />
          ))}
          {total > 20 && (
            <span className="text-[10px] text-text-muted ml-1">+{total - 20}</span>
          )}
        </div>
      </div>

      {/* Flip card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "220px",
          }}
        >
          {/* Front — question */}
          <div
            className="absolute inset-0 flex flex-col items-center rounded-2xl border border-border bg-surface-raised p-6 sm:p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-[10px] font-semibold tracking-widest uppercase text-gold/50 mb-4">
              Question
            </span>
            <p className="text-base sm:text-lg font-medium text-text leading-relaxed flex-1 flex items-center text-center">
              {card.side1}
            </p>
            <p className="text-xs text-text-muted mt-4">
              Tap to reveal answer
            </p>
          </div>

          {/* Back — answer */}
          <div
            className="absolute inset-0 flex flex-col items-center rounded-2xl border border-gold/20 bg-surface-raised p-6 sm:p-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="text-[10px] font-semibold tracking-widest uppercase text-gold/50 mb-4">
              Answer
            </span>
            <p className="text-base sm:text-lg font-medium text-text leading-relaxed flex-1 flex items-center text-center">
              {card.side2}
            </p>
            {card.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-text-muted bg-surface border border-border px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted">
        {flipped ? "Tap card to flip back" : "Tap card to see answer"}
      </p>
    </div>
  );
}

export function FlashcardsViewer({ flashcards }: FlashcardsViewerProps) {
  const [level, setLevel] = useState<FlashcardLevel>("easy");
  const [index, setIndex] = useState(0);
  const [deck, setDeck] = useState<Flashcard[]>(flashcards.easy);
  const [shuffled, setShuffled] = useState(false);

  const switchLevel = useCallback((newLevel: FlashcardLevel) => {
    setLevel(newLevel);
    setIndex(0);
    setShuffled(false);
    setDeck(flashcards[newLevel]);
  }, [flashcards]);

  const handleShuffle = () => {
    setDeck(shuffleArray(deck));
    setIndex(0);
    setShuffled(true);
  };

  const handleReset = () => {
    setDeck(flashcards[level]);
    setIndex(0);
    setShuffled(false);
  };

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(deck.length - 1, i + 1));

  const card = deck[index];

  if (!card) {
    return (
      <div className="py-10 text-center">
        <p className="text-text-secondary text-sm">No flashcards available for this level.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Level selector + controls */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-1.5">
          {LEVELS.map((l) => {
            const count = flashcards.counts[l.id];
            return (
              <button
                key={l.id}
                onClick={() => switchLevel(l.id)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  level === l.id
                    ? "bg-gold/15 text-gold border-gold/25"
                    : "bg-surface text-text-muted border-border hover:text-text-secondary"
                )}
              >
                {l.label}
                <span className={clsx(
                  "text-[10px] tabular-nums",
                  level === l.id ? "text-gold/70" : "text-text-muted"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-1.5">
          {shuffled ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface text-text-muted hover:text-text-secondary transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          ) : (
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface text-text-muted hover:text-text-secondary transition-colors"
            >
              <Shuffle className="w-3 h-3" />
              Shuffle
            </button>
          )}
        </div>
      </div>

      {/* Card */}
      <FlipCard key={`${level}-${index}-${shuffled}`} card={card} index={index} total={deck.length} />

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
            index === 0
              ? "border-border text-text-muted opacity-40 cursor-not-allowed"
              : "border-border bg-surface text-text-secondary hover:border-gold/30 hover:text-text"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-xs text-text-muted tabular-nums">
          {index + 1} / {deck.length}
        </span>

        <button
          onClick={next}
          disabled={index === deck.length - 1}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
            index === deck.length - 1
              ? "border-border text-text-muted opacity-40 cursor-not-allowed"
              : "border-gold/25 bg-gold/10 text-gold hover:bg-gold/15"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
