import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg">NutriSmart AI</span>
        </div>
        <p className="text-muted-foreground text-sm">
          © 2026 NutriSmart AI. Eat smart, live better.
        </p>
      </div>
    </footer>
  );
}
