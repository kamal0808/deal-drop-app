import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trash2 } from "lucide-react";
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface CommentsProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Comments: React.FC<CommentsProps> = ({ postId, isOpen, onClose }) => {
  const { user } = useAuth();
  const { comments, loading, submitting, addComment, deleteComment } = useComments(postId);
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = async () => {
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Comments ({comments.length})</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-brand/10 flex items-center justify-center flex-shrink-0 relative">
                    {comment.user_avatar ? (
                      <>
                        <img
                          src={comment.user_avatar}
                          alt={comment.user_name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide the image and show the fallback
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </>
                    ) : (
                      <span className="text-xs font-medium text-brand">
                        {comment.user_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {comment.user_name || 'Unknown User'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {user?.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-4 flex gap-2 border-t pt-4">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={submitting}
            className="flex-1"
          />
          <Button 
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
            size="sm"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
