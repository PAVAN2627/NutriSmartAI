import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getGeminiTextModel } from "@/lib/gemini";
import { toast } from "sonner";

type Insight = { type: "tip" | "warning" | "win"; text: string };
type CoachResult = { summary: string; insights: Insight[]; weeklyChallenge: string };

export default function HabitCoach() {
  const [profile, setProfile] = useState<any>(null);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    });
    return () => unsub();
  }, []);

  const analyze = async () => {
    if (!profile) return toast.error("Profile not loaded");
    setLoading(true);
    try {
      const model = getGeminiTextModel();
      const schema = '{"summary":"string","insights":[{"type":"win|warning|tip","text":"string"}],"weeklyChallenge":"string"}';
      const prompt = [
        "You are an AI habit coach for a nutrition app. Generate personalized habit coaching for:",
        `Age: ${profile.age}, Gender: ${profile.gender}`,
        `Goal: ${profile.goal} weight, Diet: ${profile.diet}, Activity: ${profile.activity}`,
        `Occupation: ${profile.occupation}`,
        `Daily targets: ${profile.targetCalories} kcal, ${profile.targetProtein}g protein`,
        "Provide 5 insights (mix of win, warning, tip types) and a 7-day challenge.",
        "Return ONLY valid JSON matching this schema: " + schema,
      ].join("\n");

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      setResult(JSON.parse(clean));
      toast.success("AI coaching insights ready!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate insights. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const iconFor = (type: string) => {
    if (type === "win") return { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" };
    if (type === "warning") return { icon: AlertTriangle, color: "text-nutri-orange", bg: "bg-nutri-orange/10" };
    return { icon: TrendingUp, color: "text-nutri-blue", bg: "bg-nutri-blue/10" };
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">AI Habit Coach</h1>
            <p className="text-muted-foreground mt-1">Personalized coaching based on your profile</p>
          </div>
          <Button onClick={analyze} disabled={loading || !profile} className="gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {result ? "Refresh" : "Analyze Me"}
          </Button>
        </div>

        {!result && !loading && (
          <Card className="shadow-card border-dashed border-primary/30">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Ready to Coach You</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Click "Analyze Me" to get AI-powered habit insights tailored to your goal and lifestyle.
              </p>
              <Button onClick={analyze} disabled={!profile} className="gap-2">
                <Sparkles className="h-4 w-4" /> Get My Insights
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">AI is analyzing your habits...</p>
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <div className="space-y-4 animate-fade-in">
            <Card className="shadow-card border-primary/20 bg-primary/5">
              <CardContent className="p-5 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-heading text-base">Your Habit Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.insights.map((ins, i) => {
                  const { icon: Icon, color, bg } = iconFor(ins.type);
                  return (
                    <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${bg}`}>
                      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${color}`} />
                      <p className="text-sm">{ins.text}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-card border-nutri-blue/20 bg-nutri-blue/5">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-nutri-blue uppercase tracking-wide mb-2">7-Day Challenge</p>
                <p className="text-sm font-medium">{result.weeklyChallenge}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
