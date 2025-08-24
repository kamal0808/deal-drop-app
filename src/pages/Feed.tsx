import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, Sparkles, Loader2, Grid3x3 } from "lucide-react";

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import RegionSelector from "@/components/RegionSelector";
import VerticalCategoryMenu from "@/components/VerticalCategoryMenu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { getFeedVideos, type FeedVideo } from "@/services/feedService";
import { supabase } from "@/integrations/supabase/client";

export default function Feed() {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>({});
  const [userMutePreference, setUserMutePreference] = useState<boolean>(false); // Track if user explicitly wants videos muted
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set([0])); // Track which videos are loaded
  const [processingVideoId, setProcessingVideoId] = useState<string | null>(null); // Track which video is being processed for AI
  const [youTubeAPIReady, setYouTubeAPIReady] = useState(false);
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<Record<number, any>>({});
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useSEO({
    title: "Feed – LocalIt",
    description: "Discover trending videos from local businesses and creators.",
    canonical: window.location.origin + "/feed"
  });

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('🎬 YouTube IFrame API Ready');
        setYouTubeAPIReady(true);
      };
    } else if (window.YT && window.YT.Player) {
      setYouTubeAPIReady(true);
    }
  }, []);

  // Create YouTube player
  const createPlayer = (index: number, videoId: string) => {
    if (!youTubeAPIReady || !window.YT || playersRef.current[index]) return;

    const playerId = `player-${index}`;
    const playerElement = document.getElementById(playerId);

    if (!playerElement) return;

    try {
      const player = new window.YT.Player(playerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: index === 0 ? 1 : 0,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: videoId,
          enablejsapi: 1,
          wmode: 'transparent'
        },
        events: {
          onReady: (event: any) => {
            console.log(`🎬 Player ${index} ready`);
            if (index === 0) {
              // Only auto-unmute first video if user hasn't explicitly chosen muted experience
              if (!userMutePreference) {
                setTimeout(() => {
                  event.target.unMute();
                  setMutedStates(prev => ({ ...prev, 0: false }));
                }, 1000);
              }
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            setPlayingStates(prev => ({
              ...prev,
              [index]: state === window.YT.PlayerState.PLAYING
            }));
          }
        }
      });

      playersRef.current[index] = player;
    } catch (error) {
      console.error(`Error creating player ${index}:`, error);
    }
  };

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

      // Clear existing players
      Object.values(playersRef.current).forEach(player => {
        if (player && player.destroy) {
          player.destroy();
        }
      });
      playersRef.current = {};

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

  // Create players when API is ready and videos are loaded
  useEffect(() => {
    if (youTubeAPIReady && videos.length > 0) {
      loadedVideos.forEach(index => {
        if (index < videos.length && !playersRef.current[index]) {
          setTimeout(() => createPlayer(index, videos[index].id), 100 * index);
        }
      });
    }
  }, [youTubeAPIReady, videos, loadedVideos]);

  // Cleanup timeout and players on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Cleanup YouTube players
      Object.values(playersRef.current).forEach(player => {
        if (player && player.destroy) {
          player.destroy();
        }
      });
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
        // Stop the previous video
        const previousPlayer = playersRef.current[currentVideoIndex];
        if (previousPlayer && previousPlayer.pauseVideo) {
          previousPlayer.pauseVideo();
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

        // Start the current video
        const currentPlayer = playersRef.current[videoIndex];
        if (currentPlayer && currentPlayer.playVideo) {
          currentPlayer.playVideo();

          // Only auto-unmute if user hasn't explicitly chosen to keep videos muted
          if (!userMutePreference) {
            setTimeout(() => {
              if (currentPlayer.unMute) {
                currentPlayer.unMute();
                setMutedStates(prev => ({ ...prev, [videoIndex]: false }));
              }
            }, 500);
          } else {
            // If user prefers muted, ensure this video is muted
            setTimeout(() => {
              if (currentPlayer.mute) {
                currentPlayer.mute();
                setMutedStates(prev => ({ ...prev, [videoIndex]: true }));
              }
            }, 100);
          }
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
    const player = playersRef.current[index];
    if (!player) return;

    const newPlayingState = !playingStates[index];
    setPlayingStates(prev => ({
      ...prev,
      [index]: newPlayingState
    }));

    if (newPlayingState) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  };

  const toggleMute = (index: number) => {
    const player = playersRef.current[index];
    if (!player) return;

    const newMutedState = !mutedStates[index];

    // Update individual video mute state
    setMutedStates(prev => ({
      ...prev,
      [index]: newMutedState
    }));

    // Update global user preference - if user mutes any video, they want muted experience
    // If user unmutes any video, they want unmuted experience
    setUserMutePreference(newMutedState);

    if (newMutedState) {
      player.mute();
    } else {
      player.unMute();
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

  const handleAISearch = async (video: FeedVideo) => {
    let videoSummary = video.summary;

    // Check if video has no summary or summary generation failed
    if (!videoSummary || video.summaryStatus === 'failed' || video.summaryStatus === 'pending') {
      if (!video.databaseId) {
        toast.error('Unable to analyze video - missing video data');
        return;
      }

      try {
        // Set processing state
        setProcessingVideoId(video.databaseId);

        // Show loading toast
        const loadingToast = toast.loading('Analyzing video content...', {
          description: 'This may take a few moments'
        });

        // Call the summarize-video edge function
        const { data, error } = await supabase.functions.invoke('summarize-video', {
          body: { videoId: video.databaseId }
        });

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        if (error) {
          console.error('Error generating video summary:', error);
          toast.error('Failed to analyze video content');
          return;
        }

        if (data && data.summary) {
          videoSummary = data.summary;

          // Update the video in the local state to reflect the new summary
          setVideos(prevVideos =>
            prevVideos.map(v =>
              v.databaseId === video.databaseId
                ? { ...v, summary: data.summary, summaryStatus: 'completed' }
                : v
            )
          );

          toast.success('Video analyzed successfully!');
        } else {
          toast.warning('Video analysis completed but no summary available');
        }

      } catch (error) {
        console.error('Error calling summarize-video function:', error);
        toast.error('Failed to analyze video content');
        return;
      } finally {
        // Clear processing state
        setProcessingVideoId(null);
      }
    }

    // Navigate to AI page with video context (including the summary)
    console.log('🎬 Navigating to AI with video context:', {
      id: video.databaseId,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      summary: videoSummary
    });

    navigate('/ai', {
      state: {
        videoContext: {
          id: video.databaseId,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          summary: videoSummary
        }
      }
    });
  };

  const handleRegionChange = (regionId: string | null) => {
    setSelectedRegionId(regionId);
    // Reset scroll position to top when changing regions
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setShowCategoryMenu(false); // Close menu after selection
    // TODO: Filter videos by category
    console.log('Selected category:', categoryId);
  };

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center bg-black relative">
        {/* Region Selector - Top Left (even during loading) */}
        <div className="absolute top-4 left-4 z-[160]">
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
        <div className="absolute top-4 left-4 z-[160]">
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
      <div className="absolute top-4 left-4 z-[160]">
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
            onClick={(e) => {
              // Only toggle play if clicking on the video area (not on overlay controls)
              if (e.target === e.currentTarget) {
                togglePlay(index);
              }
            }}
          >
            {/* YouTube Player - only load if in loadedVideos set */}
            {loadedVideos.has(index) ? (
              <div
                id={`player-${index}`}
                className="w-full h-full pointer-events-none"
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
                    handleAISearch(video);
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
                    setShowCategoryMenu(!showCategoryMenu);
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
                    handleLike(video.id);
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
                    handleComment(video.id);
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
                    handleShare(video);
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
                    togglePlay(index);
                  }}
                >
                  {playingStates[index] ? (
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
                    toggleMute(index);
                  }}
                  title={userMutePreference ? "All videos muted by user preference" : "Toggle mute for this video"}
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

      {/* Vertical Category Menu */}
      <VerticalCategoryMenu
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={handleCategorySelect}
        onClose={() => setShowCategoryMenu(false)}
        isOpen={showCategoryMenu}
      />

      <BottomNav active="feed" />
    </main>
  );
}
