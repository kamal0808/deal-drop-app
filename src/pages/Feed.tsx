import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import RegionSelector from "@/components/RegionSelector";
import VerticalCategoryMenu from "@/components/VerticalCategoryMenu";
import VideoItem from "@/components/VideoItem";
import ScratchCard from "@/components/ScratchCard";
import { getRandomCoupon } from "@/data/mockCoupons";

// Custom hooks
import { useYouTubeAPI } from "@/hooks/useYouTubeAPI";
import { useVideoState } from "@/hooks/useVideoState";
import { useVideoPlayers } from "@/hooks/useVideoPlayers";
import { useScrollHandler } from "@/hooks/useScrollHandler";
import { useFeedData } from "@/hooks/useFeedData";
import { useVideoActions } from "@/utils/videoActions";

export default function Feed() {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [processingVideoId, setProcessingVideoId] = useState<string | null>(null);

  // Custom hooks
  const { youTubeAPIReady } = useYouTubeAPI();

  const {
    videos,
    setVideos,
    loading,
    currentVideoIndex,
    setCurrentVideoIndex,
    loadedVideos,
    setLoadedVideos,
    setPreloadedVideos,
    selectedRegionId,
    selectedCategoryId,
    handleRegionChange,
    handleCategorySelect,
    getTotalItems,
    isScratchCardIndex,
    getVideoIndexFromTotal
  } = useFeedData();

  const {
    playingStates,
    mutedStates,
    userMutePreference,
    setMutedStates,
    togglePlay,
    toggleMute,
    updatePlayingStates
  } = useVideoState();

  const {
    playersRef,
    preloadedVideos: preloadedVideosSet,
    activatePreloadedVideo
  } = useVideoPlayers({
    youTubeAPIReady,
    videos,
    loadedVideos,
    currentVideoIndex,
    userMutePreference,
    setMutedStates,
    setPlayingStates: () => {}, // Will be handled by useVideoState
    setPreloadedVideos
  });

  const { containerRef, handleScroll } = useScrollHandler({
    videos,
    currentVideoIndex,
    setCurrentVideoIndex,
    playersRef,
    preloadedVideos: preloadedVideosSet,
    activatePreloadedVideo,
    userMutePreference,
    setMutedStates,
    updatePlayingStates,
    setLoadedVideos
  });

  const { handleLike, handleComment, handleShare, handleAISearch } = useVideoActions();

  useSEO({
    title: "Feed – LocalIt",
    description: "Discover trending videos from local businesses and creators.",
    canonical: window.location.origin + "/feed"
  });

  // Handle category menu toggle
  const handleCategoryMenuToggle = () => {
    setShowCategoryMenu(!showCategoryMenu);
  };

  // Handle region change with scroll reset
  const handleRegionChangeWithReset = (regionId: string | null) => {
    handleRegionChange(regionId);
    // Reset scroll position to top when changing regions
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center bg-black relative">
        {/* Region Selector - Top Left (even during loading) */}
        <div className="absolute top-4 left-4 z-[160]">
          <RegionSelector
            selectedRegionId={selectedRegionId}
            onRegionChange={handleRegionChangeWithReset}
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
            onRegionChange={handleRegionChangeWithReset}
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
          onRegionChange={handleRegionChangeWithReset}
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
        {videos.map((video, index) => {
          const items = [];

          // Add the video item
          items.push(
            <VideoItem
              key={video.id}
              video={video}
              index={index}
              isLoaded={loadedVideos.has(index)}
              isPreloaded={preloadedVideosSet.has(index)}
              isPlaying={playingStates[index] || false}
              isMuted={mutedStates[index] || true}
              userMutePreference={userMutePreference}
              processingVideoId={processingVideoId}
              onTogglePlay={(idx) => togglePlay(idx, playersRef)}
              onToggleMute={(idx) => toggleMute(idx, playersRef)}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onAISearch={(video) => handleAISearch(video, processingVideoId, setProcessingVideoId, setVideos)}
              onCategoryMenuToggle={handleCategoryMenuToggle}
            />
          );

          // Add scratch card after every 5th video (index 4, 9, 14, etc.)
          if ((index + 1) % 5 === 0 && index < videos.length - 1) {
            const coupon = getRandomCoupon();
            items.push(
              <ScratchCard
                key={`scratch-${index}`}
                coupon={coupon}
                onScratchComplete={() => {
                  console.log('Scratch card completed!');
                }}
              />
            );
          }

          return items;
        })}
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
