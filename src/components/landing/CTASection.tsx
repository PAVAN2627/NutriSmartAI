import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>Start your journey today</span>
          </div>

          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Ready to eat{" "}
            <span style={{ color: "#10b981" }} className="italic">smarter</span>?
          </h2>

          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Join thousands of users who are transforming their health with AI-powered nutrition tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" asChild>
              <Link to="/login">
                Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
