import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "College Student",
    text: "The budget food feature is a lifesaver! I eat healthy within ₹100/day now.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    role: "Software Engineer",
    text: "AI Habit Coach told me I was skipping breakfast too often. Totally changed my routine!",
    rating: 5,
    avatar: "RV",
  },
  {
    name: "Sneha Patel",
    role: "Fitness Enthusiast",
    text: "Found a gym buddy in my area through the app. We keep each other accountable!",
    rating: 5,
    avatar: "SP",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
            Loved by <span className="text-primary">thousands</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            See what our users are saying about NutriSmart AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-nutri-orange text-nutri-orange" />
                ))}
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-heading font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
