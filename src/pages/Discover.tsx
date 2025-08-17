import { useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import CategoryMenu from "@/components/CategoryMenu";
import RotatingSearch from "@/components/RotatingSearch";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Business = Tables<'businesses'>;

// Fallback logo for businesses without logos
const DEFAULT_LOGO = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center";

export default function Discover() {
  useSEO({
    title: "Discover Deals – LocalIt",
    description: "Search, browse categories, explore top offers and follow your favorite brands.",
    canonical: window.location.origin + "/discover",
  });

  // State for businesses data
  const [businessesWithOffers, setBusinessesWithOffers] = useState<Business[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [displayedBusinesses, setDisplayedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const ITEMS_PER_PAGE = 12;

  // Fetch businesses with offers for the top section
  const fetchBusinessesWithOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .not('current_offer', 'is', null)
        .not('current_offer', 'eq', '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinessesWithOffers(data || []);
    } catch (error) {
      console.error('Error fetching businesses with offers:', error);
    }
  };

  // Fetch all businesses for the grid section
  const fetchAllBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllBusinesses(data || []);
      setDisplayedBusinesses((data || []).slice(0, ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching all businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more businesses for infinite scroll
  const loadMoreBusinesses = () => {
    if (loadingMore || displayedBusinesses.length >= allBusinesses.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextItems = allBusinesses.slice(
        displayedBusinesses.length,
        displayedBusinesses.length + ITEMS_PER_PAGE
      );
      setDisplayedBusinesses(prev => [...prev, ...nextItems]);
      setLoadingMore(false);
    }, 500); // Small delay for better UX
  };

  useEffect(() => {
    fetchBusinessesWithOffers();
    fetchAllBusinesses();
  }, []);

  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreBusinesses();
      }
    }, { rootMargin: "200px" });
    if (loaderRef.current) ob.observe(loaderRef.current);
    return () => ob.disconnect();
  }, [displayedBusinesses, allBusinesses, loadingMore]);

  return (
    <main className="pb-24 max-w-md mx-auto">
      <section className="px-4 pt-4">
        <RotatingSearch />
      </section>

      <section className="mt-2 px-3">
        <CategoryMenu />
      </section>

      <section className="mt-3">
        <div className="h-11 bg-destructive text-destructive-foreground grid place-items-center text-xs font-semibold tracking-wider">
          TOP OFFERS TO GRAB
        </div>
        <div className="bg-muted h-[180px] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 px-3 py-3">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="relative h-[112px] w-[112px] rounded-xl overflow-hidden bg-card shadow-sm flex-shrink-0 animate-pulse">
                  <div className="w-full h-full bg-gray-200"></div>
                </div>
              ))
            ) : businessesWithOffers.length === 0 ? (
              // No offers available
              <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">
                No offers available at the moment
              </div>
            ) : (
              // Dynamic offers from database
              businessesWithOffers.map((business) => (
                <div key={business.id} className="relative h-[112px] w-[112px] rounded-xl overflow-hidden bg-card shadow-sm flex-shrink-0 grid place-items-center">
                  <img
                    src={business.logo_url || DEFAULT_LOGO}
                    alt={`${business.name} logo`}
                    className="max-h-[64px] max-w-[80px] object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_LOGO;
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 h-5 bg-destructive text-destructive-foreground grid place-items-center text-[10px] font-semibold">
                    {business.current_offer}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            // Loading skeleton for grid
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden bg-card aspect-square animate-pulse">
                <div className="w-full h-full bg-gray-200"></div>
              </div>
            ))
          ) : displayedBusinesses.length === 0 ? (
            // No businesses available
            <div className="col-span-2 flex items-center justify-center py-12 text-muted-foreground text-sm">
              No businesses available
            </div>
          ) : (
            // Dynamic businesses from database
            displayedBusinesses.map((business) => (
              <div key={business.id} className="relative rounded-xl overflow-hidden bg-card aspect-square grid place-items-center shadow">
                <img
                  src={business.logo_url || DEFAULT_LOGO}
                  alt={`${business.name} logo`}
                  className="max-h-[80px] max-w-[100px] object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_LOGO;
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-6 bg-foreground text-background text-[11px] grid place-items-center">
                  <Button size="sm" variant="ghost" className="h-6 px-2 py-0 text-[11px] text-background">
                    Follow
                  </Button>
                </div>
                {/* Business name tooltip on hover */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <span className="text-white text-xs font-medium text-center px-2">
                    {business.name}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="grid grid-cols-2 gap-3 w-full">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden bg-card aspect-square animate-pulse">
                  <div className="w-full h-full bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={loaderRef} className="h-10" />
      </section>

      <BottomNav active="discover" />
    </main>
  );
}
