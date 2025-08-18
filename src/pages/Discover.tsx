import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import CategoryMenu from "@/components/CategoryMenu";
import RotatingSearch from "@/components/RotatingSearch";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { generateBusinessSlug } from "@/lib/utils";

type Business = Tables<'businesses'>;

// Fallback logo for businesses without logos
const DEFAULT_LOGO = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center";

export default function Discover() {
  const navigate = useNavigate();

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const ITEMS_PER_PAGE = 12;

  // Handle business navigation
  const handleBusinessClick = (business: Business) => {
    const businessSlug = generateBusinessSlug(business.name);
    navigate(`/seller/${businessSlug}`);
  };

  // Search businesses using the search function
  const searchBusinesses = async (
    searchTerm: string = searchQuery,
    categoryId: string = selectedCategoryId
  ) => {
    try {
      setLoading(true);
      const categoryFilter = categoryId !== 'all' ? categoryId : null;

      // Try the advanced search function first
      const { data, error } = await supabase.rpc('search_businesses', {
        search_term: searchTerm,
        category_filter: categoryFilter,
        result_limit: 50, // Get more results for search
        result_offset: 0
      });

      if (error) {
        console.log('Advanced business search not available, falling back to basic search:', error.message);

        // Fallback to basic search if search_businesses function doesn't exist
        let query = supabase
          .from('businesses')
          .select('*');

        if (searchTerm.trim()) {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,current_offer.ilike.%${searchTerm}%`);
        }

        // Apply category filter by joining with posts if category is specified
        if (categoryFilter) {
          const { data: categoryBusinesses, error: categoryError } = await supabase
            .from('posts')
            .select('business_id')
            .eq('category_id', categoryFilter);

          if (!categoryError && categoryBusinesses) {
            const businessIds = categoryBusinesses.map(p => p.business_id);
            query = query.in('id', businessIds);
          }
        }

        const { data: fallbackData, error: fallbackError } = await query
          .order('created_at', { ascending: false })
          .limit(50);

        if (fallbackError) {
          console.error('Fallback search error:', fallbackError);
          setBusinessesWithOffers([]);
          setAllBusinesses([]);
          setDisplayedBusinesses([]);
          return;
        }

        const searchResults = fallbackData || [];

        // Separate businesses with and without offers
        const withOffers = searchResults.filter((business: Business) =>
          business.current_offer && business.current_offer.trim() !== ''
        );
        const allResults = searchResults;

        setBusinessesWithOffers(withOffers);
        setAllBusinesses(allResults);
        setDisplayedBusinesses(allResults.slice(0, ITEMS_PER_PAGE));
        return;
      }

      const searchResults = data || [];

      // Separate businesses with and without offers
      const withOffers = searchResults.filter((business: any) => business.has_offer);
      const allResults = searchResults;

      setBusinessesWithOffers(withOffers);
      setAllBusinesses(allResults);
      setDisplayedBusinesses(allResults.slice(0, ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error searching businesses:', error);
      // Fallback to empty results on error
      setBusinessesWithOffers([]);
      setAllBusinesses([]);
      setDisplayedBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(true);
    searchBusinesses(query, selectedCategoryId);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setSelectedCategoryId('all');
    fetchBusinessesWithOffers();
    fetchAllBusinesses();
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    if (isSearchMode && searchQuery) {
      searchBusinesses(searchQuery, categoryId);
    } else if (categoryId === 'all') {
      fetchBusinessesWithOffers();
      fetchAllBusinesses();
    } else {
      // Filter businesses by category
      searchBusinesses('', categoryId);
      setIsSearchMode(true);
    }
  };

  useEffect(() => {
    fetchBusinessesWithOffers();
    fetchAllBusinesses();
  }, []);

  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        loadMoreBusinesses();
      }
    }, { rootMargin: "200px" });
    if (loaderRef.current) ob.observe(loaderRef.current);
    return () => ob.disconnect();
  }, [displayedBusinesses, allBusinesses, loadingMore, loading]);

  return (
    <main className="pb-24 max-w-md mx-auto">
      <section className="px-4 pt-4">
        <RotatingSearch
          onSearch={handleSearch}
          onClear={handleSearchClear}
          searchQuery={searchQuery}
          enableAutoSearch={true}
        />
      </section>

      <section className="mt-2 px-3">
        <CategoryMenu
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      </section>

      {isSearchMode && (searchQuery || selectedCategoryId !== 'all') && (
        <section className="px-4 mt-2">
          <div className="text-sm text-muted-foreground">
            {searchQuery ? (
              <>
                Search results for "<span className="font-medium text-foreground">{searchQuery}</span>"
                {selectedCategoryId !== 'all' && (
                  <span> in selected category</span>
                )}
              </>
            ) : (
              <span>Showing businesses in selected category</span>
            )}
          </div>
        </section>
      )}

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
                <button
                  key={business.id}
                  onClick={() => handleBusinessClick(business)}
                  className="relative h-[112px] w-[112px] rounded-xl overflow-hidden bg-card shadow-sm flex-shrink-0 grid place-items-center hover:scale-105 transition-transform duration-200"
                >
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
                </button>
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
              <button
                key={business.id}
                onClick={() => handleBusinessClick(business)}
                className="relative rounded-xl overflow-hidden bg-card aspect-square grid place-items-center shadow hover:scale-105 transition-transform duration-200"
              >
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
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 py-0 text-[11px] text-background pointer-events-none"
                  >
                    Follow
                  </Button>
                </div>
                {/* Business name tooltip on hover */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <span className="text-white text-xs font-medium text-center px-2">
                    {business.name}
                  </span>
                </div>
              </button>
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
