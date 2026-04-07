import { DashboardLayout } from "@/components/DashboardLayout";
import { Flame, Heart, UtensilsCrossed, Camera, Brain, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const emptyWeek = weekDays.map((day) => ({ day, calories: 0 }));

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserName(user.displayName?.split(" ")[0] || "there");
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    });
    return () => unsub();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Hey, {userName} 👋</h1>
          <p className="text-muted-foreground mt-1">
            {profile
              ? `Your daily target: ${profile.targetCalories} kcal · ${profile.targetProtein}g protein`
              : "Welcome! Start logging meals to see your AI insights."}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Calorie Target", value: profile?.targetCalories ?? "--", unit: "kcal", icon: Flame, color: "text-nutri-orange", bg: "bg-nutri-orange/10" },
            { label: "Protein Target", value: profile?.targetProtein ?? "--", unit: "g", icon: Target, color: "text-nutri-blue", bg: "bg-nutri-blue/10" },
            { label: "Carbs Target", value: profile?.targetCarbs ?? "--", unit: "g", icon: Heart, color: "text-primary", bg: "bg-primary/10" },
            { label: "Fat Target", value: profile?.targetFat ?? "--", unit: "g", icon: UtensilsCrossed, color: "text-nutri-purple", bg: "bg-nutri-purple/10" },
          ].map((s, i) => (
            <Card key={s.label} className="shadow-card animate-fade-in border-border/50" style={{ animationDelay: `${i * 0.08}s` }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-heading">
                  {s.value}
                  {s.value !== "--" && <span className="text-sm font-normal text-muted-foreground ml-1">{s.unit}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Daily AI target</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile summary + quick actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-card animate-fade-in border-border/50">
            <CardHeader>
              <CardTitle className="font-heading">Weekly Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={profile?.weeklyData || emptyWeek}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="calories" fill="hsl(152, 60%, 36%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {profile?.weeklyData ? "Here's how your week is looking!" : "Start scanning food to populate your weekly chart."}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="shadow-card animate-fade-in border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-3 h-11 rounded-xl" asChild>
                  <Link to="/scan"><Camera className="h-5 w-5" /> Scan Food</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl" asChild>
                  <Link to="/diet-plan"><Target className="h-5 w-5" /> View Diet Plan</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl" asChild>
                  <Link to="/fitness-buddy"><Users className="h-5 w-5" /> Invite Buddy</Link>
                </Button>
              </CardContent>
            </Card>

            {profile && (
              <Card className="shadow-card animate-fade-in border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-primary" /> Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>Age: {profile.age} · {profile.gender}</p>
                  <p>Weight: {profile.weight}kg · Height: {profile.height}cm</p>
                  <p>Goal: <span className="capitalize text-foreground font-medium">{profile.goal}</span></p>
                  <p>Diet: <span className="capitalize text-foreground font-medium">{profile.diet}</span></p>
                  <p>Activity: <span className="capitalize text-foreground font-medium">{profile.activity}</span></p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
