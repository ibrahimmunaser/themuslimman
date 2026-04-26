import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { PARTS } from "@/lib/content";
import { ERAS, ERA_MAP } from "@/lib/types";
import { ChevronRight, Video, Play, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const parts = PARTS;

  const totalParts = parts.length;
  const firstUnwatchedPart = parts[4]; // Mock: user has watched 4 parts

  const eraGroups = ERAS.map((era) => ({
    era,
    parts: parts.filter((p) => p.era === era.id),
    completedCount: 0, // mock
  })).filter((g) => g.parts.length > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-text-muted text-sm mb-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          As-salamu alaykum, {user.fullName.split(" ")[0]}
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Continue your journey through the Seerah.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Parts", value: totalParts, icon: BookOpen },
          { label: "In Progress", value: "Part 5", icon: Play },
          { label: "Est. Hours", value: "85+", icon: Clock },
          { label: "Your Role", value: user.role.charAt(0).toUpperCase() + user.role.slice(1), icon: Video },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-gold" />
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
              <p className="text-lg font-bold text-text">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Continue where you left off */}
      {firstUnwatchedPart && (
        <div className="mb-8">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Continue where you left off</p>
          <Link
            href={`/parts/${firstUnwatchedPart.id}`}
            prefetch={false}
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-surface hover:border-gold/30 hover:bg-surface-raised transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:border-gold/40 transition-colors">
              <Video className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="gold" size="sm">Part {firstUnwatchedPart.partNumber}</Badge>
                <span className="text-xs text-text-muted">{firstUnwatchedPart.era in ERA_MAP ? ERA_MAP[firstUnwatchedPart.era as keyof typeof ERA_MAP].label : ""}</span>
              </div>
              <p className="font-semibold text-text truncate">{firstUnwatchedPart.title}</p>
              <p className="text-xs text-text-secondary mt-0.5">{firstUnwatchedPart.duration} · Video + Audio + Briefing</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-gold transition-colors flex-shrink-0" />
          </Link>
        </div>
      )}

      {/* Seerah sections / era groups */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Your Seerah Journey</p>
          <Link
            href="/parts"
            className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
          >
            Browse all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {eraGroups.map(({ era, parts: eraParts }) => (
            <div
              key={era.id}
              className="border border-border bg-surface rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: era.color }}
                  />
                  <div>
                    <p className="font-semibold text-text text-sm">{era.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{eraParts.length} parts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 bg-surface-raised rounded-full h-1">
                      <div
                        className="h-1 rounded-full bg-gold/40"
                        style={{ width: "0%" }}
                      />
                    </div>
                    <span className="text-xs text-text-muted">0 / {eraParts.length}</span>
                  </div>
                  <Link
                    href={`/parts?era=${era.id}`}
                    className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* First 3 parts preview */}
              <div className="border-t border-border divide-y divide-border">
                {eraParts.slice(0, 3).map((part) => (
                  <Link
                    key={part.id}
                    href={`/parts/${part.id}`}
                    prefetch={false}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface-raised transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-surface-raised border border-border flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-text-muted font-medium">{part.partNumber}</span>
                    </div>
                    <p className="text-sm text-text-secondary group-hover:text-text transition-colors flex-1 truncate">
                      {part.title}
                    </p>
                    <span className="text-xs text-text-muted flex-shrink-0">{part.duration}</span>
                  </Link>
                ))}
                {eraParts.length > 3 && (
                  <Link
                    href={`/parts?era=${era.id}`}
                    className="flex items-center justify-center gap-1 py-3 text-xs text-text-muted hover:text-gold transition-colors"
                  >
                    +{eraParts.length - 3} more parts
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
