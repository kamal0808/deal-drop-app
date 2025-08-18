import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FollowState {
  isFollowing: boolean;
  followerCount: number;
}

interface FollowsContextType {
  followStates: Record<string, FollowState>;
  toggleFollow: (businessId: string) => Promise<void>;
  loading: Record<string, boolean>;
  initializeFollowState: (businessId: string) => void;
}

const FollowsContext = createContext<FollowsContextType | undefined>(undefined);

export const useFollowsContext = () => {
  const context = useContext(FollowsContext);
  if (context === undefined) {
    throw new Error('useFollowsContext must be used within a FollowsProvider');
  }
  return context;
};

interface FollowsProviderProps {
  children: React.ReactNode;
}

export const FollowsProvider: React.FC<FollowsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [followStates, setFollowStates] = useState<Record<string, FollowState>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const initializeFollowState = async (businessId: string) => {
    if (followStates[businessId] || loading[businessId]) return;

    setLoading(prev => ({ ...prev, [businessId]: true }));

    try {
      // Get follower count
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);

      let isFollowing = false;

      // Check if current user is following this business
      if (user) {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('business_id', businessId)
          .eq('user_id', user.id)
          .single();

        isFollowing = !!data;
      }

      setFollowStates(prev => ({
        ...prev,
        [businessId]: {
          isFollowing,
          followerCount: count || 0,
        }
      }));
    } catch (error) {
      console.error('Error initializing follow state:', error);
    } finally {
      setLoading(prev => ({ ...prev, [businessId]: false }));
    }
  };

  const toggleFollow = async (businessId: string) => {
    if (!user) {
      toast.error('Please sign in to follow businesses');
      return;
    }

    if (loading[businessId]) return;

    setLoading(prev => ({ ...prev, [businessId]: true }));

    const currentState = followStates[businessId];
    if (!currentState) {
      setLoading(prev => ({ ...prev, [businessId]: false }));
      return;
    }

    try {
      if (currentState.isFollowing) {
        // Unfollow the business
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('business_id', businessId)
          .eq('user_id', user.id);

        if (error) throw error;

        setFollowStates(prev => ({
          ...prev,
          [businessId]: {
            isFollowing: false,
            followerCount: Math.max(0, currentState.followerCount - 1),
          }
        }));

        toast.success('Unfollowed successfully');
      } else {
        // Follow the business
        const { error } = await supabase
          .from('follows')
          .insert({
            business_id: businessId,
            user_id: user.id,
          });

        if (error) throw error;

        setFollowStates(prev => ({
          ...prev,
          [businessId]: {
            isFollowing: true,
            followerCount: currentState.followerCount + 1,
          }
        }));

        toast.success('Following successfully');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(prev => ({ ...prev, [businessId]: false }));
    }
  };

  // Reset follow states when user changes
  useEffect(() => {
    if (!user) {
      setFollowStates({});
      setLoading({});
    }
  }, [user]);

  return (
    <FollowsContext.Provider
      value={{
        followStates,
        toggleFollow,
        loading,
        initializeFollowState,
      }}
    >
      {children}
    </FollowsContext.Provider>
  );
};
