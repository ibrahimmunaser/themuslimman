import Link from "next/link";
import {
  CheckCircle2,
  Video,
  Headphones,
  FileText,
  Map,
  Image,
  Layers,
  BookOpen,
  ChevronRight,
  Star,
  ArrowRight,
  Lock,
  Zap,
  LayoutDashboard,
  CircleCheck,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/queries/student";

export default async function LandingPage() {
  // Check if user is logged in and get their progress
  const user = await getCurrentUser();
  let userProgress = null;

  if (user?.studentProfileId) {
    try {
      const dashboardData = await getStudentDashboardData(user.studentProfileId);
      userProgress = dashboardData.recentProgress[0] || null; // Get most recent progress
    } catch (error) {
      console.error("Failed to fetch user progress:", error);
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-ink text-text">
      <Navbar />

      {/* ============================================
          HERO SECTION
      ============================================ */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 geo-pattern opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="gold" size="md" className="mb-6">
            Complete Seerah System — Now Available
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Finally Understand the Life of the
            <br />
            <span className="text-gradient-gold">Prophet ﷺ Clearly</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop piecing together random lectures. Get the full Seerah in one place —
            structured, complete, and easy to follow from beginning to end.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/preview/part-1"
              className={buttonClass("primary", "xl", "shadow-2xl shadow-gold/20")}
            >
              <Video className="w-5 h-5" />
              Watch Part 1 Free
            </Link>
            <Link
              href="#pricing"
              className={buttonClass("secondary", "xl")}
            >
              Get Complete Access
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="text-sm text-text-muted mb-12">
            No signup required ·{" "}
            <Link href="/preview/part-1" className="text-gold hover:text-gold-light underline-offset-4 hover:underline">
              Part 1
            </Link>{" "}
            and{" "}
            <Link href="/preview/part-2" className="text-gold hover:text-gold-light underline-offset-4 hover:underline">
              Part 2
            </Link>{" "}
            are free to preview
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>5,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>4.9/5.0 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>100+ Structured Parts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Instant Access</span>
            </div>
          </div>
        </div>

        {/* Dashboard preview - only show for logged-in users with progress */}
        {user && userProgress && (
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 mt-16">
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-black/50">
              <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-text-muted">themuslimman.com/dashboard</span>
                </div>
              </div>
              <div className="bg-surface-raised p-6 md:p-8">
                <div className="flex flex-col gap-4">
                  {/* User's actual progress */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider">Continue where you left off</p>
                      <h3 className="text-text font-semibold mt-1">
                        Part {userProgress.classCourseItem.seerahPart?.partNumber}: {userProgress.classCourseItem.seerahPart?.title || "Loading..."}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                      <Video className="w-4 h-4 text-gold" />
                    </div>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5">
                    <div 
                      className="bg-gold h-1.5 rounded-full" 
                      style={{ width: `${userProgress.completionPercentage || 0}%` }} 
                    />
                  </div>
                  <div className="text-xs text-text-muted">
                    {userProgress.completionPercentage || 0}% complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============================================
          THE PROBLEM
      ============================================ */}
      <section className="section-pad border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-4">
              Sound Familiar?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Most Muslims know fragments of the Seerah.
              <br />
              <span className="text-text-secondary">Not the full picture.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: "🧩",
                title: "Scattered Knowledge",
                desc: "You know a story here, a name there — but the full timeline has never been clear in your mind.",
              },
              {
                icon: "📂",
                title: "Content Everywhere",
                desc: "Lectures on YouTube, PDFs on your phone, clips in WhatsApp groups. Nothing is organized.",
              },
              {
                icon: "😶",
                title: "No Clear Starting Point",
                desc: "You want to learn the Seerah properly, but you don't know where to begin or what order to follow.",
              },
              {
                icon: "⏳",
                title: "Starting Over, Again",
                desc: "You've started multiple Seerah series before. Life interrupts. You lose your place and restart from zero.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 rounded-xl border border-border bg-surface hover:border-gold/20 transition-colors"
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-text mb-1">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-gold/20 bg-gold-bg text-center">
            <p className="text-text-secondary text-lg leading-relaxed">
              The Seerah is the most important biography ever written —
              <span className="text-text font-medium"> the life of the final Prophet ﷺ.</span>
              <br />
              You deserve to know it completely, clearly, and in order.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          THE SOLUTION
      ============================================ */}
      <section className="section-pad border-t border-border bg-surface/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-4">
              Introducing
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
              The Complete Seerah System
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              One complete, structured system that takes you through the full life of the
              Prophet ﷺ — from pre-Islamic Arabia to his final days — with nothing missing
              and nothing out of order.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <LayoutDashboard className="w-6 h-6 text-gold" />,
                title: "Perfectly Organized",
                desc: "100+ parts arranged chronologically. You always know exactly where you are and where to go next.",
              },
              {
                icon: <Layers className="w-6 h-6 text-gold" />,
                title: "Multiple Formats",
                desc: "Video, audio, briefings, mindmaps, infographics, study guides — everything you need to understand and retain.",
              },
              {
                icon: <Zap className="w-6 h-6 text-gold" />,
                title: "Built for Clarity",
                desc: "No confusion. No hunting. No overwhelm. Just open your part and everything is right there.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-border bg-surface hover:border-gold/25 transition-all hover:gold-glow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-text text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* The journey visualization */}
          <div className="mt-12 p-6 md:p-8 rounded-2xl border border-border bg-surface">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-5">Your Journey Through the Seerah</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Pre-Islamic Arabia",
                "Birth & Early Life",
                "The Revelation Begins",
                "Makkah Persecution",
                "The Hijrah",
                "Madinah Period",
                "Major Campaigns",
                "Final Years & Legacy",
              ].map((era, i) => (
                <div key={era} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border text-xs text-text-secondary font-medium">
                    {era}
                  </span>
                  {i < 7 && (
                    <ChevronRight className="w-3 h-3 text-text-muted flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHAT YOU GET
      ============================================ */}
      <section id="what-you-get" className="section-pad border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-4">
              Everything Inside
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              One System. Every Format.
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Every part of the Seerah comes with a complete set of materials — designed
              to work together so you understand, retain, and connect the dots.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              {
                icon: <Video className="w-5 h-5" />,
                title: "Video Lessons",
                desc: "Clear, structured videos for every part. Watch at your own pace.",
              },
              {
                icon: <Headphones className="w-5 h-5" />,
                title: "Audio Versions",
                desc: "Every lesson available as audio. Perfect for commutes and reflection.",
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Briefing Documents",
                desc: "Formatted, readable summaries of everything covered in each part.",
              },
              {
                icon: <BookOpen className="w-5 h-5" />,
                title: "Study Guides",
                desc: "Guided questions and review points to deepen your understanding.",
              },
              {
                icon: <Map className="w-5 h-5" />,
                title: "Mind Maps",
                desc: "Visual maps of people, events, and connections — see the big picture.",
              },
              {
                icon: <Image className="w-5 h-5" />,
                title: "Infographics",
                desc: "Multiple visual styles — concise, detailed, and bento grid layouts.",
              },
              {
                icon: <Layers className="w-5 h-5" />,
                title: "Slide Decks",
                desc: "Full presentation slides — both presented and detailed watermarked versions.",
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Source Materials",
                desc: "Reports and statement of facts documents drawn from classical scholarship.",
              },
              {
                icon: <Star className="w-5 h-5" />,
                title: "100+ Parts",
                desc: "The complete Seerah from pre-Islamic Arabia to the Prophet's ﷺ final days.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 p-5 rounded-xl border border-border bg-surface hover:border-gold/20 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center flex-shrink-0 text-gold group-hover:bg-gold/20 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-text text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center p-6 rounded-2xl border border-gold/20 bg-gold-bg">
            <p className="text-gold font-semibold text-lg mb-1">All connected. All in one place.</p>
            <p className="text-text-secondary text-sm">
              Open any part, and everything you need is already there — organized, formatted, and ready.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT FEELS TO USE
      ============================================ */}
      <section className="section-pad border-t border-border bg-surface/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-4">
              The Experience
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              It feels like it was built for you.
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              No overwhelm. No confusion. Just open your next part and go.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Start from Part 1",
                  desc: "Every part builds on the previous one. The system is designed to be followed in order — or revisited anytime.",
                },
                {
                  step: "02",
                  title: "Watch, Listen, or Read",
                  desc: "Choose how you engage. Watch the video, listen on the go, read the briefing — or do all three.",
                },
                {
                  step: "03",
                  title: "Go Deeper When You Want",
                  desc: "Every part has extra resources — mindmaps, infographics, slides, and source materials — available when you want more.",
                },
                {
                  step: "04",
                  title: "Continue Where You Left Off",
                  desc: "Your progress is tracked. Come back anytime and pick up exactly where you stopped.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center">
                    <span className="text-gold text-xs font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">{item.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
              {/* Mock part page preview */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <p className="text-xs text-text-muted">Part 15</p>
                  <p className="font-semibold text-text">The First Revelation</p>
                </div>
                <Badge variant="gold" size="sm">Now Playing</Badge>
              </div>

              <div className="aspect-video rounded-xl bg-ink border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-2">
                    <Video className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-xs text-text-muted">Video Player</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {["Briefing", "Study Guide", "Mindmap", "Slides", "More"].map((tab) => (
                  <span
                    key={tab}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      tab === "Briefing"
                        ? "bg-gold/15 text-gold border border-gold/25"
                        : "bg-surface-raised text-text-muted border border-border hover:text-text-secondary"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              <div className="bg-surface-raised rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Briefing</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  The night that changed the world. Angel Jibreel appears to the Prophet ﷺ
                  in Cave Hira and delivers the first verses of the Quran...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
      ============================================ */}
      <TestimonialsSection />

      {/* ============================================
          PRICING
      ============================================ */}
      <section id="pricing" className="section-pad border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-4">
              Simple Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Choose Your Level of Access
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Both options give you lifetime access. No subscriptions. No recurring fees.
              Pay once and own it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Essentials */}
            <div className="relative p-6 md:p-7 rounded-2xl border border-border bg-surface flex flex-col">
              <div className="mb-5">
                <p className="text-text-secondary text-sm font-medium mb-1">Seerah Essentials</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-text">$49</span>
                  <span className="text-text-muted text-sm line-through">$99</span>
                </div>
                <p className="text-xs text-success font-medium mt-1">Save 50% · Early Access Price</p>
                <p className="text-text-muted text-sm mt-2">
                  A focused system for the core of the Seerah.
                </p>
              </div>

              <ul className="space-y-3 mb-7 flex-1">
                {[
                  "20–30 core parts",
                  "All asset types per part",
                  "The essential Seerah timeline",
                  "Video, audio, briefings",
                  "Mindmaps and infographics",
                  "Lifetime access",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-text-muted flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/get-started?plan=essentials"
                className={buttonClass("secondary", "lg", "w-full justify-center")}
              >
                Get Started
              </Link>
            </div>

            {/* Complete — HERO option */}
            <div className="relative p-6 md:p-7 rounded-2xl border-2 border-gold bg-surface flex flex-col gold-glow">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gold text-ink text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                  Recommended
                </span>
              </div>

              <div className="mb-5">
                <p className="text-gold text-sm font-medium mb-1">Complete Seerah System</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-text">$79</span>
                  <span className="text-text-muted text-sm line-through">$199</span>
                </div>
                <p className="text-xs text-success font-medium mt-1">Save 60% · Early Access Price</p>
                <p className="text-text-secondary text-sm mt-2">
                  The full, complete Seerah. Nothing missing.
                </p>
                <p className="text-xs text-gold-light mt-1">Less than $0.79 per part</p>
              </div>

              <ul className="space-y-3 mb-7 flex-1">
                {[
                  "All 100+ parts — the complete Seerah",
                  "Every asset type per part",
                  "Full chronological journey",
                  "Video, audio, briefings",
                  "Mindmaps, infographics, slides",
                  "Study guides and reports",
                  "Source materials and deep dives",
                  "Lifetime access — no limits",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/get-started?plan=complete"
                className={buttonClass("primary", "lg", "w-full justify-center")}
              >
                Get Complete Access
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-center text-xs text-text-muted mt-3">
                Most popular · Saves time · Nothing missing
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-text-muted">
              <Lock className="w-4 h-4" />
              <span>Secure payment · Instant access · Lifetime ownership</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          URGENCY
      ============================================ */}
      <section className="section-pad border-t border-border bg-surface/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gold text-sm font-medium uppercase tracking-widest mb-4">
            Early Access
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            This is the introductory price.
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8 max-w-xl mx-auto">
            The Complete Seerah System is currently available at its launch price.
            This will not remain at $79 as more content is added and the product grows.
            If you&apos;re ready, now is the right time.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                icon: "📖",
                title: "Limited Early Access",
                desc: "First access at the lowest price the system will ever be.",
              },
              {
                icon: "📈",
                title: "Price Will Increase",
                desc: "As content and value grows, so will the price.",
              },
              {
                icon: "✅",
                title: "Locked In Forever",
                desc: "Get in now and all future additions are yours — at no extra cost.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl border border-border bg-surface text-left"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <h3 className="font-semibold text-text text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
      ============================================ */}
      <section className="py-24 md:py-32 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 geo-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            The life of the Prophet ﷺ
            <br />
            <span className="text-gradient-gold">belongs in your heart.</span>
          </h2>
          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
            Get the Complete Seerah System and finally know the full story — clearly,
            completely, and in the right order.
          </p>

          <Link
            href="/get-started"
            className={buttonClass("primary", "xl", "shadow-2xl shadow-gold/25 mx-auto")}
          >
            Get Complete Access Now
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure Payment</span>
            <span>·</span>
            <span>Instant Access</span>
            <span>·</span>
            <span>No Subscription</span>
          </div>
          
          <div className="mt-4">
            <Link
              href="/preview/part-1"
              className="text-gold hover:text-gold-light text-sm font-medium underline-offset-4 hover:underline"
            >
              Or watch Part 1 free →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
