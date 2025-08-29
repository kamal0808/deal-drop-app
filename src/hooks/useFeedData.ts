import { useState, useEffect } from "react";
import { getFeedVideos, type FeedVideo } from "@/services/feedService";
import { toast } from "sonner";

export const useFeedData = () => {
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set([0]));
  const [preloadedVideos, setPreloadedVideos] = useState<Set<number>>(new Set());
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Preload next videos for smooth scrolling
  const preloadNextVideos = (currentIndex: number, count: number = 5) => {
    const videosToPreload: number[] = [];
    for (let i = 1; i <= count; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < videos.length && !loadedVideos.has(nextIndex) && !preloadedVideos.has(nextIndex)) {
        videosToPreload.push(nextIndex);
      }
    }

    if (videosToPreload.length > 0) {
      console.log(`🎬 Preloading ${videosToPreload.length} videos ahead of index ${currentIndex}:`, videosToPreload);
    }

    // Preload videos with a small delay between each to avoid overwhelming the browser
    videosToPreload.forEach((index, i) => {
      setTimeout(() => {
        setLoadedVideos(prev => new Set([...prev, index]));
      }, i * 500); // 500ms delay between each preload
    });
  };

  const loadVideos = async (regionId?: string | null) => {
    setLoading(true);
    try {
      const feedVideos = await getFeedVideos(regionId || undefined);
      setVideos(feedVideos);
      setCurrentVideoIndex(0); // Reset to first video
      setLoadedVideos(new Set([0])); // Only load first video initially
      setPreloadedVideos(new Set()); // Reset preloaded videos

      // Start preloading next videos after first video is ready
      setTimeout(() => {
        preloadNextVideos(0, 5);
      }, 2000); // Wait 2 seconds for first video to load, then start preloading
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

  const handleRegionChange = (regionId: string | null) => {
    setSelectedRegionId(regionId);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // TODO: Filter videos by category
    console.log('Selected category:', categoryId);
  };

  return {
    videos,
    setVideos,
    loading,
    currentVideoIndex,
    setCurrentVideoIndex,
    loadedVideos,
    setLoadedVideos,
    preloadedVideos,
    setPreloadedVideos,
    selectedRegionId,
    selectedCategoryId,
    handleRegionChange,
    handleCategorySelect,
    preloadNextVideos
  };
};
