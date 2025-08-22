// Feed service - handles video data with easy mapping for future Supabase integration

export interface FeedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  embedUrl: string;
  channelTitle: string;
  publishedAt: string;
  // Future Supabase fields can be added here:
  // businessId?: string;
  // categoryId?: string;
  // location?: string;
  // likes?: number;
  // comments?: number;
  // shares?: number;
}

// Mock data source - currently using YouTube shorts data
// This can be easily replaced with Supabase queries later
const YOUTUBE_SHORTS_DATA_PATH = '/youtube-shorts.json';

/**
 * Transforms YouTube API response to our FeedVideo format
 * This mapping makes it easy to switch to Supabase later
 */
function transformYouTubeToFeedVideo(youtubeItem: any): FeedVideo {
  return {
    id: youtubeItem.id.videoId,
    title: youtubeItem.snippet.title,
    description: youtubeItem.snippet.description || '',
    thumbnailUrl: youtubeItem.snippet.thumbnails.high?.url || youtubeItem.snippet.thumbnails.medium?.url || youtubeItem.snippet.thumbnails.default?.url,
    embedUrl: `https://www.youtube.com/embed/${youtubeItem.id.videoId}`,
    channelTitle: youtubeItem.snippet.channelTitle,
    publishedAt: youtubeItem.snippet.publishedAt,
  };
}

/**
 * Fetches feed videos from current data source (YouTube shorts)
 * TODO: Replace with Supabase query when ready
 * 
 * Future Supabase implementation would look like:
 * ```typescript
 * export async function getFeedVideos(): Promise<FeedVideo[]> {
 *   const { data, error } = await supabase
 *     .from('feed_videos')
 *     .select('*')
 *     .order('created_at', { ascending: false })
 *     .limit(50);
 *   
 *   if (error) throw error;
 *   return data || [];
 * }
 * ```
 */
export async function getFeedVideos(): Promise<FeedVideo[]> {
  try {
    const response = await fetch(YOUTUBE_SHORTS_DATA_PATH);
    if (!response.ok) {
      throw new Error('Failed to fetch video data');
    }
    
    const data = await response.json();
    
    // Transform YouTube API response to our FeedVideo format
    const videos: FeedVideo[] = data.items.map(transformYouTubeToFeedVideo);
    
    // Shuffle videos for variety (optional)
    return shuffleArray(videos);
  } catch (error) {
    console.error('Error fetching feed videos:', error);
    throw error;
  }
}

/**
 * Utility function to shuffle array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Future functions for Supabase integration:
 */

// export async function likeVideo(videoId: string, userId: string): Promise<void> {
//   const { error } = await supabase
//     .from('video_likes')
//     .insert({ video_id: videoId, user_id: userId });
//   
//   if (error) throw error;
// }

// export async function addComment(videoId: string, userId: string, comment: string): Promise<void> {
//   const { error } = await supabase
//     .from('video_comments')
//     .insert({ video_id: videoId, user_id: userId, comment });
//   
//   if (error) throw error;
// }

// export async function getVideoComments(videoId: string): Promise<Comment[]> {
//   const { data, error } = await supabase
//     .from('video_comments')
//     .select(`
//       *,
//       profiles:user_id (
//         display_name,
//         avatar_url
//       )
//     `)
//     .eq('video_id', videoId)
//     .order('created_at', { ascending: false });
//   
//   if (error) throw error;
//   return data || [];
// }

// export async function shareVideo(videoId: string, userId: string): Promise<void> {
//   const { error } = await supabase
//     .from('video_shares')
//     .insert({ video_id: videoId, user_id: userId });
//   
//   if (error) throw error;
// }
