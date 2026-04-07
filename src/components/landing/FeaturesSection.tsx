import { Camera, Brain, BarChart3, Target, MapPin, ShieldCheck, Wallet, Users, Sparkles, Sliders } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Food Scanner",
    description: "Snap a photo of your meal and get instant calorie counts, macros, health score, and a healthier alternative — powered by Gemini Vision AI.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Brain,
    title: "AI Habit Coach",
    description: "Your personal AI coach analyzes your lifestyle and delivers wins, warnings, actionable tips, and a personalized 7-day challenge.",
    color: "text-nutri-purple",
    bg: "bg-nutri-purple/10",
    badge: "AI",
  },
  {
    icon: Wallet,
    title: "Budget Food Intelligence",
    description: "Enter your daily budget in ₹ and get AI-recommended affordable foods that still hit your protein and calorie targets.",
    color: "text-nutri-orange",
    bg: "bg-nutri-orange/10",
    badge: "UNIQUE",
  },
  {
    icon: Target,
    title: "AI Diet Plan",
    description: "Generates a full 5-meal day plan — breakfast to dinner — personalized to your calorie target, macros, diet type, and goal.",
    color: "text-nutri-blue",
    bg: "bg-nutri-blue/10",
    badge: "AI",
  },
  {
    icon: Sliders,
    title: "Smart Goal Tracker",
    description: "Auto-seeded daily goals for calories, water, steps, and workouts based on your profile. Track progress with +/- buttons, saved to cloud.",
    color: "text-nutri-lime",
    bg: "bg-nutri-lime/10",
    badge: "NEW",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Weekly calorie bar charts, protein trend lines, today's food log, and AI-generated habit insights all in one place.",
    color: "text-nutri-green",
    bg: "bg-nutri-green/10",
  },
  {
    icon: MapPin,
    title: "Nearby Healthy Food",
    description: "Real Google Maps results — healthy restaurants near your GPS location with photos, ratings, open/closed status, and distance.",
    color: "text-nutri-blue",
    bg: "bg-nutri-blue/10",
    badge: "LIVE",
  },
  {
    icon: Users,
    title: "Fitness Buddy Match",
    description: "Scored matching with other users by goal, gender, occupation, and activity level. Send personalized invite emails directly.",
    color: "text-nutri-purple",
    bg: "bg-nutri-purple/10",
    badge: "SOCIAL",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description: "Firebase Auth with persistent sessions, Firestore security rules, and environment-variable-protected API keys.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Everything you need for a{" "}
            <span className="text-primary">healthier life</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Powered by Google Gemini AI to give you the smartest, most personalized nutrition experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in hover:-translate-y-1 border border-transparent hover:border-primary/20"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${f.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                {f.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {f.badge}
                  </span>
                )}
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
