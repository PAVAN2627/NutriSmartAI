import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Target, Bell, LogOut, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    age: "",
    occupation: "working",
    diet: "veg",
    activity: "gym",
    goal: "loss",
  });
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setUid(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          displayName: data.displayName || "",
          email: data.email || user.email || "",
          age: data.age || "",
          occupation: data.occupation || "working",
          diet: data.diet || "veg",
          activity: data.activity || "gym",
          goal: data.goal || "loss",
        });
      } else {
        // Fallbacks if no doc
        setProfile((prev) => ({
          ...prev,
          displayName: user.displayName || "",
          email: user.email || "",
        }));
      }
      setInitLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleSave = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "users", uid), {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success("Profile has been updated securely!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (initLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full pt-20">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
        </div>

        {/* Profile */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled className="bg-muted opacity-60" />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle & Personalization */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Lifestyle & Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lifestyle</Label>
                <Select value={profile.occupation} onValueChange={(v) => setProfile({ ...profile, occupation: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="working">Working Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Diet Preference</Label>
                <Select value={profile.diet} onValueChange={(v) => setProfile({ ...profile, diet: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={profile.activity} onValueChange={(v) => setProfile({ ...profile, activity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">Go to Gym</SelectItem>
                    <SelectItem value="no gym">No Gym</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Health Goal</Label>
                <Select value={profile.goal} onValueChange={(v) => setProfile({ ...profile, goal: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loss">Weight Loss</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Weight Gain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Get meal reminders and AI coaching tips</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button variant="hero" onClick={handleSave} disabled={loading} className="flex-1 max-w-[200px]">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
