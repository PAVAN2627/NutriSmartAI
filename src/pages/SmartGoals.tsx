import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Sliders, Plus, Trash2, CheckCircle2, Target, Droplets, Footprints, Dumbbell, Flame, Minus, Circle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type GoalCategory = "weight" | "water" | "steps" | "workout" | "calories";

type UserGoal = {
  id: string;
  category: GoalCategory;
  label: string;
  target: number;
  current: number;
  unit: string;
};

const CATEGORY_META: Record<GoalCategory, { icon: any; color: string; bg: string; defaultTarget: number; unit: string; label: string }> = {
  weight: { icon: Target, color: "text-nutri-orange", bg: "bg-nutri-orange/10", defaultTarget: 70, unit: "kg", label: "Target Weight" },
  water: { icon: Droplets, color: "text-nutri-blue", bg: "bg-nutri-blue/10", defaultTarget: 8, unit: "glasses", label: "Daily Water" },
  steps: { icon: Footprints, color: "text-primary", bg: "bg-primary/10", defaultTarget: 10000, unit: "steps", label: "Daily Steps" },
  workout: { icon: Dumbbell, color: "text-nutri-purple", bg: "bg-nutri-purple/10", defaultTarget: 5, unit: "days/week", label: "Workout Days" },
  calories: { icon: Flame, color: "text-nutri-orange", bg: "bg-nutri-orange/10", defaultTarget: 2000, unit: "kcal", label: "Calorie Target" },
};

const DEFAULT_GOALS: UserGoal[] = [
  { id: "water", category: "water", label: "Daily Water Intake", target: 8, current: 0, unit: "glasses" },
  { id: "steps", category: "steps", label: "Daily Steps", target: 10000, current: 0, unit: "steps" },
  { id: "workout", category: "workout", label: "Workout Days This Week", target: 5, current: 0, unit: "days" },
];

export default function SmartGoals() {
  const [goals, setGoals] = useState<UserGoal[]>(DEFAULT_GOALS);
  const [profile, setProfile] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<GoalCategory>("water");
  const [newTarget, setNewTarget] = useState("");
  const [habitChallenge, setHabitChallenge] = useState<{ challengeTitle: string; days: { day: string; task: string; done: boolean }[] } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        if (data.goals && data.goals.length > 0) {
          setGoals(data.goals);
        } else {
          const seeded: UserGoal[] = [
            { id: "calories", category: "calories", label: "Daily Calorie Target", target: data.targetCalories || 2000, current: 0, unit: "kcal" },
            { id: "water", category: "water", label: "Daily Water Intake", target: 8, current: 0, unit: "glasses" },
            { id: "steps", category: "steps", label: "Daily Steps", target: 10000, current: 0, unit: "steps" },
            { id: "workout", category: "workout", label: "Workout Days This Week", target: data.activity === "gym" || data.activity === "athlete" ? 5 : 3, current: 0, unit: "days" },
          ];
          setGoals(seeded);
          await setDoc(doc(db, "users", user.uid), { goals: seeded }, { merge: true });
        }
        // Load habit challenge if exists
        if (data.habitCoach?.days) {
          setHabitChallenge({ challengeTitle: data.habitCoach.challengeTitle, days: data.habitCoach.days });
        }
      }
    });
    return () => unsub();
  }, []);

  const save = async (updated: UserGoal[]) => {
    setGoals(updated);
    if (uid) await setDoc(doc(db, "users", uid), { goals: updated }, { merge: true });
  };

  const updateCurrent = (id: string, value: string) => {
    const num = Math.max(0, Number(value));
    save(goals.map((g) => (g.id === id ? { ...g, current: num } : g)));
  };

  const increment = (id: string, step: number) => {
    save(goals.map((g) => g.id === id ? { ...g, current: Math.max(0, g.current + step) } : g));
  };

  const deleteGoal = (id: string) => {
    save(goals.filter((g) => g.id !== id));
    toast.success("Goal removed");
  };

  const addGoal = () => {
    if (!newTarget || +newTarget <= 0) return toast.error("Enter a valid target");
    const meta = CATEGORY_META[newCategory];
    const id = `${newCategory}-${Date.now()}`;
    const goal: UserGoal = {
      id,
      category: newCategory,
      label: meta.label,
      target: +newTarget,
      current: 0,
      unit: meta.unit,
    };
    save([...goals, goal]);
    setAdding(false);
    setNewTarget("");
    toast.success("Goal added!");
  };

  const totalCompleted = goals.filter((g) => g.current >= g.target).length;

  const stepFor = (goal: UserGoal) => {
    if (goal.category === "steps") return 500;
    if (goal.category === "calories") return 50;
    return 1;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Smart Goals</h1>
            <p className="text-muted-foreground mt-1">Set targets, log progress, stay on track</p>
          </div>
          <Button onClick={() => setAdding((p) => !p)} variant={adding ? "outline" : "default"} className="gap-2">
            <Plus className="h-4 w-4" /> {adding ? "Cancel" : "Add Goal"}
          </Button>
        </div>

        {/* Summary bar */}
        <Card className="shadow-card border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="font-heading font-semibold text-sm">Today's Progress</span>
            </div>
            <span className="font-heading font-bold text-primary">{totalCompleted} / {goals.length} goals hit</span>
          </CardContent>
        </Card>

        {/* 7-Day Habit Challenge from AI Coach */}
        {habitChallenge && (
          <Card className="shadow-card border-nutri-blue/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base text-nutri-blue flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {habitChallenge.challengeTitle}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {habitChallenge.days.filter(d => d.done).length}/7 done
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div
                  className="bg-nutri-blue h-1.5 rounded-full transition-all"
                  style={{ width: `${(habitChallenge.days.filter(d => d.done).length / 7) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {habitChallenge.days.map((d, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-xl p-2.5 ${d.done ? "bg-primary/10" : "bg-muted/40"}`}>
                  {d.done
                    ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    : <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{d.day}</p>
                    <p className={`text-xs mt-0.5 ${d.done ? "line-through text-muted-foreground" : ""}`}>{d.task}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1">
                Mark tasks in{" "}
                <Link to="/habit-coach" className="text-primary underline">AI Habit Coach</Link>
              </p>
            </CardContent>
          </Card>
        )}

        {!habitChallenge && (
          <Card className="shadow-card border-dashed border-nutri-blue/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-nutri-blue shrink-0" />
              <p className="text-sm text-muted-foreground">
                No 7-day challenge yet.{" "}
                <Link to="/habit-coach" className="text-primary font-medium underline">Go to AI Habit Coach</Link>
                {" "}to generate one.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add goal form */}
        {adding && (
          <Card className="shadow-card border-primary/30 animate-fade-in">
            <CardHeader>
              <CardTitle className="font-heading text-base flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" /> New Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CATEGORY_META) as GoalCategory[]).map((cat) => {
                  const m = CATEGORY_META[cat];
                  return (
                    <div
                      key={cat}
                      onClick={() => { setNewCategory(cat); setNewTarget(String(m.defaultTarget)); }}
                      className={`p-3 rounded-xl border cursor-pointer text-center transition-colors ${newCategory === cat ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
                    >
                      <m.icon className={`h-4 w-4 mx-auto mb-1 ${newCategory === cat ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-xs font-medium">{m.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Target ({CATEGORY_META[newCategory].unit})</label>
                  <Input type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder={String(CATEGORY_META[newCategory].defaultTarget)} />
                </div>
                <Button onClick={addGoal} className="self-end h-10">Add</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goal cards */}
        <div className="space-y-4">
          {goals.map((goal) => {
            const meta = CATEGORY_META[goal.category];
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const done = goal.current >= goal.target;
            return (
              <Card key={goal.id} className={`shadow-card transition-all ${done ? "border-primary/40" : "border-border"}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center`}>
                        <meta.icon className={`h-4 w-4 ${meta.color}`} />
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-sm">{goal.label}</p>
                        <p className="text-xs text-muted-foreground">Target: {goal.target} {goal.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {done && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Progress value={pct} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${done ? "text-primary" : "text-muted-foreground"}`}>
                      {done ? "Goal reached! 🎉" : `${pct}% · ${goal.current} / ${goal.target} ${goal.unit}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => increment(goal.id, -stepFor(goal))}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-12 text-center text-sm font-semibold">{goal.current}</span>
                      <button
                        onClick={() => increment(goal.id, stepFor(goal))}
                        className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors text-primary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
