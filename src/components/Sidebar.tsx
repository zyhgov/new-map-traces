import { useState, useMemo } from 'react'
import { IoChevronBack, IoChevronForward, IoSearch, IoFilter, IoInformationCircle, IoMenu } from 'react-icons/io5'
import type { LocationWithDetails, SearchFilters } from '../types'
import LocationDetail from './LocationDetail'
import ThemeToggle from './ThemeToggle'
import AboutModal from './AboutModal'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  locations: LocationWithDetails[]
  selectedLocation: LocationWithDetails | null
  onLocationSelect: (location: LocationWithDetails | null) => void
  isEditing: boolean
  onOpenSettings: () => void
  children?: React.ReactNode
}

export default function Sidebar({
  isOpen,
  onToggle,
  locations,
  selectedLocation,
  onLocationSelect,
  isEditing,
  onOpenSettings,
  children,
}: SidebarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    locationType: 'all',
    dateFrom: '',
    dateTo: '',
  })

  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        const matchName = location.name.toLowerCase().includes(keyword)
        const matchDesc = location.description?.toLowerCase().includes(keyword)
        if (!matchName && !matchDesc) return false
      }

      if (filters.locationType !== 'all' && location.location_type !== filters.locationType) {
        return false
      }

      if (filters.dateFrom && location.visit_date) {
        if (new Date(location.visit_date) < new Date(filters.dateFrom)) return false
      }
      if (filters.dateTo && location.visit_date) {
        if (new Date(location.visit_date) > new Date(filters.dateTo)) return false
      }

      return true
    })
  }, [locations, filters])

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '未记录'
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'point': return '地点'
      case 'area': return '区域'
      case 'trajectory': return '轨迹'
      default: return type
    }
  }

  const clearFilters = () => {
    setFilters({ keyword: '', locationType: 'all', dateFrom: '', dateTo: '' })
  }

  const hasActiveFilters = filters.keyword || filters.locationType !== 'all' || filters.dateFrom || filters.dateTo

  return (
    <>
      {/* 侧边栏 */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50
          flex flex-col
          w-full sm:w-[360px] md:w-[380px]
          transition-transform duration-300 ease-out
          shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* 头部 */}
        <div 
          className="flex-shrink-0 p-4"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-9 h-9 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 
                className="text-lg font-bold truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                杖雍皓的行踪轨迹
              </h1>
              <p 
                className="text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {filteredLocations.length} / {locations.length} 个足迹 高德地图API支持
              </p>
            </div>
            {isEditing && (
              <span 
                className="px-2 py-1 text-xs font-semibold rounded-full"
                style={{ 
                  backgroundColor: 'rgba(0, 113, 227, 0.15)',
                  color: 'var(--color-accent)',
                }}
              >
                编辑中
              </span>
            )}
            <button
              onClick={onToggle}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
              <IoChevronBack size={20} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </div>

          {/* 搜索栏 */}
          {!children && !selectedLocation && (
            <div className="mt-4 space-y-3">
              <div className="relative">
                <IoSearch 
                  className="absolute left-3 top-1/2 -translate-y-1/2" 
                  size={18} 
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                  placeholder="搜索地点..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-primary)',
                    '--tw-ring-color': 'var(--color-accent)',
                  } as React.CSSProperties}
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: hasActiveFilters ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                >
                  <IoFilter size={18} />
                </button>
              </div>

              {showFilters && (
                <div 
                  className="p-3 rounded-xl space-y-3 animate-fadeIn"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      筛选条件
                    </span>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearFilters} 
                        className="text-xs"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        清除
                      </button>
                    )}
                  </div>

                  <select
                    value={filters.locationType}
                    onChange={(e) => setFilters(prev => ({ ...prev, locationType: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <option value="all">全部类型</option>
                    <option value="point">地点</option>
                    <option value="area">区域</option>
                    <option value="trajectory">轨迹</option>
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div 
          className="flex-1 overflow-y-auto sidebar-scroll"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          {children ? (
            <div style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: '100%' }}>
              {children}
            </div>
          ) : selectedLocation ? (
            <LocationDetail
              location={selectedLocation}
              onBack={() => onLocationSelect(null)}
              formatDate={formatDate}
              getTypeLabel={getTypeLabel}
            />
          ) : (
            <div className="p-3 space-y-2">
              {filteredLocations.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    没有找到匹配的地点
                  </p>
                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters} 
                      className="mt-2 text-sm"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      清除筛选条件
                    </button>
                  )}
                </div>
              ) : (
                filteredLocations.map(location => (
                  <div
                    key={location.id}
                    onClick={() => onLocationSelect(location)}
                    className="p-3 rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.98]"
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold truncate text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {location.name}
                        </h3>
                        {location.description && (
                          <p 
                            className="text-xs mt-0.5 line-clamp-2"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {location.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ 
                              backgroundColor: 'rgba(0, 113, 227, 0.1)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            {getTypeLabel(location.location_type)}
                          </span>
                          {location.visit_date && (
                            <span 
                              className="text-xs"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {formatDate(location.visit_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <IoChevronForward 
                        className="mt-0.5 flex-shrink-0" 
                        size={18} 
                        style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 底部区域 */}
        <div 
          className="flex-shrink-0 p-3 space-y-3"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* 主题切换 */}
          <ThemeToggle />

          {/* 按钮组 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all text-sm active:scale-[0.98]"
              style={{ 
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-border)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
              }}
            >
              <IoInformationCircle size={18} />
              <span>关于</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center py-2.5 rounded-xl font-medium transition-all text-sm active:scale-[0.98]"
              style={{ 
                backgroundColor: isEditing ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-bg-tertiary)',
                color: isEditing ? '#ef4444' : 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!isEditing) {
                  e.currentTarget.style.backgroundColor = 'var(--color-border)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isEditing) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                }
              }}
            >
              {isEditing ? '退出编辑' : '管理员'}
            </button>
          </div>
        </div>
      </div>

      {/* 桌面端切换按钮 */}
      <button
        onClick={onToggle}
        className="hidden sm:flex fixed top-1/2 -translate-y-1/2 z-50 w-5 h-12 items-center justify-center transition-all duration-300 ease-out rounded-r-lg shadow-md"
        style={{
          left: isOpen ? 'calc(360px)' : '0',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
        }}
      >
        {isOpen ? (
          <IoChevronBack size={14} style={{ color: 'var(--color-text-secondary)' }} />
        ) : (
          <IoChevronForward size={14} style={{ color: 'var(--color-text-secondary)' }} />
        )}
      </button>

      {/* 移动端菜单按钮 */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="sm:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <IoMenu size={22} style={{ color: 'var(--color-text-primary)' }} />
        </button>
      )}

      {/* 移动端遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden animate-fadeIn"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={onToggle}
        />
      )}

      {/* 关于弹窗 */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  )
}