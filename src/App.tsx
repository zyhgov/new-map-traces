import { useState, useCallback } from 'react'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import AuthModal from './components/AuthModal'
import EditForm from './components/EditForm'
import EditToolbar from './components/EditToolbar'
import TarsLoader from './components/TarsLoader'
import { useLocations } from './hooks/useLocations'
import type { LocationWithDetails } from './types'

function App() {
  const {
    locations,
    loading,
    error,
    refetch,
    addLocation,
    updateLocation,
    deleteLocation,
    addArea,
    addMedia,
    updateMedia,
    deleteMedia,
    removeMediaLocal,
  } = useLocations()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDetails | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [editMode, setEditMode] = useState<'none' | 'point' | 'polygon' | 'circle'>('none')
  const [pendingLocation, setPendingLocation] = useState<Partial<LocationWithDetails> | null>(null)

  const handleLocationSelect = (location: LocationWithDetails | null) => {
    setSelectedLocation(location)
    setPendingLocation(null)
    if (location && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleOpenSettings = () => {
    if (isEditing) {
      setIsEditing(false)
      setEditMode('none')
      setPendingLocation(null)
    } else {
      setShowAuthModal(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setIsEditing(true)
    setEditMode('point')
  }

  const handleMapClick = useCallback((lng: number, lat: number) => {
    const newLocation: Partial<LocationWithDetails> = {
      name: '新地点',
      description: '',
      longitude: lng,
      latitude: lat,
      location_type: 'point',
      visit_date: new Date().toISOString().split('T')[0],
      icon_url: null,
      icon_color: '#1d1d1f',
    }
    setPendingLocation(newLocation)
    setSelectedLocation(null)
    setSidebarOpen(true)
  }, [])

  const handlePolygonComplete = useCallback((path: [number, number][]) => {
    const center = path.reduce(
      (acc, [lng, lat]) => [acc[0] + lng / path.length, acc[1] + lat / path.length],
      [0, 0]
    ) as [number, number]

    const newLocation: Partial<LocationWithDetails> = {
      name: '新区域',
      description: '',
      longitude: center[0],
      latitude: center[1],
      location_type: 'area',
      visit_date: new Date().toISOString().split('T')[0],
      icon_url: null,
      icon_color: '#1d1d1f',
      areas: [{
        id: '',
        location_id: '',
        area_type: 'polygon',
        coordinates: JSON.stringify(path),
        radius: null,
        fill_color: 'rgba(0, 113, 227, 0.2)',
        stroke_color: '#0071e3',
        created_at: '',
      }],
    }
    setPendingLocation(newLocation)
    setSelectedLocation(null)
    setSidebarOpen(true)
    setEditMode('none')
  }, [])

  const handleCircleComplete = useCallback((center: [number, number], radius: number) => {
    const newLocation: Partial<LocationWithDetails> = {
      name: '新区域',
      description: '',
      longitude: center[0],
      latitude: center[1],
      location_type: 'area',
      visit_date: new Date().toISOString().split('T')[0],
      icon_url: null,
      icon_color: '#1d1d1f',
      areas: [{
        id: '',
        location_id: '',
        area_type: 'circle',
        coordinates: JSON.stringify(center),
        radius: radius,
        fill_color: 'rgba(0, 113, 227, 0.2)',
        stroke_color: '#0071e3',
        created_at: '',
      }],
    }
    setPendingLocation(newLocation)
    setSelectedLocation(null)
    setSidebarOpen(true)
    setEditMode('none')
  }, [])

  const handleSaveLocation = async (data: {
    name: string
    description?: string | null
    longitude: number
    latitude: number
    location_type: string
    visit_date?: string | null
    icon_url?: string | null
    icon_color?: string | null
  }): Promise<string | null> => {
    const locationId = await addLocation(data)

    if (locationId && pendingLocation?.areas?.[0]) {
      await addArea({
        location_id: locationId,
        area_type: pendingLocation.areas[0].area_type,
        coordinates: pendingLocation.areas[0].coordinates,
        radius: pendingLocation.areas[0].radius,
        fill_color: pendingLocation.areas[0].fill_color,
        stroke_color: pendingLocation.areas[0].stroke_color,
      })
    }

    setPendingLocation(null)
    return locationId
  }

  const handleCloseForm = () => {
    setPendingLocation(null)
    setSelectedLocation(null)
  }

  // 加载状态
  if (loading) {
    return <TarsLoader text="正在加载数据..." />
  }

  // 错误状态
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div className="text-center p-8">
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>
            加载失败: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
            }}
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  // 获取当前选中的最新数据
  const currentSelectedLocation = selectedLocation
    ? locations.find(l => l.id === selectedLocation.id) || selectedLocation
    : null

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {isEditing && (
        <EditToolbar
          editMode={editMode}
          onModeChange={setEditMode}
          onExit={() => {
            setIsEditing(false)
            setEditMode('none')
            setPendingLocation(null)
          }}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        locations={locations}
        selectedLocation={currentSelectedLocation}
        onLocationSelect={handleLocationSelect}
        isEditing={isEditing}
        onOpenSettings={handleOpenSettings}
      >
        {(pendingLocation || (isEditing && currentSelectedLocation)) && (
          <EditForm
            location={pendingLocation || currentSelectedLocation}
            isNew={!!pendingLocation}
            onSave={handleSaveLocation}
            onUpdate={updateLocation}
            onDelete={deleteLocation}
            onAddMedia={addMedia}
            onUpdateMedia={updateMedia}
            onDeleteMedia={deleteMedia}
            onRemoveMediaLocal={removeMediaLocal}
            onClose={handleCloseForm}
            onRefresh={refetch}
          />
        )}
      </Sidebar>

      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarOpen ? '380px' : '0',
        }}
      >
        <Map
          locations={locations}
          selectedLocation={currentSelectedLocation}
          onLocationSelect={handleLocationSelect}
          isEditing={isEditing}
          editMode={editMode}
          onMapClick={handleMapClick}
          onPolygonComplete={handlePolygonComplete}
          onCircleComplete={handleCircleComplete}
        />
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}

export default App