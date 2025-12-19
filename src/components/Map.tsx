import { useEffect, useRef, useCallback, useState } from 'react'
import type { LocationWithDetails } from '../types'
import { useTheme } from '../contexts/ThemeContext'

interface MapProps {
  locations: LocationWithDetails[]
  selectedLocation: LocationWithDetails | null
  onLocationSelect: (location: LocationWithDetails) => void
  isEditing: boolean
  editMode: 'none' | 'point' | 'polygon' | 'circle'
  onMapClick?: (lng: number, lat: number) => void
  onPolygonComplete?: (path: [number, number][]) => void
  onCircleComplete?: (center: [number, number], radius: number) => void
}

type MapOverlay = AMap.Marker | AMap.Polyline | AMap.Polygon | AMap.Circle

export default function Map({
  locations,
  selectedLocation,
  onLocationSelect,
  isEditing,
  editMode,
  onMapClick,
  onPolygonComplete,
  onCircleComplete,
}: MapProps) {
  const { actualTheme } = useTheme()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<AMap.Map | null>(null)
  const overlaysRef = useRef<MapOverlay[]>([])
  const mouseToolRef = useRef<AMap.MouseTool | null>(null)
  const [tempOverlay, setTempOverlay] = useState<AMap.Polygon | AMap.Circle | null>(null)

  // 根据主题获取地图样式
  const getMapStyle = useCallback(() => {
    if (actualTheme === 'dark') {
      return 'amap://styles/dark'
    } else {
      return 'amap://styles/fresh'
    }
  }, [actualTheme])

  // 创建标记图标
  const createMarkerIcon = useCallback((location: LocationWithDetails, size: number = 28) => {
    if (location.icon_url) {
      return new AMap.Icon({
        size: new AMap.Size(size, size),
        image: location.icon_url,
        imageSize: new AMap.Size(size, size),
      })
    }

    const color = location.icon_color || '#1d1d1f'
    const svgIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg viewBox="0 0 24 24" width="24" height="24" fill="${color}">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`

    return new AMap.Icon({
      size: new AMap.Size(size, size),
      image: svgIcon,
      imageSize: new AMap.Size(size, size),
    })
  }, [])

  // 初始化地图
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return

    mapInstance.current = new AMap.Map(mapContainer.current, {
      zoom: 5,
      center: [116.397428, 39.90923],
      mapStyle: getMapStyle(),
      viewMode: '2D',
    })

    mouseToolRef.current = new AMap.MouseTool(mapInstance.current)

    return () => {
      mouseToolRef.current?.close(true)
      mapInstance.current?.destroy()
      mapInstance.current = null
    }
  }, [])

  // 监听主题变化，更新地图样式
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setMapStyle(getMapStyle())
    }
  }, [actualTheme, getMapStyle])

  // 处理地图点击
  useEffect(() => {
    if (!mapInstance.current) return

    const handleClick = (e: { lnglat: { lng: number; lat: number } }) => {
      if (isEditing && editMode === 'point' && onMapClick) {
        onMapClick(e.lnglat.lng, e.lnglat.lat)
      }
    }

    mapInstance.current.on('click', handleClick)

    return () => {
      mapInstance.current?.off('click', handleClick)
    }
  }, [isEditing, editMode, onMapClick])

  // 处理绘制模式
  useEffect(() => {
    if (!mouseToolRef.current || !mapInstance.current) return

    if (tempOverlay) {
      mapInstance.current.remove(tempOverlay)
      setTempOverlay(null)
    }

    mouseToolRef.current.close(true)

    if (!isEditing) return

    if (editMode === 'polygon') {
      mouseToolRef.current.polygon({
        strokeColor: '#0071e3',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: 'rgba(0, 113, 227, 0.2)',
        fillOpacity: 0.3,
      })

      mouseToolRef.current.on('draw', (e: { obj: AMap.Polygon }) => {
        const polygon = e.obj
        const path = polygon.getPath().map((p: any) => [p.lng, p.lat] as [number, number])
        setTempOverlay(polygon)
        onPolygonComplete?.(path)
      })
    } else if (editMode === 'circle') {
      mouseToolRef.current.circle({
        strokeColor: '#0071e3',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: 'rgba(0, 113, 227, 0.2)',
        fillOpacity: 0.3,
      })

      mouseToolRef.current.on('draw', (e: { obj: AMap.Circle }) => {
        const circle = e.obj
        const center = circle.getCenter()
        const radius = circle.getRadius()
        setTempOverlay(circle)
        onCircleComplete?.([center.lng, center.lat], radius)
      })
    }

    return () => {
      mouseToolRef.current?.close(false)
    }
  }, [isEditing, editMode, onPolygonComplete, onCircleComplete])

  // 渲染覆盖物
  useEffect(() => {
    if (!mapInstance.current) return

    overlaysRef.current.forEach(overlay => {
      mapInstance.current?.remove(overlay)
    })
    overlaysRef.current = []

    locations.forEach(location => {
      const isSelected = selectedLocation?.id === location.id
      const markerSize = isSelected ? 36 : 28

      if (location.location_type === 'point') {
        const marker = new AMap.Marker({
          position: [location.longitude, location.latitude],
          title: location.name,
          anchor: 'bottom-center',
          icon: createMarkerIcon(location, markerSize),
        })

        marker.on('click', () => onLocationSelect(location))
        mapInstance.current?.add(marker)
        overlaysRef.current.push(marker)
      } else if (location.location_type === 'area' && location.areas?.[0]) {
        const area = location.areas[0]
        const coordinates = JSON.parse(area.coordinates) as [number, number][]

        if (area.area_type === 'polygon') {
          const polygon = new AMap.Polygon({
            path: coordinates,
            strokeColor: area.stroke_color || '#0071e3',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: area.fill_color || 'rgba(0, 113, 227, 0.2)',
            fillOpacity: 0.3,
          })

          polygon.on('click', () => onLocationSelect(location))
          mapInstance.current?.add(polygon)
          overlaysRef.current.push(polygon)

          // 中心点标记
          const centerMarker = new AMap.Marker({
            position: [location.longitude, location.latitude],
            title: location.name,
            anchor: 'bottom-center',
            icon: createMarkerIcon(location, markerSize),
          })

          centerMarker.on('click', () => onLocationSelect(location))
          mapInstance.current?.add(centerMarker)
          overlaysRef.current.push(centerMarker)
        } else if (area.area_type === 'circle') {
          const circle = new AMap.Circle({
            center: [location.longitude, location.latitude],
            radius: area.radius || 1000,
            strokeColor: area.stroke_color || '#0071e3',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: area.fill_color || 'rgba(0, 113, 227, 0.2)',
            fillOpacity: 0.3,
          })

          circle.on('click', () => onLocationSelect(location))
          mapInstance.current?.add(circle)
          overlaysRef.current.push(circle)

          // 中心点标记
          const centerMarker = new AMap.Marker({
            position: [location.longitude, location.latitude],
            title: location.name,
            anchor: 'bottom-center',
            icon: createMarkerIcon(location, markerSize),
          })

          centerMarker.on('click', () => onLocationSelect(location))
          mapInstance.current?.add(centerMarker)
          overlaysRef.current.push(centerMarker)
        }
      } else if (location.location_type === 'trajectory' && location.trajectories?.[0]) {
        const trajectory = location.trajectories[0]
        const path = JSON.parse(trajectory.path_coordinates) as [number, number][]

        const polyline = new AMap.Polyline({
          path,
          strokeColor: trajectory.stroke_color || '#0071e3',
          strokeWeight: trajectory.stroke_weight || 4,
          strokeOpacity: 0.8,
        })

        polyline.on('click', () => onLocationSelect(location))
        mapInstance.current?.add(polyline)
        overlaysRef.current.push(polyline)

        if (path.length > 0) {
          const startMarker = new AMap.Marker({
            position: path[0],
            title: `${location.name} - 起点`,
            anchor: 'bottom-center',
            icon: createMarkerIcon(location, 24),
          })

          startMarker.on('click', () => onLocationSelect(location))
          mapInstance.current?.add(startMarker)
          overlaysRef.current.push(startMarker)
        }
      }
    })
  }, [locations, selectedLocation, onLocationSelect, createMarkerIcon])

  // 选中位置时居中
  useEffect(() => {
    if (!mapInstance.current || !selectedLocation) return
    mapInstance.current.setCenter([selectedLocation.longitude, selectedLocation.latitude])
    mapInstance.current.setZoom(12)
  }, [selectedLocation])

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ minHeight: '100vh' }}
    />
  )
}