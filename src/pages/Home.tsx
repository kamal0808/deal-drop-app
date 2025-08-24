import { useEffect, useRef, useState } from "react";
import { MapPin, Heart, MessageCircle, Share2, BadgeCheck, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
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

// Photo type for individual photos
type Photo = {
  id: string;
  photo_url: string;
  width_px?: number;
  height_px?: number;
  display_order: number;
};

// UI Post type for the feed
type Post = {
  id: string;
  photos: Photo[];
  offer: string;
  store: string;
  description: string;
  logoUrl: string;
  businessId: string;
};

// Photo Carousel Component for multiple photos
const PhotoCarousel = ({ photos, onImageClick }: { photos: Photo[]; onImageClick?: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : photos.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex < photos.length - 1 ? currentIndex + 1 : 0);
  };

  // Auto-swiping functionality
  const startAutoPlay = () => {
    if (photos.length > 1 && isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => prev < photos.length - 1 ? prev + 1 : 0);
      }, 2000); // Auto-swipe every 2 seconds
    }
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Intersection Observer to detect when carousel is in view
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAutoPlaying(true);
            startAutoPlay();
          } else {
            setIsAutoPlaying(false);
            stopAutoPlay();
          }
        });
      },
      { threshold: 0.5 } // Start auto-play when 50% of the carousel is visible
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      observer.disconnect();
      stopAutoPlay();
    };
  }, [photos.length, isAutoPlaying]);

  // Stop auto-play on user interaction
  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
    stopAutoPlay();
  };

  if (photos.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">No image available</span>
      </div>
    );
  }

  return (
    <div
      ref={carouselRef}
      className="relative w-full h-full"
      onMouseEnter={() => {
        if (isAutoPlaying) stopAutoPlay();
      }}
      onMouseLeave={() => {
        if (isAutoPlaying) startAutoPlay();
      }}
    >
      <img
        src={photos[currentIndex].photo_url}
        alt={`Photo ${currentIndex + 1} of ${photos.length}`}
        className="w-full h-full object-cover cursor-pointer"
        loading="lazy"
        onClick={onImageClick}
        onTouchStart={(e) => {
          handleUserInteraction();
          onTouchStart(e);
        }}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />

      {/* Navigation arrows for desktop */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUserInteraction();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Previous photo"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUserInteraction();
              goToNext();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Next photo"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Photo indicators and auto-play control */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
          {/* Photo indicators */}
          <div className="flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserInteraction();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isAutoPlaying) {
                setIsAutoPlaying(false);
                stopAutoPlay();
              } else {
                setIsAutoPlaying(true);
                startAutoPlay();
              }
            }}
            className="bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
            aria-label={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
          >
            {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      )}
    </div>
  );
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
      <div className="relative" style={{ height: 545 }}>
        <div className={`w-full h-full ${expanded ? 'blur-[2px]' : ''}`}>
          <PhotoCarousel photos={post.photos} onImageClick={onImageClick} />
        </div>
        {/* Vertical Ribbon */}
        <div className="absolute top-0" style={{ left: '30px' }}>
          <div className="bg-destructive text-destructive-foreground px-3 py-4 shadow-lg"
               style={{
                 width: '57px',
                 height: '96px',
                 borderBottomLeftRadius: '12px',
                 borderBottomRightRadius: '12px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 textAlign: 'center'
               }}>
            <span className="text-xs font-bold leading-tight whitespace-pre-line transform -rotate-0">{post.offer}</span>
          </div>
        </div>
        {/* Action stack */}
          <div className="absolute right-2 bottom-36 flex flex-col items-center gap-3">
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
          <div className="flex items-center gap-2">
            <Link to={`/seller/${post.businessId}`} className="text-sm font-bold text-white flex items-center gap-1">
              {post.store}
            </Link>
            <BadgeCheck className="text-white" size={16} fill="green" />
            <Button
              size="sm"
              variant={isFollowing ? 'default' : 'secondary'}
              onClick={toggleFollow}
              disabled={followLoading}
              className="h-6"
            >
              {followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
            </Button>
          </div>
          <div className="mt-3 flex gap-3 items-start">
            <Link to={`/seller/${post.businessId}`} className="shrink-0 h-9 w-9 rounded-full bg-white grid place-items-center overflow-hidden">
              <img src={post.logoUrl} alt={`${post.store} logo`} className="h-full w-full object-contain" />
            </Link>
            <button className="text-left text-white" onClick={() => setExpanded(e => !e)} aria-expanded={expanded}>
              {/* First row - Large text */}
              <div className="text-base leading-relaxed">
                {post.description.substring(0, 40)}
              </div>

              {/* Remaining text - Small text */}
              {post.description.length > 80 && (
                <div className={`mt-1 ${expanded ? '' : 'line-clamp-2'}`}>
                  <div className="text-xs leading-relaxed opacity-90">
                    {expanded ? post.description.substring(40) : post.description.substring(40, 160)}
                  </div>
                </div>
              )}

              {post.description.length > 80 && (
                <span className="ml-1 opacity-80 text-xs">{expanded ? ' Show less' : ' …more'}</span>
              )}
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
  const transformPost = (dbPost: any): Post => {
    // Handle photos array from the new schema
    const photos = Array.isArray(dbPost.photos) ? dbPost.photos : [];

    return {
      id: dbPost.id,
      photos: photos,
      offer: dbPost.offer || "Special Offer",
      store: dbPost.business_name || dbPost.business?.name,
      description: dbPost.description || "Check out this amazing deal!",
      logoUrl: dbPost.business_logo_url || dbPost.business?.logo_url || "https://via.placeholder.com/40x40?text=Logo",
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

        const { data, error } = await (supabase as any).rpc('search_posts', {
          search_term: searchTerm,
          category_filter: categoryFilter,
          result_limit: limit,
          result_offset: offset
        });

        if (error) {
          throw error;
        }

        // Transform search results to match Post interface
        const transformedPosts = (data || []).map(transformPost);

        if (append) {
          setPosts(prev => [...prev, ...transformedPosts]);
        } else {
          setPosts(transformedPosts);
        }

        // Check if we have more posts
        setHasMore(transformedPosts.length === limit);

      } else {
        // Regular fetch without search using the new function
        const categoryFilter = categoryId !== 'all' ? categoryId : null;

        const { data, error } = await (supabase as any).rpc('get_posts_with_photos', {
          category_filter: categoryFilter,
          result_limit: limit,
          result_offset: offset
        });

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
      <header className="px-8 pt-4">
        <p className="text-xs text-muted-foreground">Here are the best deals at</p>
        <h1 className="text-base font-semibold flex items-center gap-1"><MapPin size={16} className="text-brand" /> Sarath City Capital Mall</h1>
      </header>

      <section className="px-8 mt-3">
        <RotatingSearch
          onSearch={handleSearch}
          onClear={handleSearchClear}
          searchQuery={searchQuery}
          enableAutoSearch={true}
        />
      </section>

      <section className="mt-4 px-8">
        <CategoryMenu
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      </section>

      {isSearchMode && searchQuery && (
        <section className="px-8 mt-2">
          <div className="text-sm text-muted-foreground">
            Search results for "<span className="font-medium text-foreground">{searchQuery}</span>"
            {selectedCategoryId !== 'all' && (
              <span> in selected category</span>
            )}
          </div>
        </section>
      )}

      <section className="mt-2 px-8 space-y-4">
        {loading && posts.length === 0 ? (
          // Initial loading skeleton
          [...Array(3)].map((_, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden shadow-md bg-card animate-pulse">
              <div className="relative" style={{ height: 545 }}>
                <div className="w-full h-full bg-muted" />
                <div className="absolute top-0" style={{ left: '30px' }}>
                  <div className="bg-muted rounded-b-xl" style={{ width: '57px', height: '96px' }} />
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
