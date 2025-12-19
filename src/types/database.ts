export interface Database {
  public: {
    Tables: {
      map_locations: {
        Row: {
          id: string
          name: string
          description: string | null
          longitude: number
          latitude: number
          location_type: 'point' | 'area' | 'trajectory'
          visit_date: string | null
          icon_url: string | null
          icon_color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          longitude: number
          latitude: number
          location_type: 'point' | 'area' | 'trajectory'
          visit_date?: string | null
          icon_url?: string | null
          icon_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          longitude?: number
          latitude?: number
          location_type?: 'point' | 'area' | 'trajectory'
          visit_date?: string | null
          icon_url?: string | null
          icon_color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      map_areas: {
        Row: {
          id: string
          location_id: string
          area_type: 'polygon' | 'circle'
          coordinates: string
          radius: number | null
          fill_color: string
          stroke_color: string
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          area_type: 'polygon' | 'circle'
          coordinates: string
          radius?: number | null
          fill_color?: string
          stroke_color?: string
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          area_type?: 'polygon' | 'circle'
          coordinates?: string
          radius?: number | null
          fill_color?: string
          stroke_color?: string
          created_at?: string
        }
      }
      map_trajectories: {
        Row: {
          id: string
          location_id: string
          path_coordinates: string
          stroke_color: string
          stroke_weight: number
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          path_coordinates: string
          stroke_color?: string
          stroke_weight?: number
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          path_coordinates?: string
          stroke_color?: string
          stroke_weight?: number
          created_at?: string
        }
      }
      map_media: {
        Row: {
          id: string
          location_id: string
          media_type: 'image' | 'video'
          url: string
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          media_type: 'image' | 'video'
          url: string
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          media_type?: 'image' | 'video'
          url?: string
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      map_tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      map_location_tags: {
        Row: {
          id: string
          location_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      map_admin: {
        Row: {
          id: string
          username: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          created_at?: string
        }
      }
    }
  }
}