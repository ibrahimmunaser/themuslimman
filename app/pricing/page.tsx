import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { buttonClass } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Pricing — Seerah LMS",
};

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-ink text-text">
      <Navbar />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 geo-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Free during beta
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Start learning today. No credit card required. Always free.
          </p>
        </div>
      </section>

      <section className="py-12 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Single plan card */}
          <div className="rounded-2xl border border-gold/40 bg-gradient-to-b from-gold/8 to-surface relative overflow-hidden p-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
                Student Access
              </p>
              <p className="text-5xl font-bold text-text mb-2">Free</p>
              <p className="text-sm text-gold font-medium">No credit card · No hidden fees</p>
              <p className="text-sm text-text-secondary mt-4 leading-relaxed max-w-lg mx-auto">
                Complete access to the entire Seerah curriculum. Sign up once, learn forever.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "All 100+ Seerah parts",
                "Video lessons and audio versions",
                "Detailed briefings and study guides",
                "Mind maps and infographics",
                "Interactive quizzes",
                "Exams and assessments",
                "Progress tracking",
                "Slide decks and presentations",
                "Lifetime access",
                "All future content updates",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={buttonClass("primary", "lg", "w-full justify-center")}
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FAQ section */}
          <div className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold text-text text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text mb-2">Is it really free?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Yes! During beta, all features are completely free. When we exit beta, the platform will remain free for students with optional premium features.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text mb-2">What do I get access to?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Everything. All 100+ parts of the Seerah, all video lessons, all study materials, quizzes, exams, and tracking tools. Nothing is locked or paywalled.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text mb-2">Can I cancel anytime?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                There's nothing to cancel since it's free! You can deactivate your account anytime from your settings.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text mb-2">How long do I have access?</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Lifetime access. Once you create an account, you can learn at your own pace forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
