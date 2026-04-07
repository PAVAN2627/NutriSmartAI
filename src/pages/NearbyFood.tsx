import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Clock, Search, Navigation, ExternalLink, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

type PlaceResult = {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { isOpen: () => boolean };
  geometry: { location: { lat: () => number; lng: () => number } };
  photos?: { getUrl: (opts: object) => string }[];
  distance?: string;
  isOpen?: boolean;
};

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function mapsUrl(place: PlaceResult) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || "")}&query_place_id=${place.place_id}`;
}

export default function NearbyFood() {
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const mapDivRef = useRef<HTMLDivElement>(null);
  const filters = ["All", "Open Now", "Top Rated", "Nearest"];

  // Load Google Maps JS SDK once
  useEffect(() => {
    if (window.google?.maps) { setMapsReady(true); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapsReady(true);
    script.onerror = () => toast.error("Failed to load Google Maps");
    document.head.appendChild(script);
  }, []);

  const searchNearby = (lat: number, lng: number) => {
    if (!window.google?.maps || !mapDivRef.current) return;
    setLoading(true);

    const map = new window.google.maps.Map(mapDivRef.current, {
      center: { lat, lng },
      zoom: 14,
    });

    const service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: { lat, lng },
        radius: 3000,
        type: "restaurant",
        keyword: "healthy food",
      },
      (results: any[], status: string) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const enriched: PlaceResult[] = results.map((p) => ({
            ...p,
            distance: distanceKm(lat, lng, p.geometry.location.lat(), p.geometry.location.lng()),
            isOpen: p.opening_hours?.isOpen?.() ?? undefined,
          }));
          enriched.sort((a, b) => parseFloat(a.distance || "0") - parseFloat(b.distance || "0"));
          setPlaces(enriched);
          toast.success(`Found ${enriched.length} places near you!`);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPlaces([]);
          toast.info("No healthy restaurants found nearby.");
        } else {
          toast.error("Places search failed: " + status);
        }
      }
    );

    // Reverse geocode for location name
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === "OK" && results[0]) {
        const comps = results[0].address_components;
        const area = comps.find((c: any) => c.types.includes("sublocality"))?.long_name;
        const city = comps.find((c: any) => c.types.includes("locality"))?.long_name;
        setLocationName(area || city || "Your Location");
      }
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    if (!mapsReady) return toast.error("Maps still loading, try again");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        searchNearby(lat, lng);
      },
      () => {
        setLoading(false);
        toast.error("Location access denied. Please allow location in browser settings.");
      }
    );
  };

  // Auto-detect on maps ready
  useEffect(() => {
    if (mapsReady) getLocation();
  }, [mapsReady]);

  let filtered = places.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );
  if (activeFilter === "Open Now") filtered = filtered.filter((p) => p.isOpen === true);
  if (activeFilter === "Top Rated") filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (activeFilter === "Nearest") filtered = [...filtered].sort((a, b) => parseFloat(a.distance || "0") - parseFloat(b.distance || "0"));

  return (
    <DashboardLayout>
      {/* Hidden map div required by PlacesService */}
      <div ref={mapDivRef} style={{ display: "none" }} />

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Nearby Healthy Food</h1>
          <p className="text-muted-foreground mt-1">Real restaurants near you via Google Maps</p>
        </div>

        {/* Location bar */}
        <Card className="shadow-card border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-heading font-semibold text-sm">
                {locationName || (location ? "Location detected" : "Detecting location...")}
              </p>
              <p className="text-xs text-muted-foreground">
                {location
                  ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} · 3km radius`
                  : "Allow location access to find nearby places"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={getLocation} disabled={loading || !mapsReady} className="gap-1.5 shrink-0">
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
              {location ? "Refresh" : "Detect"}
            </Button>
          </CardContent>
        </Card>

        {/* Search + filters */}
        {places.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <Button key={f} variant={activeFilter === f ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(f)}>
                  {f}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Finding healthy food near you...</p>
          </div>
        )}

        {/* No location yet */}
        {!loading && !location && (
          <Card className="shadow-card border-dashed border-primary/30">
            <CardContent className="p-12 text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">Allow Location Access</h3>
              <p className="text-muted-foreground text-sm mb-6">
                We need your location to find healthy restaurants nearby.
              </p>
              <Button onClick={getLocation} disabled={!mapsReady} className="gap-2">
                <Navigation className="h-4 w-4" /> Detect My Location
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{filtered.length} places found</p>
            {filtered.map((place, i) => (
              <Card
                key={place.place_id}
                className="shadow-card hover:shadow-elevated transition-all hover:-translate-y-0.5 animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                    {place.photos?.[0] ? (
                      <img
                        src={place.photos[0].getUrl({ maxWidth: 160, maxHeight: 160 })}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🍽️</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-bold truncate">{place.name}</h3>
                      <a
                        href={mapsUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{place.vicinity}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{place.distance} km
                      </span>
                      {place.rating && (
                        <span className="flex items-center gap-1 text-nutri-orange">
                          <Star className="h-3 w-3 fill-nutri-orange" />
                          {place.rating} ({place.user_ratings_total})
                        </span>
                      )}
                      {place.isOpen !== undefined && (
                        <span className={`flex items-center gap-1 font-medium ${place.isOpen ? "text-primary" : "text-destructive"}`}>
                          <Clock className="h-3 w-3" />
                          {place.isOpen ? "Open Now" : "Closed"}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && location && filtered.length === 0 && places.length > 0 && (
          <p className="text-center text-muted-foreground py-8">No results match your filter.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
