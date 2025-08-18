import { useEffect } from 'react';
import { useFollowsContext } from '@/contexts/FollowsContext';

export const useFollows = (businessId: string) => {
  const { followStates, toggleFollow, loading, initializeFollowState } = useFollowsContext();

  // Initialize follow state when component mounts
  useEffect(() => {
    if (businessId) {
      initializeFollowState(businessId);
    }
  }, [businessId, initializeFollowState]);

  const currentState = followStates[businessId] || { isFollowing: false, followerCount: 0 };
  const isLoading = loading[businessId] || false;

  return {
    isFollowing: currentState.isFollowing,
    followerCount: currentState.followerCount,
    loading: isLoading,
    toggleFollow: () => toggleFollow(businessId),
  };
};
