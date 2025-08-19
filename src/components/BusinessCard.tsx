import React from 'react';
import { Button } from "@/components/ui/button";
import { useFollows } from "@/hooks/useFollows";
import { Tables } from "@/integrations/supabase/types";

type Business = Tables<'businesses'>;

interface BusinessCardProps {
  business: Business;
  onClick: (business: Business) => void;
  defaultLogo: string;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onClick, defaultLogo }) => {
  const { isFollowing, loading, toggleFollow } = useFollows(business.id);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the business click
    toggleFollow();
  };

  return (
    <button
      key={business.id}
      onClick={() => onClick(business)}
      className="relative rounded-xl overflow-hidden bg-card aspect-square grid place-items-center shadow hover:scale-105 transition-transform duration-200"
    >
      <img
        src={business.logo_url || defaultLogo}
        alt={`${business.name} logo`}
        className="max-h-[80px] max-w-[100px] object-contain"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = defaultLogo;
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-foreground text-background text-[11px] grid place-items-center">
        <Button
          size="sm"
          variant={isFollowing ? "secondary" : "ghost"}
          className={`h-6 px-2 py-0 text-[11px] ${isFollowing ? 'text-foreground' : 'text-background'}`}
          onClick={handleFollowClick}
          disabled={loading}
        >
          {loading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
        </Button>
      </div>
      {/* Business name tooltip on hover */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
        <span className="text-white text-xs font-medium text-center px-2">
          {business.name}
        </span>
      </div>
    </button>
  );
};
