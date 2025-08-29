import { useRef, useEffect, useState } from "react";
import type { FeedVideo } from "@/services/feedService";

interface UseScrollHandlerProps {
  videos: FeedVideo[];
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
  playersRef: React.MutableRefObject<Record<number, any>>;
  preloadedVideos: Set<number>;
  activatePreloadedVideo: (index: number) => void;
  userMutePreference: boolean;
  setMutedStates: (fn: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
  updatePlayingStates: (index: number) => void;
  setLoadedVideos: (fn: (prev: Set<number>) => Set<number>) => void;
}

export const useScrollHandler = ({
  videos,
  currentVideoIndex,
  setCurrentVideoIndex,
  playersRef,
  preloadedVideos,
  activatePreloadedVideo,
  userMutePreference,
  setMutedStates,
  updatePlayingStates,
  setLoadedVideos
}: UseScrollHandlerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTop = useRef<number>(0);
  const scrollDirection = useRef<'up' | 'down' | null>(null);
  const isScrolling = useRef<boolean>(false);

  // Predictively start the next video during scroll
  const startNextVideoPreemptively = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    console.log(`🎬 Preemptively starting video ${targetIndex}`);

    // Ensure the video is loaded immediately
    setLoadedVideos(prev => new Set([...prev, targetIndex]));

    // Try to start immediately if player exists, otherwise wait briefly
    const tryStartVideo = (attempt = 0) => {
      const player = playersRef.current[targetIndex];
      if (player && player.playVideo) {
        // If it was preloaded, activate it first
        if (preloadedVideos.has(targetIndex)) {
          activatePreloadedVideo(targetIndex);
        }

        // Start playing the video
        player.playVideo();

        // Apply mute preference immediately
        if (userMutePreference && player.mute) {
          player.mute();
        } else if (!userMutePreference && player.unMute) {
          player.unMute();
        }

        console.log(`🎬 Started video ${targetIndex} preemptively (attempt ${attempt + 1})`);
      } else if (attempt < 5) {
        // Retry up to 5 times with increasing delays
        setTimeout(() => tryStartVideo(attempt + 1), 50 * (attempt + 1));
      }
    };

    tryStartVideo();
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    // Detect scroll direction
    const currentScrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up';
    const scrollDelta = Math.abs(scrollTop - lastScrollTop.current);

    // Only process if there's significant scroll movement
    if (scrollDelta > 10) {
      scrollDirection.current = currentScrollDirection;
      isScrolling.current = true;

      // Calculate current video index based on scroll position
      const currentScrollVideoIndex = Math.round(scrollTop / containerHeight);

      // Predict next video based on scroll direction
      let predictedNextIndex = currentScrollVideoIndex;
      if (currentScrollDirection === 'down') {
        predictedNextIndex = currentScrollVideoIndex + 1;
      } else if (currentScrollDirection === 'up') {
        predictedNextIndex = currentScrollVideoIndex - 1;
      }

      // Start the predicted next video if we're scrolling significantly and it's different from current
      if (predictedNextIndex !== currentVideoIndex &&
          predictedNextIndex >= 0 &&
          predictedNextIndex < videos.length &&
          scrollDelta > containerHeight * 0.1) { // Only if scrolled more than 10% of screen height

        console.log(`🎬 Scroll detected: ${currentScrollDirection}, starting video ${predictedNextIndex} preemptively`);
        startNextVideoPreemptively(predictedNextIndex);
      }
    }

    lastScrollTop.current = scrollTop;

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

      isScrolling.current = false;

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

        // Ensure current video is playing (it might already be from preemptive start)
        const currentPlayer = playersRef.current[videoIndex];
        if (currentPlayer) {
          // If this was a preloaded video, make sure it's fully activated
          if (preloadedVideos.has(videoIndex)) {
            activatePreloadedVideo(videoIndex);
          }

          // Ensure it's playing
          if (currentPlayer.playVideo) {
            currentPlayer.playVideo();
          }

          // Apply mute preference
          if (!userMutePreference) {
            setTimeout(() => {
              if (currentPlayer.unMute) {
                currentPlayer.unMute();
                setMutedStates(prev => ({ ...prev, [videoIndex]: false }));
              }
            }, 200);
          } else {
            setTimeout(() => {
              if (currentPlayer.mute) {
                currentPlayer.mute();
                setMutedStates(prev => ({ ...prev, [videoIndex]: true }));
              }
            }, 100);
          }
        }

        // Update playing states
        updatePlayingStates(videoIndex);
      }
    }, 150); // Wait 150ms after scroll stops
  };

  // Add scroll start detection for even more predictive loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollStartTimeout: NodeJS.Timeout;

    const handleScrollStart = () => {
      clearTimeout(scrollStartTimeout);
      isScrolling.current = true;

      // Prepare next videos as soon as scroll starts
      const currentScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const currentIndex = Math.round(currentScrollTop / containerHeight);

      // Preload adjacent videos immediately when scroll starts
      [currentIndex - 1, currentIndex, currentIndex + 1].forEach(index => {
        if (index >= 0 && index < videos.length) {
          setLoadedVideos(prev => new Set([...prev, index]));
        }
      });
    };

    const handleScrollEnd = () => {
      scrollStartTimeout = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    container.addEventListener('touchstart', handleScrollStart, { passive: true });
    container.addEventListener('touchend', handleScrollEnd, { passive: true });
    container.addEventListener('scroll', handleScrollEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleScrollStart);
      container.removeEventListener('touchend', handleScrollEnd);
      container.removeEventListener('scroll', handleScrollEnd);
      clearTimeout(scrollStartTimeout);
    };
  }, [videos.length, setLoadedVideos]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    handleScroll,
    isScrolling: isScrolling.current
  };
};
