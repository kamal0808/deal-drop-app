import { useState } from "react";

export const useVideoState = () => {
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>({});
  const [userMutePreference, setUserMutePreference] = useState<boolean>(false);

  const togglePlay = (index: number, playersRef: React.MutableRefObject<Record<number, any>>) => {
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

  const toggleMute = (index: number, playersRef: React.MutableRefObject<Record<number, any>>) => {
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

  const initializeVideoStates = (videoCount: number) => {
    const initialPlayingStates: Record<number, boolean> = {};
    const initialMutedStates: Record<number, boolean> = {};
    
    for (let i = 0; i < videoCount; i++) {
      initialPlayingStates[i] = i === 0; // Only first video plays
      initialMutedStates[i] = true; // Start muted (required for autoplay)
    }
    
    setPlayingStates(initialPlayingStates);
    setMutedStates(initialMutedStates);
  };

  const updatePlayingStates = (currentVideoIndex: number) => {
    setPlayingStates(prev => {
      const newStates = { ...prev };
      // Stop all videos except the current one
      Object.keys(newStates).forEach(key => {
        const index = parseInt(key);
        newStates[index] = index === currentVideoIndex;
      });
      return newStates;
    });
  };

  return {
    playingStates,
    mutedStates,
    userMutePreference,
    setMutedStates,
    togglePlay,
    toggleMute,
    initializeVideoStates,
    updatePlayingStates
  };
};
