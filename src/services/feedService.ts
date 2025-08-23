// Feed service - handles video data with Supabase integration
import { supabase } from '@/integrations/supabase/client';

export interface FeedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  embedUrl: string;
  channelTitle: string;
  publishedAt: string;
  // Supabase fields:
  regionName?: string;
  city?: string;
  searchQuery?: string;
  // Future fields:
  // likes?: number;
  // comments?: number;
  // shares?: number;
}

// Mock data source - currently using YouTube shorts data
// This can be easily replaced with Supabase queries later
const YOUTUBE_SHORTS_DATA_PATH = '/youtube-shorts.json';

/**
 * Transforms Supabase videos data to our FeedVideo format
 */
function transformSupabaseToFeedVideo(supabaseVideo: any): FeedVideo {
  return {
    id: supabaseVideo.video_id,
    title: supabaseVideo.title,
    description: supabaseVideo.description || '',
    thumbnailUrl: supabaseVideo.thumbnail_url || '',
    embedUrl: `https://www.youtube.com/embed/${supabaseVideo.video_id}`,
    channelTitle: supabaseVideo.channel_title || '',
    publishedAt: supabaseVideo.published_at || supabaseVideo.created_at,
    regionName: supabaseVideo.region_name,
    city: supabaseVideo.city,
    searchQuery: supabaseVideo.search_query,
  };
}

/**
 * Transforms YouTube API response to our FeedVideo format
 * Used as fallback when Supabase is unavailable
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
 * Fetches feed videos from Supabase videos table
 */
export async function getFeedVideos(regionId?: string): Promise<FeedVideo[]> {
  try {
    let query = supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Filter by region if specified
    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform Supabase data to FeedVideo format
    const videos: FeedVideo[] = (data || []).map(transformSupabaseToFeedVideo);

    // Shuffle videos for variety (optional)
    return shuffleArray(videos);
  } catch (error) {
    console.error('Error fetching feed videos:', error);

    // Fallback to mock data if Supabase fails
    try {
      const response = await fetch(YOUTUBE_SHORTS_DATA_PATH);
      if (!response.ok) {
        throw new Error('Failed to fetch fallback video data');
      }

      const data = await response.json();
      const videos: FeedVideo[] = data.items.map(transformYouTubeToFeedVideo);
      return shuffleArray(videos);
    } catch (fallbackError) {
      console.error('Error fetching fallback videos:', fallbackError);
      throw error; // Throw original error
    }
  }
}

/**
 * Fetches all regions from Supabase
 */
export async function getRegions(): Promise<Array<{
  id: string;
  name: string;
  city: string | null;
}>> {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name, city')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
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
