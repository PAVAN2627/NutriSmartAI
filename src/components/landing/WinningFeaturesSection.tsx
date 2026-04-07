import { Brain, Wallet, Target, Users, ArrowRight, CheckCircle2, Mail, Sparkles, Sliders, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const coreFeatures = [
  {
    icon: Brain,
    title: "AI Habit Coach",
    description: "Not just a tracker — a smart assistant that analyzes your profile and delivers personalized behavioral coaching.",
    examples: [
      "Identifies risks based on your diet & activity",
      "Celebrates your wins and positive habits",
      "Gives a new 7-day challenge every session",
    ],
    color: "text-nutri-purple",
    bg: "bg-nutri-purple/10",
  },
  {
    icon: Wallet,
    title: "Budget Food Intelligence",
    description: "Smart, affordable meal suggestions tailored to your exact budget without compromising your nutrition targets.",
    examples: [
      "Enter any daily budget in ₹",
      "AI picks foods matching your protein & calorie goals",
      "Includes money-saving nutrition tips",
    ],
    color: "text-nutri-orange",
    bg: "bg-nutri-orange/10",
  },
  {
    icon: Target,
    title: "AI Diet Plan",
    description: "A full personalized meal plan generated fresh every time — 5 meals with macros, timings, and a nutrition tip.",
    examples: [
      "Uses your BMR/TDEE targets from onboarding",
      "Adapts to veg, non-veg, or vegan diet",
      "Regenerate anytime for variety",
    ],
    color: "text-nutri-blue",
    bg: "bg-nutri-blue/10",
  },
  {
    icon: Sliders,
    title: "Smart Goal Tracker",
    description: "Goals auto-seeded from your AI profile on first login. Track daily progress with simple +/- controls.",
    examples: [
      "Calorie goal set from your AI-calculated target",
      "Water, steps, and workout goals included",
      "Progress saved to Firestore in real time",
    ],
    color: "text-nutri-lime",
    bg: "bg-nutri-lime/10",
  },
  {
    icon: MapPin,
    title: "Live Nearby Food Map",
    description: "Real Google Places API results — not fake data. Healthy restaurants near your actual GPS location.",
    examples: [
      "Auto-detects your location on page load",
      "Shows photos, ratings, open/closed status",
      "Filter by Open Now, Top Rated, or Nearest",
    ],
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Sparkles,
    title: "Gemini Vision AI",
    description: "Powered by Google's Gemini 2.5 Flash model for lightning-fast, accurate food recognition from photos.",
    examples: [
      "Instant calories, protein, carbs, fat",
      "Health score out of 100",
      "Suggests a healthier alternative",
    ],
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

export function WinningFeaturesSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4 animate-fade-in">
            Core Capabilities
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            The NutriSmart{" "}
            <span className="text-primary">Difference</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            These aren't just premium features — they're the foundational tools our users rely on to achieve their health goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {coreFeatures.map((f, i) => (
            <div
              key={f.title}
              className={`group bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in border border-border/50 hover:border-border`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`h-7 w-7 ${f.color}`} />
                </div>
                <h3 className="font-heading text-xl font-bold">{f.title}</h3>
              </div>

              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{f.description}</p>

              <div className="space-y-3">
                {f.examples.map((ex, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-3 text-sm"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90 font-medium leading-snug">{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <Button variant="hero" size="lg" asChild>
            <Link to="/login">
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
