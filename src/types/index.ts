// 基础类型定义
export interface Location {
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

export interface Area {
  id: string
  location_id: string
  area_type: 'polygon' | 'circle'
  coordinates: string
  radius: number | null
  fill_color: string
  stroke_color: string
  created_at: string
}

export interface Trajectory {
  id: string
  location_id: string
  path_coordinates: string
  stroke_color: string
  stroke_weight: number
  created_at: string
}

export interface Media {
  id: string
  location_id: string
  media_type: 'image' | 'video'
  url: string
  caption: string | null
  sort_order: number
  position: number  // 在内容中的段落位置
  created_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Admin {
  id: string
  username: string
  password_hash: string
  created_at: string
}

// 完整地点数据
export interface LocationWithDetails extends Location {
  areas?: Area[]
  trajectories?: Trajectory[]
  media?: Media[]
  tags?: Tag[]
}

// 搜索过滤器类型
export interface SearchFilters {
  keyword: string
  locationType: 'all' | 'point' | 'area' | 'trajectory'
  dateFrom: string
  dateTo: string
}