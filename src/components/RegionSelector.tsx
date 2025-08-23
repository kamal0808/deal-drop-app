import { useState, useEffect } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRegions } from "@/services/feedService";

interface Region {
  id: string;
  name: string;
  city: string | null;
}

interface RegionSelectorProps {
  selectedRegionId: string | null;
  onRegionChange: (regionId: string | null) => void;
}

export default function RegionSelector({ selectedRegionId, onRegionChange }: RegionSelectorProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const fetchedRegions = await getRegions();
        setRegions(fetchedRegions);
      } catch (error) {
        console.error('Error loading regions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, []);

  const selectedRegion = regions.find(region => region.id === selectedRegionId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-full">
        <MapPin className="h-4 w-4 text-white/60" />
        <span className="text-white/60 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 h-auto bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/30 border-0"
        >
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">
            {selectedRegion 
              ? `${selectedRegion.name}${selectedRegion.city ? `, ${selectedRegion.city}` : ''}`
              : 'All Regions'
            }
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 max-h-80 overflow-y-auto bg-black/90 backdrop-blur-sm border-white/20"
      >
        <DropdownMenuItem
          onClick={() => onRegionChange(null)}
          className={`text-white hover:bg-white/10 cursor-pointer ${
            !selectedRegionId ? 'bg-white/10' : ''
          }`}
        >
          <MapPin className="h-4 w-4 mr-2" />
          <div>
            <div className="font-medium">All Regions</div>
            <div className="text-xs text-white/60">Show videos from all locations</div>
          </div>
        </DropdownMenuItem>
        
        {regions.map((region) => (
          <DropdownMenuItem
            key={region.id}
            onClick={() => onRegionChange(region.id)}
            className={`text-white hover:bg-white/10 cursor-pointer ${
              selectedRegionId === region.id ? 'bg-white/10' : ''
            }`}
          >
            <MapPin className="h-4 w-4 mr-2" />
            <div>
              <div className="font-medium">{region.name}</div>
              {region.city && (
                <div className="text-xs text-white/60">{region.city}</div>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
