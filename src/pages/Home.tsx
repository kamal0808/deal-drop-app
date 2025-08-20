import { useEffect, useRef, useState } from "react";
import { MapPin, Heart, MessageCircle, Share2, BadgeCheck } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import CategoryMenu from "@/components/CategoryMenu";
import RotatingSearch from "@/components/RotatingSearch";
import { Comments } from "@/components/Comments";
import { SearchResultPost } from "@/components/SearchResultPost";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { generateBusinessSlug } from "@/lib/utils";
import { useLikes } from "@/hooks/useLikes";
import { useComments } from "@/hooks/useComments";
import { useFollows } from "@/hooks/useFollows";

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
  businessId: string;
};



const FeedPost = ({ post, onImageClick }: { post: Post; onImageClick?: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [shake, setShake] = useState<{ like?: boolean; comment?: boolean; share?: boolean }>({});

  // Use the likes, comments, and follows hooks
  const { liked, likeCount, loading: likesLoading, toggleLike } = useLikes(post.id);
  const { commentCount } = useComments(post.id);
  const { isFollowing, followerCount, loading: followLoading, toggleFollow } = useFollows(post.businessId);

  const trig = (key: keyof typeof shake) => {
    setShake((s) => ({ ...s, [key]: true }));
    setTimeout(() => setShake((s) => ({ ...s, [key]: false })), 380);
  };

  const handleLikeClick = async () => {
    if (!likesLoading) {
      await toggleLike();
      trig('like');
    }
  };

  const handleCommentClick = () => {
    setOpenComments(true);
    trig('comment');
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
          <div className="relative">
            <button
              onClick={handleLikeClick}
              disabled={likesLoading}
              className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.like ? 'animate-shake' : ''} ${likesLoading ? 'opacity-50' : ''}`}
              aria-label="Like"
            >
              <Heart size={20} className={`transition-colors ${liked ? 'text-destructive fill-destructive' : ''}`} />
            </button>
            {likeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {likeCount > 99 ? '99+' : likeCount}
              </span>
            )}
          </div>
          <div className="relative">
            <button
              onClick={handleCommentClick}
              className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.comment ? 'animate-shake' : ''}`}
              aria-label="Comments"
            >
              <MessageCircle size={20} />
            </button>
            {commentCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-brand-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {commentCount > 99 ? '99+' : commentCount}
              </span>
            )}
          </div>
          <button onClick={() => { onShare(); trig('share'); }} className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.share ? 'animate-shake' : ''}`} aria-label="Share">
            <Share2 size={20} />
          </button>
        </div>
        {/* Bottom glass panel */}
        <div className={`absolute inset-x-0 bottom-0 p-3 transition-all ${expanded ? 'h-1/2' : 'h-1/4'} glass`}> 
          <div className="flex items-center justify-between">
            <Link to={`/seller/${post.sellerSlug}`} className="text-sm font-medium text-primary-foreground flex items-center gap-1"><BadgeCheck className="text-primary-foreground" size={14} /> {post.store}</Link>
            <Button
              size="sm"
              variant={isFollowing ? 'secondary' : 'default'}
              onClick={toggleFollow}
              disabled={followLoading}
            >
              {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
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

      <Comments
        postId={post.id}
        isOpen={openComments}
        onClose={() => setOpenComments(false)}
      />
    </article>
  );
};

const Home = () => {
  useSEO({
    title: "LocalIt Home – Best deals at Sarath City Capital Mall",
    description: "Scroll hyperlocal deals, follow stores, like, comment and share offers around Sarath City Capital Mall.",
    canonical: window.location.origin + "/home",
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState(false);
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
      sellerSlug: generateBusinessSlug(dbPost.business.name),
      businessId: dbPost.business_id
    };
  };

  // Fetch posts from database
  const fetchPosts = async (
    pageNum: number = 0,
    append: boolean = false,
    categoryId: string = selectedCategoryId,
    searchTerm: string = searchQuery
  ) => {
    try {
      if (!append) setLoading(true);

      const limit = 10;
      const offset = pageNum * limit;

      // Use search function if search term is provided
      if (searchTerm.trim()) {
        const categoryFilter = categoryId !== 'all' ? categoryId : null;

        const { data, error } = await supabase.rpc('search_posts', {
          search_term: searchTerm,
          category_filter: categoryFilter,
          result_limit: limit,
          result_offset: offset
        });

        if (error) {
          throw error;
        }

        // Transform search results to match Post interface
        const transformedPosts = (data || []).map((result: any): Post => ({
          id: result.id,
          image: result.photo_url,
          offer: result.offer || "Special Offer",
          store: result.business_name,
          description: result.description || "Check out this amazing deal!",
          logoUrl: result.business_logo_url || "https://via.placeholder.com/40x40?text=Logo",
          sellerSlug: generateBusinessSlug(result.business_name)
        }));

        if (append) {
          setPosts(prev => [...prev, ...transformedPosts]);
        } else {
          setPosts(transformedPosts);
        }

        // Check if we have more posts
        setHasMore(transformedPosts.length === limit);

      } else {
        // Regular fetch without search
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
      }

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
    fetchPosts(0, false, categoryId, searchQuery);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(true);
    setPage(0);
    setHasMore(true);
    fetchPosts(0, false, selectedCategoryId, query);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setPage(0);
    setHasMore(true);
    fetchPosts(0, false, selectedCategoryId, '');
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
        fetchPosts(nextPage, true, selectedCategoryId, searchQuery);
      }
    }, { rootMargin: '200px' });

    if (loaderRef.current) ob.observe(loaderRef.current);
    return () => ob.disconnect();
  }, [hasMore, loading, page, selectedCategoryId, searchQuery]);

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
        <h1 className="text-base font-semibold flex items-center gap-1"><MapPin size={16} className="text-brand" /> Sarath City Capital Mall</h1>
      </header>

      <section className="px-4 mt-3">
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

      {isSearchMode && searchQuery && (
        <section className="px-4 mt-2">
          <div className="text-sm text-muted-foreground">
            Search results for "<span className="font-medium text-foreground">{searchQuery}</span>"
            {selectedCategoryId !== 'all' && (
              <span> in selected category</span>
            )}
          </div>
        </section>
      )}

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
          {posts.slice(startIndex).concat(posts.slice(0, startIndex)).map((post, i) => (
            <SearchResultPost
              key={`viewer-${post.id}-${i}`}
              post={post}
              onShare={async () => {
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
            />
          ))}
          <button
            onClick={() => setViewerOpen(false)}
            className="fixed top-4 right-4 bg-background text-foreground rounded-full h-9 px-3 text-sm z-10"
          >
            Close
          </button>
        </div>
      )}

      <BottomNav active="home" />
    </main>
  );
};

export default Home;
