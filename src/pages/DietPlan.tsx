import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Flame, RefreshCw, Sparkles, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getGeminiTextModel } from "@/lib/gemini";
import { toast } from "sonner";

type Meal = {
  meal: string;
  time: string;
  items: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  emoji: string;
};

type Plan = {
  meals: Meal[];
  totalCalories: number;
  tip: string;
};

export default function DietPlan() {
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    });
    return () => unsub();
  }, []);

  const generatePlan = async () => {
    if (!profile) return toast.error("Profile not loaded yet");
    setLoading(true);
    try {
      const model = getGeminiTextModel();
      const schema = '{"meals":[{"meal":"string","time":"string","items":"string","calories":0,"protein":"string","carbs":"string","fat":"string","emoji":"string"}],"totalCalories":0,"tip":"string"}';
      const prompt = [
        "You are an expert nutritionist. Create a full-day personalized meal plan for:",
        `Age: ${profile.age}, Gender: ${profile.gender}`,
        `Weight: ${profile.weight}kg, Height: ${profile.height}cm`,
        `Goal: ${profile.goal} weight, Diet: ${profile.diet}, Activity: ${profile.activity}`,
        `Daily calorie target: ${profile.targetCalories} kcal`,
        `Protein: ${profile.targetProtein}g, Carbs: ${profile.targetCarbs}g, Fat: ${profile.targetFat}g`,
        "Include Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner.",
        "Return ONLY valid JSON matching this schema: " + schema,
      ].join("\n");

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      setPlan(JSON.parse(clean));
      toast.success("AI meal plan generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Diet Plan</h1>
            <p className="text-muted-foreground mt-1">
              {profile
                ? `Personalized for your ${profile.goal} goal · ${profile.targetCalories} kcal/day`
                : "Loading your profile..."}
            </p>
          </div>
          <Button onClick={generatePlan} disabled={loading || !profile} className="gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {plan ? "Regenerate" : "Generate AI Plan"}
          </Button>
        </div>

        {/* Macro targets */}
        {profile && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Calories", value: `${profile.targetCalories}`, unit: "kcal", color: "bg-nutri-orange/10 text-nutri-orange" },
              { label: "Protein", value: `${profile.targetProtein}`, unit: "g", color: "bg-nutri-blue/10 text-nutri-blue" },
              { label: "Carbs", value: `${profile.targetCarbs}`, unit: "g", color: "bg-primary/10 text-primary" },
              { label: "Fat", value: `${profile.targetFat}`, unit: "g", color: "bg-nutri-purple/10 text-nutri-purple" },
            ].map((m) => (
              <div key={m.label} className={`rounded-xl p-3 text-center ${m.color}`}>
                <p className="text-lg font-bold font-heading">{m.value}<span className="text-xs ml-0.5">{m.unit}</span></p>
                <p className="text-xs opacity-80">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!plan && !loading && (
          <Card className="shadow-card border-dashed border-primary/30">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">No Plan Generated Yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Click "Generate AI Plan" to get a personalized meal plan based on your profile and nutrition targets.
              </p>
              <Button onClick={generatePlan} disabled={!profile} className="gap-2">
                <Sparkles className="h-4 w-4" /> Generate My AI Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">AI is crafting your personalized meal plan...</p>
            </CardContent>
          </Card>
        )}

        {/* Meal cards */}
        {plan && !loading && (
          <div className="space-y-4">
            {plan.meals.map((meal, i) => (
              <Card key={i} className="shadow-card animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{meal.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-heading font-semibold">{meal.meal}</p>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />{meal.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{meal.items}</p>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="text-nutri-blue">P: {meal.protein}</span>
                          <span className="text-primary">C: {meal.carbs}</span>
                          <span className="text-nutri-purple">F: {meal.fat}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-heading font-bold text-primary whitespace-nowrap">
                      {meal.calories} kcal
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Total + tip */}
            <Card className="shadow-card border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-nutri-orange" />
                  <span className="font-heading font-semibold">Total Daily Calories</span>
                </div>
                <span className="font-heading font-bold text-lg text-primary">{plan.totalCalories} kcal</span>
              </CardContent>
            </Card>

            <Card className="shadow-card border-primary/20">
              <CardContent className="p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-semibold text-sm text-primary">AI Nutrition Tip</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{plan.tip}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
