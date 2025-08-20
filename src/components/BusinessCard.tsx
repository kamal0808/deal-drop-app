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
    <div className="flex flex-col items-center shadow-lg"
    style={{
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
        }}>
      <button
        key={business.id}
        onClick={() => onClick(business)}
        className={`relative overflow-hidden hover:scale-105 transition-all duration-200 grid place-items-center bg-white ${
          isFollowing
            ? ''
            : 'border border-gray-200'
        }`}
        style={{
          width: '163px',
          height: '163px',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px'
        }}
      >
        <img
          src={business.logo_url || defaultLogo}
          alt={`${business.name} logo`}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultLogo;
          }}
        />
        {/* Business name tooltip on hover */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <span className="text-white text-xs font-medium text-center px-2">
            {business.name}
          </span>
        </div>
      </button>

      {/* Follow button below the logo container */}
      <Button
        size="sm"
        variant={isFollowing ? "secondary" : "default"}
        className="text-sm font-bold px-4 py-2 uppercase"
        style={{
          height: '52px',
          width: '163px',
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          marginTop: '0px'
        }}
        onClick={handleFollowClick}
        disabled={loading}
      >
        {loading ? 'LOADING...' : (isFollowing ? 'FOLLOWING' : 'FOLLOW')}
      </Button>
    </div>
  );
};
