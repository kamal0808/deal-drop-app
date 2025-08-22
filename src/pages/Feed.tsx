import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Mock data service - easily replaceable with Supabase later
import { getFeedVideos, type FeedVideo } from "@/services/feedService";

export default function Feed() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLIFrameElement | null>>({});

  useSEO({
    title: "Feed – LocalIt",
    description: "Discover trending videos from local businesses and creators.",
    canonical: window.location.origin + "/feed"
  });

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const feedVideos = await getFeedVideos();
        setVideos(feedVideos);
        // Initialize all videos as playing and muted (required for autoplay)
        const initialPlayingStates: Record<number, boolean> = {};
        const initialMutedStates: Record<number, boolean> = {};
        feedVideos.forEach((_, index) => {
          initialPlayingStates[index] = true;
          initialMutedStates[index] = true; // YouTube requires muted for autoplay
        });
        setPlayingStates(initialPlayingStates);
        setMutedStates(initialMutedStates);
      } catch (error) {
        console.error('Error loading feed videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    // Calculate which video is currently in view
    const videoIndex = Math.round(scrollTop / containerHeight);

    if (videoIndex !== currentVideoIndex && videoIndex >= 0 && videoIndex < videos.length) {
      setCurrentVideoIndex(videoIndex);
      // Update the iframe src to restart autoplay for the current video
      const currentIframe = videoRefs.current[videoIndex];
      if (currentIframe) {
        const video = videos[videoIndex];
        const muteParam = mutedStates[videoIndex] ? '1' : '0';
        currentIframe.src = `${video.embedUrl}?autoplay=1&mute=${muteParam}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${video.id}&start=0`;
      }
    }
  };

  const togglePlay = (index: number) => {
    const newPlayingState = !playingStates[index];
    setPlayingStates(prev => ({
      ...prev,
      [index]: newPlayingState
    }));

    // Update iframe src to control playback
    const iframe = videoRefs.current[index];
    if (iframe) {
      const video = videos[index];
      const autoplayParam = newPlayingState ? '1' : '0';
      const muteParam = mutedStates[index] ? '1' : '0';
      iframe.src = `${video.embedUrl}?autoplay=${autoplayParam}&mute=${muteParam}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${video.id}`;
    }
  };

  const toggleMute = (index: number) => {
    const newMutedState = !mutedStates[index];
    setMutedStates(prev => ({
      ...prev,
      [index]: newMutedState
    }));

    // Update iframe src to control mute state
    const iframe = videoRefs.current[index];
    if (iframe) {
      const video = videos[index];
      const autoplayParam = playingStates[index] ? '1' : '0';
      const muteParam = newMutedState ? '1' : '0';
      iframe.src = `${video.embedUrl}?autoplay=${autoplayParam}&mute=${muteParam}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${video.id}`;
    }
  };

  const handleLike = (videoId: string) => {
    toast.success('Liked!');
    // TODO: Implement like functionality with Supabase
  };

  const handleComment = (videoId: string) => {
    toast.info('Comments coming soon!');
    // TODO: Implement comments functionality
  };

  const handleShare = (video: FeedVideo) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: video.embedUrl,
      });
    } else {
      navigator.clipboard.writeText(video.embedUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading videos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-black relative overflow-hidden">
      {/* Video container with snap scrolling */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="h-screen w-full snap-start relative flex items-center justify-center"
          >
            {/* YouTube embed */}
            <iframe
              ref={(el) => { videoRefs.current[index] = el; }}
              src={`${video.embedUrl}?autoplay=${index === 0 ? '1' : '0'}&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${video.id}&enablejsapi=1`}
              className="w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />

            {/* Overlay controls and info */}
            <div className="absolute inset-0 pointer-events-none">
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
              <div className="absolute bottom-24 right-4 flex flex-col gap-6 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                  onClick={() => handleLike(video.id)}
                >
                  <Heart className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                  onClick={() => handleComment(video.id)}
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                  onClick={() => handleShare(video)}
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>

              {/* Play/Pause button - center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => togglePlay(index)}
                >
                  {playingStates[index] ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>
              </div>

              {/* Mute button - top right */}
              <div className="absolute top-4 right-4 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                  onClick={() => toggleMute(index)}
                >
                  {mutedStates[index] ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4 flex gap-1">
        {videos.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-8 rounded-full transition-colors ${
              index === currentVideoIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      <BottomNav active="feed" />
    </main>
  );
}
