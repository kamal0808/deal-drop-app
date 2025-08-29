import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { FeedVideo } from "@/services/feedService";

export const useVideoActions = () => {
  const navigate = useNavigate();

  const handleLike = (videoId: string) => {
    toast.success('Liked!');
    // TODO: Implement like functionality with Supabase
  };

  const handleComment = (videoId: string) => {
    toast.info('Comments coming soon!');
    // TODO: Implement comments functionality
  };

  const handleShare = (video: FeedVideo) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: video.embedUrl,
      });
    } else {
      navigator.clipboard.writeText(video.embedUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAISearch = async (
    video: FeedVideo,
    processingVideoId: string | null,
    setProcessingVideoId: (id: string | null) => void,
    setVideos: (fn: (prev: FeedVideo[]) => FeedVideo[]) => void
  ) => {
    let videoSummary = video.summary;

    // Check if video has no summary or summary generation failed
    if (!videoSummary || video.summaryStatus === 'failed' || video.summaryStatus === 'pending') {
      if (!video.databaseId) {
        toast.error('Unable to analyze video - missing video data');
        return;
      }

      try {
        // Set processing state
        setProcessingVideoId(video.databaseId);

        // Show loading toast
        const loadingToast = toast.loading('Analyzing video content...', {
          description: 'This may take a few moments'
        });

        // Call the summarize-video edge function
        const { data, error } = await supabase.functions.invoke('summarize-video', {
          body: { videoId: video.databaseId }
        });

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        if (error) {
          console.error('Error generating video summary:', error);
          toast.error('Failed to analyze video content');
          return;
        }

        if (data && data.summary) {
          videoSummary = data.summary;

          // Update the video in the local state to reflect the new summary
          setVideos(prevVideos =>
            prevVideos.map(v =>
              v.databaseId === video.databaseId
                ? { ...v, summary: data.summary, summaryStatus: 'completed' }
                : v
            )
          );

          toast.success('Video analyzed successfully!');
        } else {
          toast.warning('Video analysis completed but no summary available');
        }

      } catch (error) {
        console.error('Error calling summarize-video function:', error);
        toast.error('Failed to analyze video content');
        return;
      } finally {
        // Clear processing state
        setProcessingVideoId(null);
      }
    }

    // Navigate to AI page with video context (including the summary)
    console.log('🎬 Navigating to AI with video context:', {
      id: video.databaseId,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      summary: videoSummary
    });

    navigate('/ai', {
      state: {
        videoContext: {
          id: video.databaseId,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          summary: videoSummary
        }
      }
    });
  };

  return {
    handleLike,
    handleComment,
    handleShare,
    handleAISearch
  };
};
