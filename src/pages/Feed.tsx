import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import RegionSelector from "@/components/RegionSelector";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { getFeedVideos, type FeedVideo } from "@/services/feedService";

export default function Feed() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>({});
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set([0])); // Track which videos are loaded

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLIFrameElement | null>>({});
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useSEO({
    title: "Feed – LocalIt",
    description: "Discover trending videos from local businesses and creators.",
    canonical: window.location.origin + "/feed"
  });

  const loadVideos = async (regionId?: string | null) => {
    setLoading(true);
    try {
      const feedVideos = await getFeedVideos(regionId || undefined);
      setVideos(feedVideos);
      setCurrentVideoIndex(0); // Reset to first video
      setLoadedVideos(new Set([0])); // Only load first video initially

      // Initialize video states - only first video playing
      const initialPlayingStates: Record<number, boolean> = {};
      const initialMutedStates: Record<number, boolean> = {};
      feedVideos.forEach((_, index) => {
        initialPlayingStates[index] = index === 0; // Only first video plays
        initialMutedStates[index] = true; // Start muted (required for autoplay)
      });
      setPlayingStates(initialPlayingStates);
      setMutedStates(initialMutedStates);

      // Auto-unmute the first video after a short delay to comply with autoplay policy
      if (feedVideos.length > 0) {
        setTimeout(() => {
          setMutedStates(prev => ({ ...prev, 0: false }));
          const firstIframe = videoRefs.current[0];
          if (firstIframe && feedVideos[0]) {
            firstIframe.src = `${feedVideos[0].embedUrl}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${feedVideos[0].id}&start=0`;
          }
        }, 1000); // Unmute after 1 second
      }

      // Preload the second video for smooth scrolling
      if (feedVideos.length > 1) {
        setTimeout(() => {
          setLoadedVideos(prev => new Set([...prev, 1]));
        }, 2000); // Load second video after 2 seconds
      }
    } catch (error) {
      console.error('Error loading feed videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos(selectedRegionId);
  }, [selectedRegionId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    // Preload videos that are close to being viewed
    const scrollVideoIndex = Math.round(scrollTop / containerHeight);
    const nextVideoIndex = scrollVideoIndex + 1;
    const prevVideoIndex = scrollVideoIndex - 1;

    // Load current, next, and previous videos for smooth scrolling
    setLoadedVideos(prev => {
      const newLoaded = new Set(prev);
      if (scrollVideoIndex >= 0 && scrollVideoIndex < videos.length) {
        newLoaded.add(scrollVideoIndex);
      }
      if (nextVideoIndex >= 0 && nextVideoIndex < videos.length) {
        newLoaded.add(nextVideoIndex);
      }
      if (prevVideoIndex >= 0 && prevVideoIndex < videos.length) {
        newLoaded.add(prevVideoIndex);
      }
      return newLoaded;
    });

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a timeout to handle scroll end
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      // Calculate which video is currently in view
      const videoIndex = Math.round(scrollTop / containerHeight);

      if (videoIndex !== currentVideoIndex && videoIndex >= 0 && videoIndex < videos.length) {
        // Stop the previous video (preserve its mute state)
        const previousIframe = videoRefs.current[currentVideoIndex];
        if (previousIframe) {
          const previousVideo = videos[currentVideoIndex];
          const previousMuteParam = mutedStates[currentVideoIndex] ? '1' : '0';
          previousIframe.src = `${previousVideo.embedUrl}?autoplay=0&mute=${previousMuteParam}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
        }

        setCurrentVideoIndex(videoIndex);

        // Load current video and next video (for smooth scrolling)
        setLoadedVideos(prev => {
          const newLoaded = new Set(prev);
          newLoaded.add(videoIndex); // Current video
          if (videoIndex + 1 < videos.length) {
            newLoaded.add(videoIndex + 1); // Next video
          }
          return newLoaded;
        });

        // Start the current video (unmuted for better UX)
        const currentIframe = videoRefs.current[videoIndex];
        if (currentIframe) {
          const video = videos[videoIndex];
          // Start muted first (for autoplay compliance), then unmute after a short delay
          currentIframe.src = `${video.embedUrl}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${video.id}&start=0`;

          // Auto-unmute after a short delay
          setTimeout(() => {
            setMutedStates(prev => ({ ...prev, [videoIndex]: false }));
            currentIframe.src = `${video.embedUrl}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${video.id}&start=0`;
          }, 500);
        }

        // Update playing states
        setPlayingStates(prev => {
          const newStates = { ...prev };
          // Stop all videos except the current one
          Object.keys(newStates).forEach(key => {
            const index = parseInt(key);
            newStates[index] = index === videoIndex;
          });
          return newStates;
        });
      }
    }, 150); // Wait 150ms after scroll stops
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

  const handleRegionChange = (regionId: string | null) => {
    setSelectedRegionId(regionId);
    // Reset scroll position to top when changing regions
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center bg-black relative">
        {/* Region Selector - Top Left (even during loading) */}
        <div className="absolute top-4 left-4 z-10">
          <RegionSelector
            selectedRegionId={selectedRegionId}
            onRegionChange={handleRegionChange}
          />
        </div>

        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading videos...</p>
        </div>
      </main>
    );
  }

  if (videos.length === 0) {
    return (
      <main className="h-screen flex items-center justify-center bg-black relative">
        {/* Region Selector - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <RegionSelector
            selectedRegionId={selectedRegionId}
            onRegionChange={handleRegionChange}
          />
        </div>

        <div className="text-white text-center">
          <p className="text-lg mb-2">No videos found</p>
          <p className="text-white/60">
            {selectedRegionId
              ? 'Try selecting a different region or "All Regions"'
              : 'No videos available at the moment'
            }
          </p>
        </div>
        <BottomNav active="feed" />
      </main>
    );
  }

  return (
    <main className="h-screen bg-black relative overflow-hidden">
      {/* Region Selector - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <RegionSelector
          selectedRegionId={selectedRegionId}
          onRegionChange={handleRegionChange}
        />
      </div>

      {/* Video container with snap scrolling */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth'
        }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="h-screen w-full snap-start relative flex items-center justify-center"
          >
            {/* YouTube embed - only load if in loadedVideos set */}
            {loadedVideos.has(index) ? (
              <iframe
                ref={(el) => { videoRefs.current[index] = el; }}
                src={`${video.embedUrl}?autoplay=${index === 0 ? '1' : '0'}&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${video.id}&enablejsapi=1`}
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
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



      <BottomNav active="feed" />
    </main>
  );
}
