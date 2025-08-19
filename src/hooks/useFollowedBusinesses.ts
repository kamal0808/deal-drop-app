import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;

export const useFollowedBusinesses = () => {
  const { user } = useAuth();
  const [followedBusinesses, setFollowedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFollowedBusinesses = async () => {
      if (!user) {
        setFollowedBusinesses([]);
        return;
      }

      setLoading(true);
      try {
        // Get businesses that the user is following
        const { data, error } = await supabase
          .from('follows')
          .select(`
            business_id,
            businesses (
              id,
              name,
              logo_url,
              description,
              created_at,
              updated_at,
              phone_number,
              google_maps_link,
              cover_photo_url,
              current_offer,
              whatsapp_number
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching followed businesses:', error);
          return;
        }

        // Extract the business data from the join
        const businesses = (data || [])
          .map(follow => follow.businesses)
          .filter(business => business !== null) as Business[];

        setFollowedBusinesses(businesses);
      } catch (error) {
        console.error('Error fetching followed businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedBusinesses();
  }, [user]);

  return {
    followedBusinesses,
    loading,
    count: followedBusinesses.length,
  };
};
