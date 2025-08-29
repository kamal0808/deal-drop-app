import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, Sparkles, Loader2, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedVideo } from "@/services/feedService";

interface VideoItemProps {
  video: FeedVideo;
  index: number;
  isLoaded: boolean;
  isPreloaded: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  userMutePreference: boolean;
  processingVideoId: string | null;
  onTogglePlay: (index: number) => void;
  onToggleMute: (index: number) => void;
  onLike: (videoId: string) => void;
  onComment: (videoId: string) => void;
  onShare: (video: FeedVideo) => void;
  onAISearch: (video: FeedVideo) => void;
  onCategoryMenuToggle: () => void;
}

export default function VideoItem({
  video,
  index,
  isLoaded,
  isPreloaded,
  isPlaying,
  isMuted,
  userMutePreference,
  processingVideoId,
  onTogglePlay,
  onToggleMute,
  onLike,
  onComment,
  onShare,
  onAISearch,
  onCategoryMenuToggle
}: VideoItemProps) {
  return (
    <div
      className="h-screen w-full snap-start relative flex items-center justify-center"
      onClick={(e) => {
        // Only toggle play if clicking on the video area (not on overlay controls)
        if (e.target === e.currentTarget) {
          onTogglePlay(index);
        }
      }}
    >
      {/* YouTube Player - only load if in loadedVideos set */}
      {isLoaded ? (
        <div className="w-full h-full relative">
          <div
            id={`player-${index}`}
            className="w-full h-full pointer-events-none"
          />
          {/* Preloading indicator */}
          {isPreloaded && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white/80 text-xs flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Preloaded
            </div>
          )}
        </div>
      ) : (
        // Placeholder for unloaded videos
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-white/60 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <Play className="h-8 w-8" />
            </div>
            <p className="text-sm">Video will load when you scroll here</p>
          </div>
        </div>
      )}

      {/* Overlay controls and info */}
      <div className="absolute inset-0 pointer-events-none z-[100]">
        {/* Top gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
        
        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Video info - bottom left */}
        <div className="absolute bottom-24 left-4 right-20 pointer-events-auto">
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-lg leading-tight">
              {video.title}
            </h3>
            {video.description && (
              <p className="text-white/80 text-sm leading-relaxed">
                {video.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>{video.channelTitle}</span>
              {video.regionName && (
                <>
                  <span>•</span>
                  <span>{video.regionName}{video.city ? `, ${video.city}` : ''}</span>
                </>
              )}
              <span>•</span>
              <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action buttons - right side */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-6 pointer-events-auto z-[110]">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur-sm text-white hover:from-purple-600 hover:to-pink-600 relative z-[110] disabled:from-purple-400 disabled:to-pink-400 disabled:cursor-not-allowed pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAISearch(video);
            }}
            disabled={processingVideoId === video.databaseId}
            title={
              processingVideoId === video.databaseId
                ? "Analyzing video content..."
                : "AI Search - Find stores and products from this video"
            }
          >
            {processingVideoId === video.databaseId ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Sparkles className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 relative z-[110] pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCategoryMenuToggle();
            }}
            title="Browse categories"
          >
            <Grid3x3 className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 relative z-[110] pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLike(video.id);
            }}
          >
            <Heart className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 relative z-[110] pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onComment(video.id);
            }}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 relative z-[110] pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShare(video);
            }}
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>

        {/* Play/Pause button - center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-[105]">
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 opacity-0 hover:opacity-100 transition-opacity relative z-[105] pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTogglePlay(index);
            }}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Mute button - top right */}
        <div className="absolute top-4 right-4 pointer-events-auto z-[105]">
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-full backdrop-blur-sm text-white hover:bg-white/30 relative z-[105] pointer-events-auto ${
              userMutePreference
                ? 'bg-red-500/80 hover:bg-red-500/90' // Red background when user has chosen muted experience
                : 'bg-white/20'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleMute(index);
            }}
            title={userMutePreference ? "All videos muted by user preference" : "Toggle mute for this video"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
