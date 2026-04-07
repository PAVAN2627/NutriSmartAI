import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { sendBuddyInviteEmail } from "@/lib/emailService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users, Send, RefreshCw, MapPin, Target, Dumbbell,
  Utensils, Star, CheckCircle2, Search,
} from "lucide-react";
import { toast } from "sonner";

type Profile = {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  age: string;
  gender: string;
  goal: string;
  occupation: string;
  activity: string;
  diet: string;
  targetCalories: number;
};

function scoreMatch(me: Profile, other: Profile): number {
  let score = 0;
  if (other.goal === me.goal) score += 40;
  if (other.gender === me.gender) score += 20;
  if (other.occupation === me.occupation) score += 20;
  if (other.activity === me.activity) score += 15;
  if (other.diet === me.diet) score += 5;
  return score;
}

function MatchBadge({ score }: { score: number }) {
  const label = score >= 80 ? "Perfect Match" : score >= 60 ? "Great Match" : score >= 40 ? "Good Match" : "Potential Match";
  const color = score >= 80 ? "bg-primary/15 text-primary" : score >= 60 ? "bg-nutri-blue/15 text-nutri-blue" : "bg-nutri-orange/15 text-nutri-orange";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{label} · {score}%</span>;
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Card className="shadow-card border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" /> Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={profile.photoURL} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
            {profile.displayName?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-heading font-bold">{profile.displayName}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant="secondary" className="text-xs gap-1"><Target className="h-3 w-3" />{profile.goal} weight</Badge>
            <Badge variant="secondary" className="text-xs gap-1"><Dumbbell className="h-3 w-3" />{profile.activity}</Badge>
            <Badge variant="secondary" className="text-xs gap-1"><Utensils className="h-3 w-3" />{profile.diet}</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{profile.occupation}</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{profile.gender}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FitnessBuddy() {
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<(Profile & { score: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [customMsg, setCustomMsg] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data() as Profile;
        setMyProfile({ ...data, uid: user.uid, email: user.email || data.email });
      }
    });
    return () => unsub();
  }, []);

  const findMatches = async () => {
    if (!myProfile) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const results: (Profile & { score: number })[] = [];
      snap.forEach((d) => {
        if (d.id === myProfile.uid) return;
        const data = d.data() as Profile;
        if (!data.profileCompleted) return;
        const score = scoreMatch(myProfile, data);
        results.push({ ...data, uid: d.id, score });
      });
      results.sort((a, b) => b.score - a.score);
      setMatches(results);
      if (results.length === 0) toast.info("No other users found yet. Invite friends to join!");
      else toast.success(`Found ${results.length} potential buddies!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to find matches.");
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (buddy: Profile) => {
    if (!myProfile) return;
    setInviting(buddy.uid);
    const msg = customMsg[buddy.uid] || `Hey ${buddy.displayName?.split(" ")[0] || "there"}! We have similar fitness goals. Want to be accountability buddies on NutriSmart?`;
    const res = await sendBuddyInviteEmail(buddy.email, myProfile.displayName || "A NutriSmart User", msg);
    if (res.success) {
      setSent((p) => new Set(p).add(buddy.uid));
      toast.success(`Invite sent to ${buddy.displayName}!`);
    } else {
      toast.error("Failed to send invite. Try again.");
    }
    setInviting(null);
  };

  const filtered = matches.filter((m) =>
    !search || m.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Fitness Buddy</h1>
            <p className="text-muted-foreground mt-1">Find people with the same goal, diet and lifestyle</p>
          </div>
          <Button onClick={findMatches} disabled={loading || !myProfile} className="gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            {matches.length > 0 ? "Refresh" : "Find Buddies"}
          </Button>
        </div>

        {/* My profile */}
        {myProfile && <ProfileCard profile={myProfile} />}

        {/* Matching criteria info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: "Same Goal", icon: Target, pts: "40 pts" },
            { label: "Same Gender", icon: Users, pts: "20 pts" },
            { label: "Same Occupation", icon: Star, pts: "20 pts" },
            { label: "Same Activity", icon: Dumbbell, pts: "15 pts" },
          ].map((c) => (
            <div key={c.label} className="bg-muted/50 rounded-xl p-3">
              <c.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.pts}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {matches.length === 0 && !loading && (
          <Card className="shadow-card border-dashed border-primary/30">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-nutri-blue/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-nutri-blue" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Find Your Match</h3>
              <p className="text-muted-foreground text-sm mb-6">
                We match you by goal, gender, occupation and activity level. Click "Find Buddies" to discover people like you.
              </p>
              <Button onClick={findMatches} disabled={!myProfile} className="gap-2">
                <Users className="h-4 w-4" /> Find Buddies
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        {matches.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Match cards */}
        <div className="space-y-4">
          {filtered.map((buddy) => (
            <Card key={buddy.uid} className="shadow-card">
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={buddy.photoURL} />
                    <AvatarFallback className="bg-nutri-blue/20 text-nutri-blue font-bold">
                      {buddy.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading font-bold">{buddy.displayName || "NutriSmart User"}</p>
                      <MatchBadge score={buddy.score} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-xs gap-1 capitalize"><Target className="h-3 w-3" />{buddy.goal}</Badge>
                      <Badge variant="outline" className="text-xs gap-1 capitalize"><Dumbbell className="h-3 w-3" />{buddy.activity}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{buddy.diet}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{buddy.occupation}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{buddy.gender}</Badge>
                    </div>
                  </div>
                </div>

                {/* Invite section */}
                {sent.has(buddy.uid) ? (
                  <div className="flex items-center gap-2 text-primary text-sm font-medium bg-primary/10 rounded-xl px-4 py-2">
                    <CheckCircle2 className="h-4 w-4" /> Invite sent!
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm resize-none min-h-[70px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder={`Hey ${buddy.displayName?.split(" ")[0] || "there"}! We have similar fitness goals. Want to be accountability buddies?`}
                      value={customMsg[buddy.uid] || ""}
                      onChange={(e) => setCustomMsg((p) => ({ ...p, [buddy.uid]: e.target.value }))}
                    />
                    <Button
                      onClick={() => sendInvite(buddy)}
                      disabled={inviting === buddy.uid}
                      size="sm"
                      className="gap-2"
                    >
                      {inviting === buddy.uid
                        ? <><RefreshCw className="h-3 w-3 animate-spin" /> Sending...</>
                        : <><Send className="h-3 w-3" /> Send Invite</>}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
