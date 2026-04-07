import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl">NutriSmart AI</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="hero" size="sm" asChild>
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
