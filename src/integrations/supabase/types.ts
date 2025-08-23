export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          icon: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          business_id: string
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          offer: string | null
          photo_url: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          offer?: string | null
          photo_url: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          offer?: string | null
          photo_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          business_status: string | null
          cover_photo_url: string | null
          created_at: string | null
          curbside_pickup: boolean | null
          current_offer: string | null
          delivery: boolean | null
          description: string | null
          dine_in: boolean | null
          editorial_summary: string | null
          formatted_phone_number: string | null
          google_maps_link: string | null
          id: string
          international_phone_number: string | null
          logo_url: string | null
          name: string
          opening_hours: Json | null
          phone_number: string | null
          place_id: string | null
          plus_code: string | null
          price_level: number | null
          primary_type: string | null
          rating: number | null
          reservable: boolean | null
          serves_beer: boolean | null
          serves_breakfast: boolean | null
          serves_brunch: boolean | null
          serves_dinner: boolean | null
          serves_lunch: boolean | null
          serves_vegetarian_food: boolean | null
          serves_wine: boolean | null
          takeout: boolean | null
          types: string[] | null
          updated_at: string | null
          user_ratings_total: number | null
          utc_offset: number | null
          vicinity: string | null
          website: string | null
          wheelchair_accessible_entrance: boolean | null
          whatsapp_number: string | null
          latitude: number | null
          longitude: number | null
          accepts_credit_cards: boolean | null
          accepts_debit_cards: boolean | null
          accepts_cash_only: boolean | null
          accepts_nfc: boolean | null
          good_for_children: boolean | null
          good_for_groups: boolean | null
          serves_dessert: boolean | null
          wheelchair_accessible_parking: boolean | null
          directions_uri: string | null
          write_review_uri: string | null
          reviews_uri: string | null
          photos_uri: string | null
          time_zone: string | null
        }
        Insert: {
          business_status?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          curbside_pickup?: boolean | null
          current_offer?: string | null
          delivery?: boolean | null
          description?: string | null
          dine_in?: boolean | null
          editorial_summary?: string | null
          formatted_phone_number?: string | null
          google_maps_link?: string | null
          id?: string
          international_phone_number?: string | null
          logo_url?: string | null
          name: string
          opening_hours?: Json | null
          phone_number?: string | null
          place_id?: string | null
          plus_code?: string | null
          price_level?: number | null
          primary_type?: string | null
          rating?: number | null
          reservable?: boolean | null
          serves_beer?: boolean | null
          serves_breakfast?: boolean | null
          serves_brunch?: boolean | null
          serves_dinner?: boolean | null
          serves_lunch?: boolean | null
          serves_vegetarian_food?: boolean | null
          serves_wine?: boolean | null
          takeout?: boolean | null
          types?: string[] | null
          updated_at?: string | null
          user_ratings_total?: number | null
          utc_offset?: number | null
          vicinity?: string | null
          website?: string | null
          wheelchair_accessible_entrance?: boolean | null
          whatsapp_number?: string | null
          latitude?: number | null
          longitude?: number | null
          accepts_credit_cards?: boolean | null
          accepts_debit_cards?: boolean | null
          accepts_cash_only?: boolean | null
          accepts_nfc?: boolean | null
          good_for_children?: boolean | null
          good_for_groups?: boolean | null
          serves_dessert?: boolean | null
          wheelchair_accessible_parking?: boolean | null
          directions_uri?: string | null
          write_review_uri?: string | null
          reviews_uri?: string | null
          photos_uri?: string | null
          time_zone?: string | null
        }
        Update: {
          business_status?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          curbside_pickup?: boolean | null
          current_offer?: string | null
          delivery?: boolean | null
          description?: string | null
          dine_in?: boolean | null
          editorial_summary?: string | null
          formatted_phone_number?: string | null
          google_maps_link?: string | null
          id?: string
          international_phone_number?: string | null
          logo_url?: string | null
          name?: string
          opening_hours?: Json | null
          phone_number?: string | null
          place_id?: string | null
          plus_code?: string | null
          price_level?: number | null
          primary_type?: string | null
          rating?: number | null
          reservable?: boolean | null
          serves_beer?: boolean | null
          serves_breakfast?: boolean | null
          serves_brunch?: boolean | null
          serves_dinner?: boolean | null
          serves_lunch?: boolean | null
          serves_vegetarian_food?: boolean | null
          serves_wine?: boolean | null
          takeout?: boolean | null
          types?: string[] | null
          updated_at?: string | null
          user_ratings_total?: number | null
          utc_offset?: number | null
          vicinity?: string | null
          website?: string | null
          wheelchair_accessible_entrance?: boolean | null
          whatsapp_number?: string | null
          latitude?: number | null
          longitude?: number | null
          accepts_credit_cards?: boolean | null
          accepts_debit_cards?: boolean | null
          accepts_cash_only?: boolean | null
          accepts_nfc?: boolean | null
          good_for_children?: boolean | null
          good_for_groups?: boolean | null
          serves_dessert?: boolean | null
          wheelchair_accessible_parking?: boolean | null
          directions_uri?: string | null
          write_review_uri?: string | null
          reviews_uri?: string | null
          photos_uri?: string | null
          time_zone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      comment_with_user_info: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
          user_email: string | null
          user_name: string | null
          user_avatar: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          city: string | null
          created_at: string | null
          formatted_address: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          place_id: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          place_id?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          place_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          channel_title: string | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string
          published_at: string | null
          region_id: string | null
          region_name: string | null
          search_query: string | null
          summary: string | null
          summary_created_at: string | null
          summary_error: string | null
          summary_status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_id: string
        }
        Insert: {
          channel_title?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          published_at?: string | null
          region_id?: string | null
          region_name?: string | null
          search_query?: string | null
          summary?: string | null
          summary_created_at?: string | null
          summary_error?: string | null
          summary_status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_id: string
        }
        Update: {
          channel_title?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          published_at?: string | null
          region_id?: string | null
          region_name?: string | null
          search_query?: string | null
          summary?: string | null
          summary_created_at?: string | null
          summary_error?: string | null
          summary_status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_id?: string
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  DefaultSchemaCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends DefaultSchemaCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = DefaultSchemaCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : DefaultSchemaCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][DefaultSchemaCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
