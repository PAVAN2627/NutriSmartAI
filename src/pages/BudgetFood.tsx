import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, RefreshCw, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getGeminiTextModel } from "@/lib/gemini";
import { toast } from "sonner";

type FoodItem = { name: string; price: string; calories: number; protein: string; why: string; emoji: string };
type BudgetResult = { items: FoodItem[]; totalEstimate: string; tip: string };

export default function BudgetFood() {
  const [profile, setProfile] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [budget, setBudget] = useState("200");
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        // Restore saved result if exists
        if (data.budgetFood) setResult(data.budgetFood);
      }
    });
    return () => unsub();
  }, []);

  const generate = async () => {
    if (!profile) return toast.error("Profile not loaded");
    if (!budget || +budget < 10) return toast.error("Enter a valid daily budget");
    setLoading(true);
    try {
      const model = getGeminiTextModel();
      const prompt = [
        "You are a budget nutrition expert for Indian users.",
        "Suggest 5 affordable daily food items for this person:",
        `Diet preference: ${profile.diet}`,
        `Goal: ${profile.goal} weight`,
        `Daily calorie target: ${profile.targetCalories} kcal`,
        `Daily protein target: ${profile.targetProtein}g`,
        `Daily budget: Rs.${budget}`,
        "",
        "Return ONLY a valid JSON object. No markdown. No explanation.",
        "Format: an object with keys: items (array of 5 objects), totalEstimate (string), tip (string).",
        "Each item has: name, price (e.g. Rs.30), calories (number), protein (e.g. 8g), why (one sentence), emoji.",
      ].join("\n");

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      // Save to Firestore
      if (uid) await setDoc(doc(db, "users", uid), { budgetFood: parsed }, { merge: true });
      toast.success("Budget meal suggestions ready!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate suggestions. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Budget Food</h1>
          <p className="text-muted-foreground mt-1">AI-powered affordable meals that hit your nutrition targets</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-5 flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Daily Food Budget (Rs.)</label>
              <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="200" />
            </div>
            <Button onClick={generate} disabled={loading || !profile} className="gap-2 h-10">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              {result ? "Regenerate" : "Find Meals"}
            </Button>
          </CardContent>
        </Card>

        {!result && !loading && (
          <Card className="shadow-card border-dashed border-primary/30">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Eat Well, Spend Less</h3>
              <p className="text-muted-foreground text-sm">Set your daily budget and let AI find the best nutritious foods within your price range.</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Finding budget-friendly options for you...</p>
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <div className="space-y-4 animate-fade-in">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-heading text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Recommended Foods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 bg-muted/40 rounded-xl p-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-heading font-semibold text-sm">{item.name}</p>
                        <span className="text-sm font-bold text-primary">{item.price}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{item.calories} kcal</span>
                        <span>Protein: {item.protein}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 italic">{item.why}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-card border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Estimated Daily Cost</p>
                  <p className="font-heading font-bold text-lg text-primary">{result.totalEstimate}</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-nutri-blue/20 bg-nutri-blue/5">
                <CardContent className="p-4 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-nutri-blue shrink-0 mt-0.5" />
                  <p className="text-xs">{result.tip}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
