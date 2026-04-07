import { Camera, Brain, BarChart3, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Scan Your Meal",
    description: "Take a photo of your food or search manually. Our AI identifies it instantly.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    step: "02",
    icon: Brain,
    title: "Get AI Analysis",
    description: "Gemini AI calculates calories, macros, health score, and suggests healthier alternatives.",
    color: "text-nutri-blue",
    bg: "bg-nutri-blue/10",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Track & Improve",
    description: "View your progress with beautiful charts. Get weekly AI coaching and habit insights.",
    color: "text-nutri-orange",
    bg: "bg-nutri-orange/10",
  },
  {
    step: "04",
    icon: Sparkles,
    title: "Achieve Your Goals",
    description: "Follow personalized diet plans, find budget meals, and connect with fitness buddies.",
    color: "text-nutri-purple",
    bg: "bg-nutri-purple/10",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
            How it <span className="text-primary">works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Four simple steps to transform your nutrition journey
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="flex gap-4 animate-fade-in"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-7 w-7 ${s.color}`} />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Step {s.step}</span>
                <h3 className="font-heading text-xl font-bold mt-1 mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
