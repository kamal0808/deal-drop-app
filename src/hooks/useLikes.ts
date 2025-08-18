import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useLikes = (postId: string) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch initial like status and count
  useEffect(() => {
    const fetchLikeData = async () => {
      if (!postId) return;

      try {
        // Get like count
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        setLikeCount(count || 0);

        // Check if current user has liked this post
        if (user) {
          const { data } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

          setLiked(!!data);
        }
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };

    fetchLikeData();
  }, [postId, user]);

  const toggleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (liked) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;

        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  return {
    liked,
    likeCount,
    loading,
    toggleLike,
  };
};
