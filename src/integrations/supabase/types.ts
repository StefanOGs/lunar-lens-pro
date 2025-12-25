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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dream_analysis: {
        Row: {
          approach: Database["public"]["Enums"]["dream_analysis_approach"]
          archetypes: Json | null
          confidence: number | null
          created_at: string
          dream_id: string
          id: string
          key_symbols: Json | null
          summary: string | null
          themes: Json | null
        }
        Insert: {
          approach?: Database["public"]["Enums"]["dream_analysis_approach"]
          archetypes?: Json | null
          confidence?: number | null
          created_at?: string
          dream_id: string
          id?: string
          key_symbols?: Json | null
          summary?: string | null
          themes?: Json | null
        }
        Update: {
          approach?: Database["public"]["Enums"]["dream_analysis_approach"]
          archetypes?: Json | null
          confidence?: number | null
          created_at?: string
          dream_id?: string
          id?: string
          key_symbols?: Json | null
          summary?: string | null
          themes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dream_analysis_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_symbols: {
        Row: {
          created_at: string
          id: string
          meaning_freud: string | null
          meaning_jung: string | null
          notes: string | null
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meaning_freud?: string | null
          meaning_jung?: string | null
          notes?: string | null
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meaning_freud?: string | null
          meaning_jung?: string | null
          notes?: string | null
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dream_tag_map: {
        Row: {
          dream_id: string
          tag_id: string
        }
        Insert: {
          dream_id: string
          tag_id: string
        }
        Update: {
          dream_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_tag_map_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_tag_map_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "dream_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      dreams: {
        Row: {
          body: string
          created_at: string
          dream_date: string
          id: string
          mood: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          dream_date?: string
          id?: string
          mood?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          dream_date?: string
          id?: string
          mood?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      one_time_purchases: {
        Row: {
          credits_remaining: number
          id: string
          product_type: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          credits_remaining?: number
          id?: string
          product_type: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          credits_remaining?: number
          id?: string
          product_type?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string
          birth_lat: number | null
          birth_lon: number | null
          birth_place: string | null
          birth_time: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          zodiac_sign: string
        }
        Insert: {
          birth_date: string
          birth_lat?: number | null
          birth_lon?: number | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          zodiac_sign: string
        }
        Update: {
          birth_date?: string
          birth_lat?: number | null
          birth_lon?: number | null
          birth_place?: string | null
          birth_time?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          zodiac_sign?: string
        }
        Relationships: []
      }
      saved_horoscopes: {
        Row: {
          content: string
          created_at: string
          horoscope_date: string
          horoscope_type: string
          id: string
          user_id: string
          zodiac_sign: string
        }
        Insert: {
          content: string
          created_at?: string
          horoscope_date: string
          horoscope_type: string
          id?: string
          user_id: string
          zodiac_sign: string
        }
        Update: {
          content?: string
          created_at?: string
          horoscope_date?: string
          horoscope_type?: string
          id?: string
          user_id?: string
          zodiac_sign?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          plan_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symbol_categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      symbol_insights: {
        Row: {
          created_at: string
          freud: string | null
          id: string
          jung: string | null
          pattern: Json | null
          symbol_log_id: string
        }
        Insert: {
          created_at?: string
          freud?: string | null
          id?: string
          jung?: string | null
          pattern?: Json | null
          symbol_log_id: string
        }
        Update: {
          created_at?: string
          freud?: string | null
          id?: string
          jung?: string | null
          pattern?: Json | null
          symbol_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symbol_insights_symbol_log_id_fkey"
            columns: ["symbol_log_id"]
            isOneToOne: false
            referencedRelation: "symbols_log"
            referencedColumns: ["id"]
          },
        ]
      }
      symbol_map: {
        Row: {
          category_id: string
          symbol_log_id: string
        }
        Insert: {
          category_id: string
          symbol_log_id: string
        }
        Update: {
          category_id?: string
          symbol_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "symbol_map_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "symbol_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symbol_map_symbol_log_id_fkey"
            columns: ["symbol_log_id"]
            isOneToOne: false
            referencedRelation: "symbols_log"
            referencedColumns: ["id"]
          },
        ]
      }
      symbols_log: {
        Row: {
          context: string | null
          created_at: string
          id: string
          intensity: number | null
          logged_at: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          intensity?: number | null
          logged_at?: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          intensity?: number | null
          logged_at?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      dream_analysis_approach: "jung" | "freud" | "mixed"
      subscription_plan: "FREE" | "BASIC" | "PREMIUM" | "LIFETIME"
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
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      dream_analysis_approach: ["jung", "freud", "mixed"],
      subscription_plan: ["FREE", "BASIC", "PREMIUM", "LIFETIME"],
    },
  },
} as const
