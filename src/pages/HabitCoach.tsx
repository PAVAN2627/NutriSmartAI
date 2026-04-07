import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, CheckCircle, AlertTriangle, TrendingUp, CheckCircle2, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getGeminiTextModel } from "@/lib/gemini";
import { toast } from "sonner";

type Insight = { type: "tip" | "warning" | "win"; text: string };
type DayTask = { day: string; task: string; done: boolean };
type CoachResult = {
  summary: string;
  insights: Insight[];
  challengeTitle: string;
  days: DayTask[];
};

export default function HabitCoach() {
  const [profile, setProfile] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        // Restore saved coaching if exists
        if (data.habitCoach) setResult(data.habitCoach);
      }
    });
    return () => unsub();
  }, []);

  const analyze = async () => {
    if (!profile) return toast.error("Profile not loaded");
    setLoading(true);
    try {
      const model = getGeminiTextModel();
      const prompt = [
        "You are an AI habit coach. Generate personalized coaching for this user:",
        `Age: ${profile.age}, Gender: ${profile.gender}, Occupation: ${profile.occupation}`,
        `Goal: ${profile.goal} weight, Diet: ${profile.diet}, Activity: ${profile.activity}`,
        `Daily targets: ${profile.targetCalories} kcal, ${profile.targetProtein}g protein`,
        "",
        "Return ONLY a valid JSON object with exactly this structure:",
        '{ "summary": "2 sentence summary", "insights": [{ "type": "win", "text": "..." }, { "type": "warning", "text": "..." }, { "type": "tip", "text": "..." }, { "type": "tip", "text": "..." }, { "type": "warning", "text": "..." }], "challengeTitle": "Challenge name", "days": [{ "day": "Day 1", "task": "specific task" }, { "day": "Day 2", "task": "specific task" }, { "day": "Day 3", "task": "specific task" }, { "day": "Day 4", "task": "specific task" }, { "day": "Day 5", "task": "specific task" }, { "day": "Day 6", "task": "specific task" }, { "day": "Day 7", "task": "specific task" }] }',
        "Each day task must be a single clear actionable sentence. No markdown, no asterisks.",
      ].join("\n");

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Ensure days have done:false
      const coachResult: CoachResult = {
        ...parsed,
        days: (parsed.days || []).map((d: any) => ({ ...d, done: false })),
      };

      setResult(coachResult);
      // Persist to Firestore
      if (uid) await setDoc(doc(db, "users", uid), { habitCoach: coachResult }, { merge: true });
      toast.success("AI coaching insights ready!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate insights. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = async (i: number) => {
    if (!result || !uid) return;
    const updated: CoachResult = {
      ...result,
      days: result.days.map((d, idx) => idx === i ? { ...d, done: !d.done } : d),
    };
    setResult(updated);
    await setDoc(doc(db, "users", uid), { habitCoach: updated }, { merge: true });
  };

  const iconFor = (type: string) => {
    if (type === "win") return { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10" };
    if (type === "warning") return { icon: AlertTriangle, color: "text-nutri-orange", bg: "bg-nutri-orange/10" };
    return { icon: TrendingUp, color: "text-nutri-blue", bg: "bg-nutri-blue/10" };
  };

  const completedDays = result?.days.filter((d) => d.done).length ?? 0;

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
                Click "Analyze Me" to get AI-powered habit insights and a 7-day challenge saved to your profile.
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
            {/* Summary */}
            <Card className="shadow-card border-primary/20 bg-primary/5">
              <CardContent className="p-5 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Insights */}
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

            {/* 7-Day Challenge tracker */}
            <Card className="shadow-card border-nutri-blue/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-base text-nutri-blue">
                    7-Day Challenge: {result.challengeTitle}
                  </CardTitle>
                  <span className="text-sm font-semibold text-primary">{completedDays}/7 done</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className="bg-nutri-blue h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(completedDays / 7) * 100}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.days.map((d, i) => (
                  <div
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors ${
                      d.done ? "bg-primary/10" : "bg-muted/40 hover:bg-muted"
                    }`}
                  >
                    {d.done
                      ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      : <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{d.day}</p>
                      <p className={`text-sm mt-0.5 ${d.done ? "line-through text-muted-foreground" : ""}`}>
                        {d.task}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
