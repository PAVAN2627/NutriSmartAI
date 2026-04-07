import { DashboardLayout } from "@/components/DashboardLayout";
import { Camera, Upload, Sparkles, Apple, Flame, Heart, RefreshCw, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { getGeminiVisionModel } from "@/lib/gemini";
import { toast } from "sonner";

const ScanFood = () => {
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setScanning(true);
    setScanned(false);

    try {
      const imagePart = await fileToGenerativePart(file);
      const model = getGeminiVisionModel();
      const prompt = `Analyze this food image. Provide a highly accurate estimation of the dish name, total calories, health score (from 0 to 100), and macro grams (protein, carbs, fat). Also recommend one extremely brief healthy alternative if needed. Respond STRICTLY in a valid JSON format like: {"name": "Dal Rice", "calories": 350, "healthScore": 85, "protein": "12g", "carbs": "65g", "fat": "5g", "alternative": "Try quinoa instead of white rice for more fiber"}`;
      
      const res = await model.generateContent([prompt, imagePart]);
      const text = res.response.text();
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setResult(parsed);
      setScanned(true);
      toast.success("Food analyzed perfectly!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze image. Ensure it's a clear food picture.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Scan Food</h1>
          <p className="text-muted-foreground mt-1">Upload or capture a food image to unlock instant AI analysis</p>
        </div>

        {/* Upload area */}
        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-8">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            {imagePreview ? (
              <div className="relative border-2 border-primary/20 rounded-2xl overflow-hidden mb-4">
                <img src={imagePreview} className="w-full h-48 object-cover opacity-80" />
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="absolute top-2 right-2 rounded-full h-8 w-8"
                  onClick={() => { setImagePreview(null); setScanned(false); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center hover:border-primary/60 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">Upload Food Image</h3>
                <p className="text-muted-foreground text-sm mb-6">Capture or select an image from your device</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="hero" onClick={() => fileInputRef.current?.click()} disabled={scanning}>
                    {scanning ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Select Image</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {scanned && (
          <div className="space-y-4 animate-fade-in">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Analysis Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-nutri-orange/10 flex items-center justify-center text-3xl">
                    🍛
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold">{result?.name || "Unknown Food"}</h3>
                    <p className="text-muted-foreground text-sm">Detected with high AI confidence</p>
                  </div>
                </div>

                {/* Macro cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Calories", value: `${result?.calories || 0} kcal`, icon: Flame, color: "text-nutri-orange", bg: "bg-nutri-orange/10" },
                    { label: "Protein", value: result?.protein || "0g", icon: Apple, color: "text-nutri-blue", bg: "bg-nutri-blue/10" },
                    { label: "Carbs", value: result?.carbs || "0g", icon: Apple, color: "text-nutri-lime", bg: "bg-nutri-lime/10" },
                    { label: "Fat", value: result?.fat || "0g", icon: Apple, color: "text-nutri-purple", bg: "bg-nutri-purple/10" },
                  ].map((m) => (
                    <div key={m.label} className={`${m.bg} rounded-xl p-4 text-center`}>
                      <m.icon className={`h-5 w-5 ${m.color} mx-auto mb-1`} />
                      <p className="font-heading font-bold text-lg">{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Health score */}
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-sm">Health Score</p>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div
                        className="gradient-primary h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${result?.healthScore || 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-heading font-bold text-lg text-primary">{result?.healthScore || 0}/100</span>
                </div>

                {/* Alternative */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-heading font-semibold text-sm text-primary">AI Suggestion</p>
                    <p className="text-sm text-muted-foreground">{result?.alternative || "Great choice!"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScanFood;
