import { useEffect, useRef, useState } from "react";
import { MapPin, Heart, MessageCircle, Share2, BadgeCheck } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import CategoryMenu from "@/components/CategoryMenu";
import RotatingSearch from "@/components/RotatingSearch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { generateBusinessSlug } from "@/lib/utils";

// Database types
type DatabasePost = Tables<'posts'>;
type DatabaseBusiness = Tables<'businesses'>;

// Combined type for posts with business information
type PostWithBusiness = DatabasePost & {
  business: DatabaseBusiness;
};

// UI Post type for the feed
type Post = {
  id: string;
  image: string;
  offer: string;
  store: string;
  description: string;
  logoUrl: string;
  sellerSlug: string;
};



const FeedPost = ({ post, onImageClick }: { post: Post; onImageClick?: () => void }) => {
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [shake, setShake] = useState<{ like?: boolean; comment?: boolean; share?: boolean }>({});

  const trig = (key: keyof typeof shake) => {
    setShake((s) => ({ ...s, [key]: true }));
    setTimeout(() => setShake((s) => ({ ...s, [key]: false })), 380);
  };

  const onShare = async () => {
    const shareData = { title: "LocalIt", text: `${post.store}: ${post.offer}`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        toast.success("Link copied to clipboard");
      }
    } catch {}
  };

  return (
    <article className="relative rounded-xl overflow-hidden shadow-md bg-card animate-fade-in">
      <div className="relative" style={{ height: 440 }}>
        <img
          src={post.image}
          alt={`${post.store} deal visual`}
          className={`w-full h-full object-cover cursor-pointer ${expanded ? 'blur-[2px]' : ''}`}
          loading="lazy"
          onClick={onImageClick}
        />
        {/* Ribbon */}
        <div className="absolute left-3 top-3">
          <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-sm shadow"
               style={{ transform: 'rotate(-6deg)' }}>
            <span className="text-xs font-semibold leading-tight whitespace-pre-line">{post.offer}</span>
          </div>
        </div>
        {/* Action stack */}
          <div className="absolute right-2 bottom-28 flex flex-col items-center gap-3">
          <button onClick={() => { setLiked(v => !v); trig('like'); }} className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.like ? 'animate-shake' : ''}`} aria-label="Like">
            <Heart size={20} className={`transition-colors ${liked ? 'text-destructive fill-destructive' : ''}`} />
          </button>
          <button onClick={() => { setOpenComments(true); trig('comment'); }} className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.comment ? 'animate-shake' : ''}`} aria-label="Comments">
            <MessageCircle size={20} />
          </button>
          <button onClick={() => { onShare(); trig('share'); }} className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.share ? 'animate-shake' : ''}`} aria-label="Share">
            <Share2 size={20} />
          </button>
        </div>
        {/* Bottom glass panel */}
        <div className={`absolute inset-x-0 bottom-0 p-3 transition-all ${expanded ? 'h-1/2' : 'h-1/4'} glass`}> 
          <div className="flex items-center justify-between">
            <Link to={`/seller/${post.sellerSlug}`} className="text-sm font-medium text-primary-foreground flex items-center gap-1"><BadgeCheck className="text-primary-foreground" size={14} /> {post.store}</Link>
            <Button size="sm" variant={following ? 'secondary' : 'default'} onClick={() => setFollowing(f => !f)}>
              {following ? 'Following' : 'Follow'}
            </Button>
          </div>
          <div className="mt-3 flex gap-3 items-start">
            <Link to={`/seller/${post.sellerSlug}`} className="shrink-0 h-9 w-9 rounded-full bg-brand text-brand-foreground grid place-items-center overflow-hidden">
              <img src={post.logoUrl} alt={`${post.store} logo`} className="h-9 w-9 object-contain p-1" />
            </Link>
            <button className="text-left text-sm text-primary-foreground" onClick={() => setExpanded(e => !e)} aria-expanded={expanded}>
              <span className={`${expanded ? '' : 'line-clamp-3'}`}>{post.description}</span>
              <span className="ml-1 opacity-80">{expanded ? ' Show less' : ' …more'}</span>
            </button>
          </div>
        </div>
      </div>

      <Sheet open={openComments} onOpenChange={setOpenComments}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>Comments</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {["Looks great!", "Is size M available?", "What are the store timings today?"] .map((c,i)=> (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-xs">U{i+1}</div>
                <p className="text-sm">{c}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input placeholder="Add a comment" />
            <Button>Post</Button>
          </div>
        </SheetContent>
      </Sheet>
    </article>
  );
};

const Home = () => {
  useSEO({
    title: "LocalIt Home – Best deals at Sarath City Mall",
    description: "Scroll hyperlocal deals, follow stores, like, comment and share offers around Sarath City Mall.",
    canonical: window.location.origin + "/home",
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Open post viewer at specific index
  const openViewer = (idx: number) => {
    setStartIndex(idx);
    setViewerOpen(true);
  };

  // Transform database post to UI post format
  const transformPost = (dbPost: PostWithBusiness): Post => {
    return {
      id: dbPost.id,
      image: dbPost.photo_url,
      offer: dbPost.offer || "Special Offer",
      store: dbPost.business.name,
      description: dbPost.description || "Check out this amazing deal!",
      logoUrl: dbPost.business.logo_url || "https://via.placeholder.com/40x40?text=Logo",
      sellerSlug: generateBusinessSlug(dbPost.business.name)
    };
  };

  // Fetch posts from database
  const fetchPosts = async (pageNum: number = 0, append: boolean = false, categoryId: string = selectedCategoryId) => {
    try {
      if (!append) setLoading(true);

      const limit = 10;
      const offset = pageNum * limit;

      let query = supabase
        .from('posts')
        .select(`
          *,
          business:businesses(*)
        `);

      // Apply category filter if not "all"
      if (categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      const transformedPosts = (data || []).map(transformPost);

      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }

      // Check if we have more posts
      setHasMore(transformedPosts.length === limit);

    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setPage(0);
    setHasMore(true);
    fetchPosts(0, false, categoryId);
  };

  // Initial load
  useEffect(() => {
    fetchPosts(0, false);
  }, []);

  // Infinite scroll
  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, true);
      }
    }, { rootMargin: '200px' });

    if (loaderRef.current) ob.observe(loaderRef.current);
    return () => ob.disconnect();
  }, [hasMore, loading, page]);

  // Keyboard support for viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && viewerOpen) {
        setViewerOpen(false);
      }
    };

    if (viewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when viewer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [viewerOpen]);

  return (
    <main className="pb-24 max-w-md mx-auto">
      <header className="px-4 pt-4">
        <p className="text-xs text-muted-foreground">Here are the best deals at</p>
        <h1 className="text-base font-semibold flex items-center gap-1"><MapPin size={16} className="text-brand" /> Sarath City Mall</h1>
      </header>

      <section className="px-4 mt-3">
        <RotatingSearch />
      </section>

      <section className="mt-2 px-3">
        <CategoryMenu
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      </section>

      <section className="mt-2 px-5 space-y-4">
        {loading && posts.length === 0 ? (
          // Initial loading skeleton
          [...Array(3)].map((_, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden shadow-md bg-card animate-pulse">
              <div className="relative" style={{ height: 440 }}>
                <div className="w-full h-full bg-muted" />
                <div className="absolute left-3 top-3">
                  <div className="bg-muted h-6 w-20 rounded-sm" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 h-1/4 bg-gradient-to-t from-black/50 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-8 w-16 bg-muted rounded" />
                  </div>
                  <div className="mt-3 flex gap-3 items-start">
                    <div className="h-9 w-9 bg-muted rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-full bg-muted rounded" />
                      <div className="h-3 w-3/4 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          // No posts state
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to discover amazing deals when businesses start posting!
            </p>
          </div>
        ) : (
          // Posts list
          posts.map((p, index) => (
            <FeedPost
              key={p.id}
              post={p}
              onImageClick={() => openViewer(index)}
            />
          ))
        )}

        {/* Infinite scroll loader */}
        {hasMore && posts.length > 0 && (
          <div ref={loaderRef} className="h-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>You've seen all the latest deals! 🎉</p>
          </div>
        )}
      </section>

      {/* Full-screen post viewer */}
      {viewerOpen && posts.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto snap-y snap-mandatory">
          {posts.map((post, i) => (
            <section key={post.id} className="h-screen w-full relative snap-start">
              <img
                src={post.image}
                alt={post.description || "Post image"}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Like functionality can be added here
                  }}
                  className="h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale"
                  aria-label="Like"
                >
                  <Heart size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Comment functionality can be added here
                  }}
                  className="h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale"
                  aria-label="Comments"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const shareData = { title: "LocalIt", text: `${post.store}: ${post.offer}`, url: window.location.href };
                    try {
                      if (navigator.share) {
                        await navigator.share(shareData);
                      } else {
                        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
                        toast.success("Link copied to clipboard");
                      }
                    } catch {}
                  }}
                  className="h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale"
                  aria-label="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>
              <div className="absolute left-0 right-0 bottom-0 p-4 glass text-primary-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-background grid place-items-center">
                    <img
                      src={post.logoUrl}
                      alt="store logo"
                      className="p-1 object-contain w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{post.store}</div>
                    <div className="text-xs opacity-80 truncate">
                      {post.description}
                    </div>
                  </div>
                  {post.offer && (
                    <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-semibold">
                      {post.offer}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewerOpen(false)}
                className="absolute top-4 right-4 bg-background text-foreground rounded-full h-9 px-3 text-sm"
              >
                Close
              </button>
            </section>
          )).slice(startIndex).concat(posts.slice(0, startIndex).map((post, i) => (
            <section key={`wrap-${post.id}`} className="h-screen w-full relative snap-start">
              <img
                src={post.image}
                alt={post.description || "Post image"}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </section>
          )))}
        </div>
      )}

      <BottomNav active="home" />
    </main>
  );
};

export default Home;
