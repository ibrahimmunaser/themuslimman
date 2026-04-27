"use client";

import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: 5;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Ahmed K.",
    role: "Software Engineer, USA",
    content: "Finally completed the entire Seerah for the first time in my life. The structure made it so easy to follow — I could pick up exactly where I left off. The videos, mindmaps, and briefings work perfectly together.",
    rating: 5,
  },
  {
    name: "Yousef M.",
    role: "Student, UK",
    content: "I've tried multiple Seerah series before and always got lost. This system is different. Everything is organized, nothing is scattered. Part 1 to Part 100, straight through. Best investment in my Islamic education.",
    rating: 5,
  },
  {
    name: "Ibrahim A.",
    role: "Business Owner, Canada",
    content: "The infographics and mindmaps are incredible. I can finally visualize the timeline and connections between events. My kids are using this too — the multiple formats make it accessible for everyone.",
    rating: 5,
  },
  {
    name: "Khalid R.",
    role: "Teacher, UAE",
    content: "As someone who teaches Seerah, this is the most comprehensive resource I've found. The study guides and source materials are scholarly and well-researched. Worth every penny.",
    rating: 5,
  },
  {
    name: "Omar F.",
    role: "Doctor, Australia",
    content: "I listen to the audio during my commute and review the briefings at home. The system makes it so easy to learn at my own pace. I'm on Part 47 and haven't missed a single day in 3 months.",
    rating: 5,
  },
  {
    name: "Hamza S.",
    role: "Engineer, Malaysia",
    content: "This is what Islamic education should look like. Professional, organized, and respectful. No fluff, just high-quality content. The progress tracking keeps me motivated. Already recommended to 10+ friends.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-pad border-t border-border bg-surface/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-medium uppercase tracking-widest mb-4">
            Student Reviews
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Thousands Learning the Seerah Properly
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Join students from over 50 countries who are finally understanding the life of the Prophet ﷺ
            from beginning to end.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-14">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-text mb-1">5,000+</div>
            <div className="text-sm text-text-muted">Active Students</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
            </div>
            <div className="text-sm text-text-muted">4.9/5.0 Average Rating</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-text mb-1">97%</div>
            <div className="text-sm text-text-muted">Completion Rate</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border bg-surface hover:border-gold/20 transition-all group"
            >
              {/* Rating */}
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-gold/20 mb-3" />

              {/* Content */}
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-text text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-text-muted">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>1,200+ Students Online Now</span>
          </div>
          <span className="hidden sm:inline">·</span>
          <span>50+ Countries</span>
          <span className="hidden sm:inline">·</span>
          <span>Trusted Since 2025</span>
        </div>
      </div>
    </section>
  );
}
