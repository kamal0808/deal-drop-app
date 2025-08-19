import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useParams, useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MapPin, Phone, MessageCircle, Navigation, Heart, MessageSquare, Share2, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { generateBusinessSlug, formatPhoneForLink } from "@/lib/utils";
import { useFollows } from "@/hooks/useFollows";
import { SearchResultPost } from "@/components/SearchResultPost";

// Database types
type DatabaseBusiness = Tables<'businesses'>;
type DatabasePost = Tables<'posts'>;

// Business with posts
type BusinessWithPosts = DatabaseBusiness & {
  posts: DatabasePost[];
};

export default function Seller() {
  const { sellername } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<BusinessWithPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  // Use the follow hook - will be initialized once we have business data
  const { isFollowing, followerCount, loading: followLoading, toggleFollow } = useFollows(business?.id || '');



  // Fetch business data by slug
  const fetchBusinessData = async () => {
    if (!sellername) return;

    try {
      setLoading(true);

      // First, get all businesses and find the one with matching slug
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*');

      if (businessError) throw businessError;

      // Find business by slug
      const matchingBusiness = businesses?.find(b => generateBusinessSlug(b.name) === sellername);

      if (!matchingBusiness) {
        throw new Error('Business not found');
      }

      // Fetch posts for this business
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', matchingBusiness.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setBusiness({
        ...matchingBusiness,
        posts: posts || []
      });

    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error("Business not found or failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [sellername]);

  // SEO setup
  useSEO({
    title: business ? `${business.name} – LocalIt Outlet` : 'Business – LocalIt Outlet',
    description: business ? `Discover deals, posts and contact details for ${business.name}.` : 'Discover local business deals and offers.',
    canonical: window.location.origin + `/seller/${sellername}`,
  });

  const openViewer = (idx: number) => { setStartIndex(idx); setViewerOpen(true); };

  // Loading state
  if (loading) {
    return (
      <main className="pb-24 max-w-md mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading business details...</p>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  // Business not found state
  if (!business) {
    return (
      <main className="pb-24 max-w-md mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-xl font-semibold mb-2">Business Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The business you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/home')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  const phoneForLink = formatPhoneForLink(business.phone_number);
  const whatsappForLink = formatPhoneForLink(business.whatsapp_number);

  return (
    <main className="pb-24 max-w-md mx-auto">
      <section className="relative h-[180px] w-full overflow-hidden">
        <img
          src={business.cover_photo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop"}
          alt={`${business.name} cover`}
          className="w-full h-full object-cover"
        />
      </section>

      {/* Logo positioned outside cover section to be fully visible */}
      <div className="relative -mt-16 mb-4 flex justify-center">
        <div className="h-32 w-32 rounded-full bg-background shadow-xl grid place-items-center overflow-hidden border z-10">
          <img
            src={business.logo_url || "https://via.placeholder.com/144x144?text=Logo"}
            alt={`${business.name} logo`}
            className="p-3 object-contain w-full h-full"
          />
        </div>
      </div>

      <section className="px-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {business.name}
              <BadgeCheck className="text-primary" size={18} />
            </h1>
            {business.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {business.description}
              </p>
            )}
            {business.google_maps_link && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-brand" /> View on Maps
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant={isFollowing ? 'secondary' : 'default'}
                onClick={toggleFollow}
                disabled={followLoading}
              >
                {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
              </Button>
              {business.phone_number && (
                <a
                  href={`tel:${phoneForLink}`}
                  className="h-9 w-9 rounded-full grid place-items-center bg-secondary text-secondary-foreground"
                  aria-label="Call"
                >
                  <Phone size={18} />
                </a>
              )}
              {business.phone_number && (
                <a
                  href={`sms:${phoneForLink}`}
                  className="h-9 w-9 rounded-full grid place-items-center bg-secondary text-secondary-foreground"
                  aria-label="Text"
                >
                  <MessageCircle size={18} />
                </a>
              )}
              {business.whatsapp_number && (
                <a
                  href={`https://wa.me/${whatsappForLink}`}
                  target="_blank"
                  className="h-9 w-9 rounded-full grid place-items-center bg-secondary text-secondary-foreground"
                  aria-label="WhatsApp"
                  rel="noreferrer"
                >
                  <MessageSquare size={18} />
                </a>
              )}
              {business.google_maps_link && (
                <a
                  href={business.google_maps_link}
                  target="_blank"
                  className="h-9 w-9 rounded-full grid place-items-center bg-secondary text-secondary-foreground"
                  aria-label="Maps"
                  rel="noreferrer"
                >
                  <Navigation size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-full bg-secondary text-secondary-foreground py-2">
            <div className="text-base font-semibold">{business.posts.length}</div>
            <div className="text-[11px] opacity-80 -mt-0.5">posts</div>
          </div>
          <div className="rounded-full bg-secondary text-secondary-foreground py-2">
            <div className="text-base font-semibold">{followerCount}</div>
            <div className="text-[11px] opacity-80 -mt-0.5">followers</div>
          </div>
          <div className="rounded-full bg-secondary text-secondary-foreground py-2">
            <div className="text-base font-semibold">-</div>
            <div className="text-[11px] opacity-80 -mt-0.5">impressions</div>
          </div>
        </div>

        {business.posts.length > 0 ? (
          <div className="mt-5 grid grid-cols-3 auto-rows-[80px] gap-2">
            {business.posts.map((post, idx) => {
              // Optimal grid pattern for 3-column layout:
              // Large images at indices 3, 9, 15, 21... (3 + 6*n)
              // This creates pattern: S S S L S S S S S L S S...
              // Each large image (2x2) takes 4 cells, with 2 small images beside it
              const isLarge = (idx - 3) % 6 === 0 && idx >= 3;
              const span = isLarge ? "col-span-2 row-span-2" : "";

              return (
                <button
                  key={post.id}
                  onClick={() => openViewer(idx)}
                  className={`relative overflow-hidden rounded-md bg-card ${span}`}
                >
                  <img
                    src={post.photo_url}
                    alt={post.description || `Post ${idx+1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  {post.offer && (
                    <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-xs font-semibold">
                      {post.offer}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              This business hasn't shared any posts yet. Check back later for amazing deals!
            </p>
          </div>
        )}
      </section>

      {viewerOpen && business.posts.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto snap-y snap-mandatory">
          {business.posts.slice(startIndex).concat(business.posts.slice(0, startIndex)).map((post, i) => {
            // Transform the post data to match SearchResultPost expected format
            const transformedPost = {
              id: post.id,
              image: post.photo_url,
              offer: post.offer || '',
              store: business.name,
              description: post.description || post.offer || "Check out this amazing deal!",
              logoUrl: business.logo_url || "https://via.placeholder.com/32x32?text=Logo",
              sellerSlug: generateBusinessSlug(business.name),
              businessId: business.id,
            };

            return (
              <SearchResultPost
                key={`viewer-${post.id}-${i}`}
                post={transformedPost}
                onShare={async () => {
                  const shareData = {
                    title: "LocalIt",
                    text: `${business.name}: ${post.offer || post.description || 'Check out this deal!'}`,
                    url: window.location.href
                  };
                  try {
                    if (navigator.share) {
                      await navigator.share(shareData);
                    } else {
                      await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
                      toast.success("Link copied to clipboard");
                    }
                  } catch {}
                }}
              />
            );
          })}
          <button
            onClick={() => setViewerOpen(false)}
            className="fixed top-4 right-4 bg-background text-foreground rounded-full h-9 px-3 text-sm z-10"
          >
            Close
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
