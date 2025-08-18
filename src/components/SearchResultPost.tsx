import React, { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { Comments } from '@/components/Comments';

interface Post {
  id: string;
  image: string;
  offer: string;
  store: string;
  description: string;
  logoUrl: string;
  sellerSlug: string;
}

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
        <img
          src={post.image}
          alt={post.description || "Post image"}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Post info overlay */}
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
