import { useRef, useEffect } from "react";
import type { FeedVideo } from "@/services/feedService";

interface UseVideoPlayersProps {
  youTubeAPIReady: boolean;
  videos: FeedVideo[];
  loadedVideos: Set<number>;
  currentVideoIndex: number;
  userMutePreference: boolean;
  setMutedStates: (fn: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
  setPlayingStates: (fn: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
  setPreloadedVideos: (fn: (prev: Set<number>) => Set<number>) => void;
}

export const useVideoPlayers = ({
  youTubeAPIReady,
  videos,
  loadedVideos,
  currentVideoIndex,
  userMutePreference,
  setMutedStates,
  setPlayingStates,
  setPreloadedVideos
}: UseVideoPlayersProps) => {
  const playersRef = useRef<Record<number, any>>({});
  const preloadedVideos = useRef<Set<number>>(new Set());

  // Create YouTube player with preloading support
  const createPlayer = (index: number, videoId: string, isPreload: boolean = false) => {
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
          autoplay: isPreload ? 0 : (index === 0 ? 1 : 0), // Don't autoplay preloaded videos
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
            console.log(`🎬 Player ${index} ready ${isPreload ? '(preloaded)' : ''}`);

            if (isPreload) {
              // For preloaded videos, pause immediately and mark as preloaded
              event.target.pauseVideo();
              preloadedVideos.current.add(index);
              setPreloadedVideos(prev => new Set([...prev, index]));
            } else if (index === 0) {
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

  // Convert preloaded video to active video
  const activatePreloadedVideo = (index: number) => {
    const player = playersRef.current[index];
    if (player && preloadedVideos.current.has(index)) {
      try {
        // Seek to beginning and mark as no longer preloaded
        player.seekTo(0);
        preloadedVideos.current.delete(index);
        setPreloadedVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
        console.log(`🎬 Activated preloaded video ${index}`);
      } catch (error) {
        console.error(`Error activating preloaded video ${index}:`, error);
      }
    }
  };

  // Create players when API is ready and videos are loaded
  useEffect(() => {
    if (youTubeAPIReady && videos.length > 0) {
      loadedVideos.forEach(index => {
        if (index < videos.length && !playersRef.current[index]) {
          // Determine if this is a preload (not the current video or immediately adjacent)
          const isPreload = Math.abs(index - currentVideoIndex) > 1;
          setTimeout(() => createPlayer(index, videos[index].id, isPreload), 50 * index);
        }
      });
    }
  }, [youTubeAPIReady, videos, loadedVideos, currentVideoIndex]);

  // Cleanup players on unmount
  useEffect(() => {
    return () => {
      Object.values(playersRef.current).forEach(player => {
        if (player && player.destroy) {
          player.destroy();
        }
      });
    };
  }, []);

  const clearPlayers = () => {
    Object.values(playersRef.current).forEach(player => {
      if (player && player.destroy) {
        player.destroy();
      }
    });
    playersRef.current = {};
    preloadedVideos.current.clear();
  };

  return {
    playersRef,
    preloadedVideos: preloadedVideos.current,
    activatePreloadedVideo,
    clearPlayers
  };
};
