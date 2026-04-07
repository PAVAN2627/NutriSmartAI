import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const weeklyCalories = [
  { day: "Mon", calories: 1850, target: 2200 },
  { day: "Tue", calories: 2100, target: 2200 },
  { day: "Wed", calories: 1700, target: 2200 },
  { day: "Thu", calories: 1950, target: 2200 },
  { day: "Fri", calories: 2200, target: 2200 },
  { day: "Sat", calories: 2400, target: 2200 },
  { day: "Sun", calories: 1600, target: 2200 },
];

const proteinTrend = [
  { day: "Mon", protein: 65 },
  { day: "Tue", protein: 72 },
  { day: "Wed", protein: 48 },
  { day: "Thu", protein: 80 },
  { day: "Fri", protein: 55 },
  { day: "Sat", protein: 90 },
  { day: "Sun", protein: 42 },
];

const foodLog = [
  { time: "8:30 AM", food: "Oats + Banana", cal: 310, emoji: "🥣" },
  { time: "1:00 PM", food: "Dal Rice + Salad", cal: 520, emoji: "🍛" },
  { time: "4:30 PM", food: "Green Tea + Biscuits", cal: 120, emoji: "🍵" },
  { time: "8:00 PM", food: "Roti + Paneer Sabzi", cal: 450, emoji: "🫓" },
];

const aiInsights = [
  { icon: AlertTriangle, text: "You consumed junk food 3 times this week", type: "warning" as const },
  { icon: AlertTriangle, text: "Low protein intake detected — average 64g/day", type: "warning" as const },
  { icon: CheckCircle, text: "Great job! You stayed under calorie target 5/7 days", type: "success" as const },
  { icon: TrendingUp, text: "Your fiber intake improved by 18% this week", type: "success" as const },
];

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">My Reports</h1>
          <p className="text-muted-foreground mt-1">Daily logs, weekly analytics, and AI insights</p>
        </div>

        {/* AI Insights */}
        <Card className="shadow-card animate-fade-in border-primary/20">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Habit Coach Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl p-3 ${
                  insight.type === "warning" ? "bg-nutri-orange/10" : "bg-primary/10"
                }`}
              >
                <insight.icon
                  className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    insight.type === "warning" ? "text-nutri-orange" : "text-primary"
                  }`}
                />
                <p className="text-sm">{insight.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="font-heading">Weekly Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyCalories}>
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
                  <Bar dataKey="target" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="font-heading">Protein Trend (g)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={proteinTrend}>
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
                  <Line type="monotone" dataKey="protein" stroke="hsl(210, 70%, 55%)" strokeWidth={2} dot={{ fill: "hsl(210, 70%, 55%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Today's food log */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="font-heading">Today's Food Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foodLog.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="font-heading font-semibold text-sm">{item.food}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <span className="font-heading font-bold text-primary">{item.cal} kcal</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
