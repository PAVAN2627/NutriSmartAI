import { Brain, ArrowRight, Sparkles, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const floatingCards = [
  { icon: "🥗", label: "Salad Bowl", cal: "320 kcal", delay: "0s" },
  { icon: "🍌", label: "Banana", cal: "105 kcal", delay: "1s" },
  { icon: "🥚", label: "Boiled Egg", cal: "78 kcal", delay: "2s" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nutri-blue/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Nutrition Tracking</span>
          </div>

          {/* Main heading */}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Eat Smart with{" "}
            <span className="text-primary drop-shadow-sm">
              NutriSmart AI
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Scan your food, get instant calorie counts, personalized diet plans,
            AI habit coaching, and budget-friendly meal suggestions — all in one beautiful app.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" asChild>
              <Link to="/login">
                Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <a href="#features">Explore Features</a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>100% Private</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" />
              <span>Gemini AI Powered</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>10K+ Users</span>
            </div>
          </div>
        </div>

        {/* Floating food cards */}
        <div className="relative mt-16 max-w-3xl mx-auto hidden md:block">
          <div className="flex justify-center gap-6">
            {floatingCards.map((card, i) => (
              <div
                key={card.label}
                className="bg-card rounded-2xl p-4 shadow-elevated animate-float border border-border/50"
                style={{ animationDelay: card.delay }}
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <p className="font-heading font-semibold text-sm">{card.label}</p>
                <p className="text-xs text-primary font-medium">{card.cal}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
