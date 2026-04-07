import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { sendWelcomeEmail } from "@/lib/emailService";
import { getGeminiTextModel } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain } from "lucide-react";

const STEP_COUNT = 4;

type FormData = {
  age: string;
  weight: string;
  height: string;
  gender: "male" | "female";
  goal: "lose" | "maintain" | "gain";
  occupation: "student" | "working";
  diet: "veg" | "non-veg" | "vegan";
  activity: "sedentary" | "light" | "gym" | "athlete";
};

const initialForm: FormData = {
  age: "",
  weight: "",
  height: "",
  gender: "male",
  goal: "maintain",
  occupation: "working",
  diet: "veg",
  activity: "light",
};

function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Record<T, string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <div
          key={opt}
          onClick={() => onChange(opt)}
          className={`p-3 text-center rounded-xl cursor-pointer border transition-colors text-sm font-medium ${
            value === opt
              ? "border-primary bg-primary/10 text-primary shadow-sm"
              : "border-border hover:bg-muted"
          }`}
        >
          {labels ? labels[opt] : opt.charAt(0).toUpperCase() + opt.slice(1)}
        </div>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialForm);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setFormData((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      else setUser(u);
    });
    return () => unsub();
  }, [navigate]);

  const validateStep = () => {
    if (step === 1) {
      if (!formData.age || !formData.weight || !formData.height)
        return toast.error("Please fill in age, weight and height");
      if (+formData.age < 10 || +formData.age > 100) return toast.error("Enter a valid age");
      if (+formData.weight < 20 || +formData.weight > 300) return toast.error("Enter a valid weight");
      if (+formData.height < 100 || +formData.height > 250) return toast.error("Enter a valid height");
    }
    return true;
  };

  const next = () => {
    if (validateStep() !== true) return;
    setStep((s) => Math.min(s + 1, STEP_COUNT));
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const model = getGeminiTextModel();
      const prompt = `You are an expert nutritionist. Calculate daily nutrition targets for:
- Age: ${formData.age}, Gender: ${formData.gender}
- Weight: ${formData.weight}kg, Height: ${formData.height}cm
- Goal: ${formData.goal} weight
- Occupation: ${formData.occupation}, Activity: ${formData.activity}
- Diet: ${formData.diet}
Use Mifflin-St Jeor BMR formula with appropriate TDEE multiplier and goal adjustment.
Return ONLY valid JSON: {"calories": 2200, "protein": 150, "carbs": 200, "fat": 65}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const aiPlan = JSON.parse(clean);

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...formData,
          targetCalories: aiPlan.calories,
          targetProtein: aiPlan.protein,
          targetCarbs: aiPlan.carbs,
          targetFat: aiPlan.fat,
          profileCompleted: true,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      if (user.email) {
        sendWelcomeEmail(user.email, user.displayName || "NutriSmart User").catch(console.error);
      }

      toast.success("Profile setup complete!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{
        backgroundImage: "url('/Gemini_Generated_Image_1jsqse1jsqse1jsq.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="max-w-lg w-full bg-card/95 backdrop-blur-md p-8 rounded-3xl shadow-elevated relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg">NutriSmart</span>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6 mt-4">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-1">Step {step} of {STEP_COUNT}</p>

        {/* Step 1 — Body Metrics */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold font-heading">Body Metrics</h2>
              <p className="text-muted-foreground text-sm mt-1">Used to calculate your BMR and daily calorie needs.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {(["age", "weight", "height"] as const).map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-sm font-medium capitalize">
                    {field} {field === "weight" ? "(kg)" : field === "height" ? "(cm)" : ""}
                  </label>
                  <Input
                    type="number"
                    placeholder={field === "age" ? "25" : field === "weight" ? "70" : "175"}
                    value={formData[field]}
                    onChange={(e) => set(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <OptionGrid
                options={["male", "female"] as const}
                value={formData.gender}
                onChange={(v) => set("gender", v)}
                labels={{ male: "Male", female: "Female" }}
              />
            </div>
          </div>
        )}

        {/* Step 2 — Goal */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold font-heading">Your Goal</h2>
              <p className="text-muted-foreground text-sm mt-1">This adjusts your calorie target up or down.</p>
            </div>
            <OptionGrid
              options={["lose", "maintain", "gain"] as const}
              value={formData.goal}
              onChange={(v) => set("goal", v)}
              labels={{ lose: "Lose Weight", maintain: "Maintain Weight", gain: "Gain Muscle" }}
            />
          </div>
        )}

        {/* Step 3 — Lifestyle */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold font-heading">Lifestyle</h2>
              <p className="text-muted-foreground text-sm mt-1">Helps determine your activity multiplier.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Occupation</label>
              <OptionGrid
                options={["student", "working"] as const}
                value={formData.occupation}
                onChange={(v) => set("occupation", v)}
                labels={{ student: "Student", working: "Working Professional" }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Level</label>
              <OptionGrid
                options={["sedentary", "light", "gym", "athlete"] as const}
                value={formData.activity}
                onChange={(v) => set("activity", v)}
                labels={{
                  sedentary: "Sedentary (desk job)",
                  light: "Light (walks/yoga)",
                  gym: "Gym (3–5x/week)",
                  athlete: "Athlete (daily intense)",
                }}
              />
            </div>
          </div>
        )}

        {/* Step 4 — Diet */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold font-heading">Dietary Preference</h2>
              <p className="text-muted-foreground text-sm mt-1">We'll tailor food suggestions to your diet type.</p>
            </div>
            <OptionGrid
              options={["veg", "non-veg", "vegan"] as const}
              value={formData.diet}
              onChange={(v) => set("diet", v)}
              labels={{ veg: "Vegetarian", "non-veg": "Non-Vegetarian", vegan: "Vegan" }}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={back} disabled={loading} className="flex-1 h-11">
              Back
            </Button>
          )}
          {step < STEP_COUNT ? (
            <Button onClick={next} className="flex-1 h-11">
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="flex-1 h-11 bg-gradient-to-r from-primary to-nutri-lime text-primary-foreground hover:opacity-90">
              {loading ? "Generating AI Plan..." : "Generate My Nutrition Plan"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
