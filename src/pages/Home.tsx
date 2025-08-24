import { useState, useRef, useEffect } from "react";
import { MapPin, Star, Clock, Heart, MessageCircle, Share2, Plus, ChevronRight, TrendingUp, Award, Users, Utensils, ShoppingBag, Zap, Coffee, Sparkles } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import RotatingSearch from "@/components/RotatingSearch";
import CategoryMenu from "@/components/CategoryMenu";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Business = Tables<'businesses'>;
type Category = Tables<'categories'>;

interface FeedData {
  topRatedBusinesses: Business[];
  businessesWithOffers: Business[];
  recentBusinesses: Business[];
  categories: Category[];
  restaurantBusinesses: Business[];
  fashionBusinesses: Business[];
  loading: boolean;
}

// Component definitions using real data
const HeroBanner = ({ business }: { business: Business }) => (
  <div className="relative h-48 rounded-xl overflow-hidden mb-6 mx-4">
    <img
      src={business.cover_photo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop"}
      alt={business.name}
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
    <div className="absolute bottom-4 left-4 text-white">
      <h2 className="text-xl font-bold">{business.name}</h2>
      <p className="text-sm opacity-90">{business.editorial_summary || business.description || "Featured Business"}</p>
      {business.current_offer && (
        <Badge className="mt-2 bg-red-600 hover:bg-red-700">{business.current_offer}</Badge>
      )}
    </div>
  </div>
);

const HorizontalScrollCards = ({ businesses }: { businesses: Business[] }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3 px-4">Trending Now</h3>
    <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
      {businesses.slice(0, 8).map((business) => (
        <Link key={business.id} to={`/seller/${business.name.toLowerCase().replace(/\s+/g, '-')}`}>
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-0.5 mb-2">
              <div className="w-full h-full rounded-full bg-white p-1">
                <img
                  src={business.logo_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"}
                  alt={business.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground truncate w-16">{business.name.split(' ')[0]}</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const GridTileSection = ({ categories }: { categories: Category[] }) => {
  const getCategoryImage = (categoryName: string) => {
    const imageMap: Record<string, string> = {
      'Clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop',
      'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
      'Footwear': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
      'Grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
    };
    return imageMap[categoryName] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop';
  };

  const getCategoryEmoji = (categoryName: string) => {
    const emojiMap: Record<string, string> = {
      'Clothing': '👗',
      'Electronics': '📱',
      'Beauty': '💄',
      'Sports': '⚽',
      'Footwear': '👟',
      'Grocery': '🛒',
      'Books': '📚',
      'Watches': '⌚',
    };
    return emojiMap[categoryName] || '🏪';
  };

  return (
    <div className="mb-6 px-4">
      <h3 className="text-lg font-semibold mb-3">Shop by Category</h3>
      <div className="grid grid-cols-2 gap-3">
        {categories.slice(0, 4).map((category) => (
          <div key={category.id} className="relative aspect-square rounded-xl overflow-hidden">
            <img src={getCategoryImage(category.name)} alt={category.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl mb-1">{getCategoryEmoji(category.name)}</div>
                <p className="font-semibold">{category.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BigFeaturedCard = ({ business }: { business: Business }) => (
  <div className="mb-6 px-4">
    <Card className="relative h-64 overflow-hidden">
      <img
        src={business.cover_photo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop"}
        alt={business.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      {business.current_offer && (
        <div className="absolute top-4 right-4">
          <Badge variant="destructive">{business.current_offer}</Badge>
        </div>
      )}
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold">{business.name}</h3>
          {business.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{Number(business.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm opacity-90 line-clamp-2">
          {business.editorial_summary || business.description || "Featured business with great deals!"}
        </p>
      </div>
    </Card>
  </div>
);

const OfferStrip = ({ businesses }: { businesses: Business[] }) => (
  <div className="mb-6">
    <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4">
      <h3 className="font-bold text-center">🔥 EXCLUSIVE OFFERS</h3>
    </div>
    <div className="bg-gray-50 p-4">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {businesses.filter(b => b.current_offer).slice(0, 6).map((business) => (
          <Link key={business.id} to={`/seller/${business.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex-shrink-0 relative">
              <div className="w-28 h-28 bg-white rounded-lg p-3 shadow-sm flex items-center justify-center">
                <img
                  src={business.logo_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"}
                  alt={business.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-xs py-1 rounded-b-lg text-center font-bold">
                {business.current_offer}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

const LeaderboardCard = ({ businesses }: { businesses: Business[] }) => (
  <div className="mb-6 px-4">
    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
      <Award className="w-5 h-5 text-yellow-500" />
      Top Rated This Week
    </h3>
    <Card className="p-4">
      <div className="space-y-3">
        {businesses.slice(0, 3).map((business, index) => (
          <Link key={business.id} to={`/seller/${business.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <img
                src={business.logo_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop"}
                alt={business.name}
                className="w-10 h-10 object-contain rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{business.name}</p>
                {business.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{Number(business.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  </div>
);

const PhotoCarouselCard = ({ businesses }: { businesses: Business[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const businessPhotos = businesses
    .filter(b => b.cover_photo_url)
    .slice(0, 4)
    .map(b => b.cover_photo_url!);

  if (businessPhotos.length === 0) return null;

  return (
    <div className="mb-6 px-4">
      <h3 className="text-lg font-semibold mb-3">Business Gallery</h3>
      <Card className="overflow-hidden">
        <div className="relative h-48">
          <img
            src={businessPhotos[currentIndex]}
            alt={`Business ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {businessPhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

const MoodBoardSection = ({ businesses }: { businesses: Business[] }) => (
  <div className="mb-6 px-4">
    <h3 className="text-lg font-semibold mb-3">Discover Local Gems</h3>
    <div className="grid grid-cols-2 gap-2">
      {businesses.slice(0, 4).map((business, index) => (
        <Link key={business.id} to={`/seller/${business.name.toLowerCase().replace(/\s+/g, '-')}`}>
          <div className={`relative overflow-hidden rounded-lg ${index === 0 ? 'row-span-2 h-48' : 'h-24'}`}>
            <img
              src={business.cover_photo_url || business.logo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop"}
              alt={business.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2 text-white">
              <p className="font-semibold text-sm">{business.name}</p>
              {business.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{Number(business.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const SplitCardLayout = ({ business }: { business: Business }) => (
  <div className="mb-6 px-4">
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-1/2">
          <img
            src={business.cover_photo_url || business.logo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=150&fit=crop"}
            alt={business.name}
            className="w-full h-32 object-cover"
          />
        </div>
        <div className="w-1/2 p-4 flex flex-col justify-center">
          <h4 className="font-semibold text-sm mb-1">{business.name}</h4>
          {business.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">{Number(business.rating).toFixed(1)}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {business.editorial_summary || business.description || "Great local business"}
          </p>
          {business.current_offer && (
            <Badge className="mt-2 text-xs bg-green-600 hover:bg-green-700">{business.current_offer}</Badge>
          )}
        </div>
      </div>
    </Card>
  </div>
);

const CategoryDivider = ({ title, icon }: { title: string; icon: string }) => (
  <div className="my-6 px-4">
    <div className="flex items-center gap-2 py-3">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  </div>
);

const Home = () => {
  const [feedData, setFeedData] = useState<FeedData>({
    topRatedBusinesses: [],
    businessesWithOffers: [],
    recentBusinesses: [],
    categories: [],
    restaurantBusinesses: [],
    fashionBusinesses: [],
    loading: true,
  });

  useSEO({
    title: "LocalIt - Discover Best Local Deals & Businesses",
    description: "Explore curated local businesses, trending offers, and community reviews in your neighborhood. Your social network for local commerce.",
    canonical: window.location.origin + "/",
  });

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      setFeedData(prev => ({ ...prev, loading: true }));

      // Fetch top rated businesses
      const { data: topRated } = await supabase
        .from('businesses')
        .select('*')
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .limit(10);

      // Fetch businesses with offers
      const { data: withOffers } = await supabase
        .from('businesses')
        .select('*')
        .not('current_offer', 'is', null)
        .neq('current_offer', '')
        .limit(10);

      // Fetch recent businesses
      const { data: recent } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      // Fetch categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      // Fetch restaurant businesses
      const { data: restaurants } = await supabase
        .from('businesses')
        .select('*')
        .or('primary_type.eq.restaurant,primary_type.eq.indian_restaurant,primary_type.eq.buffet_restaurant')
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .limit(8);

      // Fetch fashion/clothing businesses
      const { data: fashion } = await supabase
        .from('businesses')
        .select('*')
        .or('primary_type.eq.clothing_store,primary_type.eq.shoe_store')
        .limit(8);

      setFeedData({
        topRatedBusinesses: topRated || [],
        businessesWithOffers: withOffers || [],
        recentBusinesses: recent || [],
        categories: categories || [],
        restaurantBusinesses: restaurants || [],
        fashionBusinesses: fashion || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching feed data:', error);
      setFeedData(prev => ({ ...prev, loading: false }));
    }
  };

  if (feedData.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading amazing local deals...</p>
        </div>
      </div>
    );
  }

  // Dynamic form factors based on available data
  const formFactors = [
    // Hero banner with top business
    feedData.topRatedBusinesses.length > 0 && {
      type: "hero",
      component: <HeroBanner business={feedData.topRatedBusinesses[0]} />
    },

    // Trending businesses horizontal scroll
    feedData.recentBusinesses.length > 0 && {
      type: "stories",
      component: <HorizontalScrollCards businesses={feedData.recentBusinesses} />
    },

    // Category grid
    feedData.categories.length > 0 && {
      type: "grid",
      component: <GridTileSection categories={feedData.categories} />
    },

    // Offers strip
    feedData.businessesWithOffers.length > 0 && {
      type: "offers",
      component: <OfferStrip businesses={feedData.businessesWithOffers} />
    },

    // Food & Drinks divider
    feedData.restaurantBusinesses.length > 0 && {
      type: "divider",
      component: <CategoryDivider title="Food & Drinks" icon="🍕" />
    },

    // Featured restaurant
    feedData.restaurantBusinesses.length > 0 && {
      type: "featured",
      component: <BigFeaturedCard business={feedData.restaurantBusinesses[0]} />
    },

    // Top rated leaderboard
    feedData.topRatedBusinesses.length > 0 && {
      type: "leaderboard",
      component: <LeaderboardCard businesses={feedData.topRatedBusinesses} />
    },

    // Photo carousel
    feedData.recentBusinesses.length > 0 && {
      type: "carousel",
      component: <PhotoCarouselCard businesses={feedData.recentBusinesses} />
    },

    // Fashion divider
    feedData.fashionBusinesses.length > 0 && {
      type: "divider2",
      component: <CategoryDivider title="Fashion & Style" icon="👕" />
    },

    // Mood board section
    feedData.recentBusinesses.length > 0 && {
      type: "moodboard",
      component: <MoodBoardSection businesses={feedData.recentBusinesses} />
    },

    // Split card layout
    feedData.topRatedBusinesses.length > 1 && {
      type: "split",
      component: <SplitCardLayout business={feedData.topRatedBusinesses[1]} />
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
        <div className="p-4">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Discover the best local deals at</p>
            <div className="flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="font-medium">Sarath City Capital Mall</p>
            </div>
          </div>

          <RotatingSearch />

          <div className="mt-4">
            <CategoryMenu
              selectedCategoryId="all"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {formFactors.length > 0 ? (
          formFactors.map((item: any, index) => (
            <div key={`${item.type}-${index}`} className="animate-fade-in">
              {item.component}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No businesses found. Check back soon!</p>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;