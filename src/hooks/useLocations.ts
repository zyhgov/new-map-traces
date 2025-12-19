import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { LocationWithDetails, Area, Trajectory, Media, Tag } from '../types'

export function useLocations() {
  const [locations, setLocations] = useState<LocationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: locationsData, error: locationsError } = await supabase
        .from('map_locations')
        .select('*')
        .order('visit_date', { ascending: false })

      if (locationsError) throw locationsError

      const { data: areasData } = await supabase.from('map_areas').select('*')
      const { data: trajectoriesData } = await supabase.from('map_trajectories').select('*')
      const { data: mediaData } = await supabase.from('map_media').select('*').order('position', { ascending: true })
      const { data: locationTagsData } = await supabase.from('map_location_tags').select('location_id, map_tags(*)')

      const locationsWithDetails: LocationWithDetails[] = ((locationsData as any[]) || []).map((location) => {
        const areas = ((areasData as Area[]) || []).filter((a) => a.location_id === location.id)
        const trajectories = ((trajectoriesData as Trajectory[]) || []).filter((t) => t.location_id === location.id)
        const media = ((mediaData as Media[]) || []).filter((m) => m.location_id === location.id)
        const tags = ((locationTagsData as any[]) || [])
          .filter((lt) => lt.location_id === location.id)
          .map((lt) => lt.map_tags as Tag)
          .filter((tag): tag is Tag => tag !== null)

        return {
          ...location,
          areas,
          trajectories,
          media,
          tags,
        } as LocationWithDetails
      })

      setLocations(locationsWithDetails)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const addLocation = async (data: {
    name: string
    description?: string | null
    longitude: number
    latitude: number
    location_type: string
    visit_date?: string | null
    icon_url?: string | null
    icon_color?: string | null
  }): Promise<string | null> => {
    try {
      const { data: result, error } = await supabase
        .from('map_locations')
        .insert([data] as any)
        .select('id')
        .single()

      if (error) throw error
      await fetchLocations()
      return (result as any)?.id || null
    } catch (err) {
      console.error('添加地点失败:', err)
      return null
    }
  }

  const updateLocation = async (id: string, data: {
    name?: string
    description?: string | null
    visit_date?: string | null
    icon_url?: string | null
    icon_color?: string | null
  }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('map_locations')
        .update(data as any)
        .eq('id', id)

      if (error) throw error
      await fetchLocations()
      return true
    } catch (err) {
      console.error('更新地点失败:', err)
      return false
    }
  }

  const deleteLocation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('map_locations')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchLocations()
      return true
    } catch (err) {
      console.error('删除地点失败:', err)
      return false
    }
  }

  const addArea = async (data: {
    location_id: string
    area_type: string
    coordinates: string
    radius?: number | null
    fill_color?: string
    stroke_color?: string
  }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('map_areas')
        .insert([data] as any)

      if (error) throw error
      await fetchLocations()
      return true
    } catch (err) {
      console.error('添加区域失败:', err)
      return false
    }
  }

  const addMedia = async (data: {
    location_id: string
    media_type: string
    url: string
    caption?: string | null
    position?: number
  }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('map_media')
        .insert([{ ...data, position: data.position || 0 }] as any)

      if (error) throw error
      await fetchLocations()
      return true
    } catch (err) {
      console.error('添加媒体失败:', err)
      return false
    }
  }

  const updateMedia = async (id: string, data: {
    caption?: string | null
    position?: number
    sort_order?: number
  }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('map_media')
        .update(data as any)
        .eq('id', id)

      if (error) throw error
      await fetchLocations()
      return true
    } catch (err) {
      console.error('更新媒体失败:', err)
      return false
    }
  }

  const deleteMedia = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('map_media')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchLocations()
      return true
    } catch (err) {
      console.error('删除媒体失败:', err)
      return false
    }
  }

  // 本地更新（不请求数据库，用于即时更新UI）
  const updateLocationLocal = (id: string, updater: (loc: LocationWithDetails) => LocationWithDetails) => {
    setLocations(prev => prev.map(loc => loc.id === id ? updater(loc) : loc))
  }

  const removeMediaLocal = (locationId: string, mediaId: string) => {
    setLocations(prev => prev.map(loc => {
      if (loc.id === locationId) {
        return {
          ...loc,
          media: loc.media?.filter(m => m.id !== mediaId) || []
        }
      }
      return loc
    }))
  }

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    addArea,
    addMedia,
    updateMedia,
    deleteMedia,
    updateLocationLocal,
    removeMediaLocal,
  }
}