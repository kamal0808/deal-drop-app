import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type Comment = Tables<'comments'> & {
  user_email?: string;
  user_name?: string;
  user_avatar?: string;
};

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments for the post
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;

      setLoading(true);
      try {
        // Get comments with user information using the view
        const { data, error } = await supabase
          .from('comment_with_user_info')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const commentsWithUserInfo = (data || []).map((comment) => ({
          ...comment,
          user_name: comment.user_name || 'Anonymous User',
          user_email: comment.user_email || '',
          user_avatar: comment.user_avatar || null,
        }));

        setComments(commentsWithUserInfo);
        setCommentCount(commentsWithUserInfo.length);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const addComment = async (content: string) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return false;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return false;
    }

    if (submitting) return false;

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new comment to the list with user info
      const newComment: Comment = {
        ...data,
        user_email: user.email,
        user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'You',
        user_avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      };

      setComments(prev => [...prev, newComment]);
      setCommentCount(prev => prev + 1);
      toast.success('Comment added!');
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentCount(prev => Math.max(0, prev - 1));
      toast.success('Comment deleted');
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      return false;
    }
  };

  return {
    comments,
    commentCount,
    loading,
    submitting,
    addComment,
    deleteComment,
  };
};
