import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface LocationData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: LocationData) => void;
  label?: string;
  placeholder?: string;
}

const LocationAutocomplete = ({ 
  value, 
  onChange, 
  onLocationSelect,
  label = "Населено място",
  placeholder = "Въведете град или населено място"
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&type=city&format=json&apiKey=${apiKey}`
        );
        const data = await response.json();
        setSuggestions(data.results || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const handleSelect = (suggestion: any) => {
    const displayName = `${suggestion.city || suggestion.name}, ${suggestion.country}`;
    onChange(displayName);
    
    if (onLocationSelect) {
      onLocationSelect({
        city: suggestion.city || suggestion.name,
        country: suggestion.country,
        lat: suggestion.lat,
        lon: suggestion.lon,
        displayName
      });
    }
    
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <Label htmlFor="location" className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {label}
      </Label>
      <Input
        id="location"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 p-2 bg-background border border-border rounded-md shadow-lg">
          <p className="text-sm text-muted-foreground">Зареждане...</p>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              onClick={() => handleSelect(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">
                    {suggestion.city || suggestion.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.country}
                    {suggestion.state && `, ${suggestion.state}`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
