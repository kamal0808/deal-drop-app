import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { Comments } from '@/components/Comments';

// Photo type for individual photos
type Photo = {
  id: string;
  photo_url: string;
  width_px?: number;
  height_px?: number;
  display_order: number;
};

interface Post {
  id: string;
  photos: Photo[];
  offer: string;
  store: string;
  description: string;
  logoUrl: string;
  businessId: string;
}

// Photo Carousel Component for full-screen viewer
const FullScreenPhotoCarousel = ({ photos }: { photos: Photo[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  if (photos.length === 0) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
        <span className="text-white/60">No image available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={photos[currentIndex].photo_url}
        alt={`Photo ${currentIndex + 1} of ${photos.length}`}
        className="absolute inset-0 w-full h-full object-contain"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />

      {/* Navigation arrows for desktop */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-3 opacity-70 hover:opacity-100 transition-opacity z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-3 opacity-70 hover:opacity-100 transition-opacity z-10"
            aria-label="Next photo"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Photo indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SearchResultPostProps {
  post: Post;
  onShare: () => void;
}

export const SearchResultPost: React.FC<SearchResultPostProps> = ({ post, onShare }) => {
  const [openComments, setOpenComments] = useState(false);
  const [shake, setShake] = useState<{ like?: boolean; comment?: boolean; share?: boolean }>({});
  
  // Use the likes and comments hooks
  const { liked, likeCount, loading: likesLoading, toggleLike } = useLikes(post.id);
  const { commentCount } = useComments(post.id);

  const trig = (key: keyof typeof shake) => {
    setShake((s) => ({ ...s, [key]: true }));
    setTimeout(() => setShake((s) => ({ ...s, [key]: false })), 380);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!likesLoading) {
      await toggleLike();
      trig('like');
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenComments(true);
    trig('comment');
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
    trig('share');
  };

  return (
    <>
      <section className="h-screen w-full relative snap-start">
        <FullScreenPhotoCarousel photos={post.photos} />

        {/* Post info overlay */}
        <div className="absolute left-0 right-0 bottom-0 p-4 glass text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-white grid place-items-center">
              <img
                src={post.logoUrl}
                alt="store logo"
                className="object-contain w-full h-full"
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

        <div className="absolute right-3 bottom-28 flex flex-col items-center gap-3">
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
          <button
            onClick={handleShareClick}
            className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.share ? 'animate-shake' : ''}`}
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
        </div>
      </section>

      <Comments 
        postId={post.id}
        isOpen={openComments}
        onClose={() => setOpenComments(false)}
      />
    </>
  );
};
