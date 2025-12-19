import { useState, useMemo } from 'react'
import { IoClose, IoAdd, IoTrash, IoImage, IoVideocam, IoEye, IoArrowUp, IoArrowDown } from 'react-icons/io5'
import type { LocationWithDetails, Media } from '../types'
import LocationDetail from './LocationDetail'

interface EditFormProps {
  location: Partial<LocationWithDetails> | null
  isNew: boolean
  onSave: (data: {
    name: string
    description?: string | null
    longitude: number
    latitude: number
    location_type: string
    visit_date?: string | null
    icon_url?: string | null
    icon_color?: string | null
  }) => Promise<string | null>
  onUpdate: (id: string, data: {
    name?: string
    description?: string | null
    visit_date?: string | null
    icon_url?: string | null
    icon_color?: string | null
  }) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
  onAddMedia: (data: {
    location_id: string
    media_type: string
    url: string
    caption?: string | null
    position?: number
  }) => Promise<boolean>
  onUpdateMedia: (id: string, data: {
    caption?: string | null
    position?: number
  }) => Promise<boolean>
  onDeleteMedia: (id: string) => Promise<boolean>
  onRemoveMediaLocal: (locationId: string, mediaId: string) => void
  onClose: () => void
  onRefresh: () => Promise<void>
}

export default function EditForm({
  location,
  isNew,
  onSave,
  onUpdate,
  onDelete,
  onAddMedia,
  onUpdateMedia,
  onDeleteMedia,
  onRemoveMediaLocal,
  onClose,
  onRefresh,
}: EditFormProps) {
  const [name, setName] = useState(location?.name || '')
  const [description, setDescription] = useState(location?.description || '')
  const [visitDate, setVisitDate] = useState(location?.visit_date || new Date().toISOString().split('T')[0])
  const [iconUrl, setIconUrl] = useState(location?.icon_url || '')
  const [iconColor, setIconColor] = useState(location?.icon_color || '#1d1d1f')
  const [loading, setLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image')
  const [newMediaCaption, setNewMediaCaption] = useState('')
  const [newMediaPosition, setNewMediaPosition] = useState(0)
  const [showMediaForm, setShowMediaForm] = useState(false)

  // 本地媒体列表（用于即时更新）
  const [localMedia, setLocalMedia] = useState<Media[]>(location?.media || [])

  // 段落数量
  const paragraphCount = useMemo(() => {
    if (!description) return 0
    return description.split('\n').filter(p => p.trim()).length
  }, [description])

  // 预览用的location对象
  const previewLocation = useMemo((): LocationWithDetails => ({
    id: location?.id || 'preview',
    name: name || '新地点',
    description: description || null,
    longitude: location?.longitude || 0,
    latitude: location?.latitude || 0,
    location_type: location?.location_type || 'point',
    visit_date: visitDate || null,
    icon_url: iconUrl || null,
    icon_color: iconColor || null,
    created_at: location?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    areas: location?.areas || [],
    trajectories: location?.trajectories || [],
    media: localMedia,
    tags: location?.tags || [],
  }), [name, description, visitDate, iconUrl, iconColor, location, localMedia])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isNew) {
        await onSave({
          name,
          description: description || null,
          longitude: location?.longitude || 0,
          latitude: location?.latitude || 0,
          location_type: location?.location_type || 'point',
          visit_date: visitDate || null,
          icon_url: iconUrl || null,
          icon_color: iconColor || null,
        })
      } else if (location?.id) {
        await onUpdate(location.id, {
          name,
          description: description || null,
          visit_date: visitDate || null,
          icon_url: iconUrl || null,
          icon_color: iconColor || null,
        })
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!location?.id) return
    if (!confirm('确定要删除这个地点吗？')) return

    setLoading(true)
    await onDelete(location.id)
    setLoading(false)
    onClose()
  }

  const handleAddMedia = async () => {
    if (!location?.id || !newMediaUrl) return

    setLoading(true)
    const success = await onAddMedia({
      location_id: location.id,
      media_type: newMediaType,
      url: newMediaUrl,
      caption: newMediaCaption || null,
      position: newMediaPosition,
    })

    if (success) {
      // 添加到本地列表
      const newMedia: Media = {
        id: `temp-${Date.now()}`,
        location_id: location.id,
        media_type: newMediaType,
        url: newMediaUrl,
        caption: newMediaCaption || null,
        sort_order: localMedia.length,
        position: newMediaPosition,
        created_at: new Date().toISOString(),
      }
      setLocalMedia(prev => [...prev, newMedia].sort((a, b) => a.position - b.position))
      await onRefresh()
    }

    setLoading(false)
    setNewMediaUrl('')
    setNewMediaCaption('')
    setNewMediaPosition(0)
    setShowMediaForm(false)
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!location?.id) return

    // 立即从本地删除
    setLocalMedia(prev => prev.filter(m => m.id !== mediaId))
    onRemoveMediaLocal(location.id, mediaId)

    // 异步删除数据库
    await onDeleteMedia(mediaId)
  }

  const handleMoveMedia = async (mediaId: string, direction: 'up' | 'down') => {
    const index = localMedia.findIndex(m => m.id === mediaId)
    if (index === -1) return

    const newMedia = [...localMedia]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newMedia.length) return

    // 交换位置
    const currentPos = newMedia[index].position
    newMedia[index].position = newMedia[targetIndex].position
    newMedia[targetIndex].position = currentPos

    // 交换数组位置
    ;[newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]]

    setLocalMedia(newMedia)

    // 更新数据库
    await onUpdateMedia(mediaId, { position: newMedia[index === targetIndex ? targetIndex : index].position })
    await onUpdateMedia(newMedia[index === targetIndex ? index : targetIndex].id, { position: newMedia[index === targetIndex ? index : targetIndex].position })
  }

  // 预览模式
  if (isPreview) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-bg-tertiary flex justify-between items-center">
          <h2 className="text-lg font-bold text-text-primary">预览</h2>
          <button
            onClick={() => setIsPreview(false)}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium"
          >
            返回编辑
          </button>
        </div>
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          <LocationDetail
            location={previewLocation}
            onBack={() => setIsPreview(false)}
            formatDate={(date) => date ? new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '未记录'}
            getTypeLabel={(type) => {
              switch (type) {
                case 'point': return '地点'
                case 'area': return '区域'
                case 'trajectory': return '轨迹'
                default: return type
              }
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sidebar-scroll">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-text-primary">
          {isNew ? '添加地点' : '编辑地点'}
        </h2>
        <div className="flex gap-2">
          {!isNew && (
            <button
              onClick={() => setIsPreview(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-tertiary transition-colors text-accent"
              title="预览"
            >
              <IoEye size={20} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-tertiary transition-colors"
          >
            <IoClose size={20} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 基本信息卡片 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary text-sm"
              placeholder="输入地点名称"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">访问日期</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-tertiary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">坐标位置</label>
            <div className="px-3 py-2.5 bg-bg-tertiary rounded-lg text-sm text-text-secondary">
              {location?.longitude?.toFixed(6) || '0'}, {location?.latitude?.toFixed(6) || '0'}
            </div>
          </div>
        </div>

        {/* 图标设置 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">图标设置</h3>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">自定义图标 URL</label>
            <input
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
              className="w-full px-3 py-2.5 bg-bg-tertiary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">图标颜色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-bg-tertiary"
              />
              <input
                type="text"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-bg-tertiary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary text-sm"
              />
            </div>
          </div>

          {/* 图标预览 */}
          {iconUrl && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">图标预览</label>
              <div className="w-12 h-12 bg-bg-tertiary rounded-lg flex items-center justify-center">
                <img src={iconUrl} alt="图标预览" className="w-8 h-8 object-contain" />
              </div>
            </div>
          )}
        </div>

        {/* 内容编辑 */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-text-primary">内容描述</h3>
            <span className="text-xs text-text-secondary">{paragraphCount} 个段落</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              文字描述（用回车分隔段落，媒体会按位置插入）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2.5 bg-bg-tertiary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary text-sm resize-none"
              placeholder="描述这个地点的故事...&#10;&#10;每按一次回车就是一个新段落"
            />
          </div>
        </div>

        {/* 媒体管理 */}
        {!isNew && location?.id && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-text-primary">媒体文件</h3>
              <button
                type="button"
                onClick={() => setShowMediaForm(!showMediaForm)}
                className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1"
              >
                <IoAdd size={16} />
                添加
              </button>
            </div>

            {/* 现有媒体列表 */}
            {localMedia.length > 0 && (
              <div className="space-y-2">
                {localMedia.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-bg-tertiary rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0">
                      {item.media_type === 'image' ? (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoVideocam size={20} className="text-text-secondary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary truncate">
                        {item.caption || (item.media_type === 'image' ? '图片' : '视频')}
                      </p>
                      <p className="text-xs text-text-secondary">
                        位置: 第 {item.position} 段后
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveMedia(item.id, 'up')}
                        disabled={index === 0}
                        className="w-7 h-7 flex items-center justify-center text-text-secondary hover:bg-bg-secondary rounded transition-colors disabled:opacity-30"
                      >
                        <IoArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMedia(item.id, 'down')}
                        disabled={index === localMedia.length - 1}
                        className="w-7 h-7 flex items-center justify-center text-text-secondary hover:bg-bg-secondary rounded transition-colors disabled:opacity-30"
                      >
                        <IoArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <IoTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 添加媒体表单 */}
            {showMediaForm && (
              <div className="p-3 bg-bg-tertiary rounded-lg space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMediaType('image')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
                      newMediaType === 'image'
                        ? 'bg-accent text-white'
                        : 'bg-bg-secondary text-text-primary'
                    }`}
                  >
                    <IoImage size={16} />
                    图片
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMediaType('video')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
                      newMediaType === 'video'
                        ? 'bg-accent text-white'
                        : 'bg-bg-secondary text-text-primary'
                    }`}
                  >
                    <IoVideocam size={16} />
                    视频
                  </button>
                </div>

                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="输入 Cloudflare 链接"
                  className="w-full px-3 py-2 bg-bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary text-sm"
                />

                <input
                  type="text"
                  value={newMediaCaption}
                  onChange={(e) => setNewMediaCaption(e.target.value)}
                  placeholder="描述（可选）"
                  className="w-full px-3 py-2 bg-bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary text-sm"
                />

                <div>
                  <label className="block text-xs text-text-secondary mb-1">
                    插入位置（第几段后，0表示开头）
                  </label>
                  <input
                    type="number"
                    value={newMediaPosition}
                    onChange={(e) => setNewMediaPosition(Math.max(0, parseInt(e.target.value) || 0))}
                    min={0}
                    max={paragraphCount}
                    className="w-full px-3 py-2 bg-bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary text-sm"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    当前有 {paragraphCount} 个段落，可输入 0-{paragraphCount}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaForm(false)}
                    className="flex-1 py-2 bg-bg-secondary text-text-primary rounded-lg text-sm font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMedia}
                    disabled={!newMediaUrl || loading}
                    className="flex-1 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? '添加中...' : '确认添加'}
                  </button>
                </div>
              </div>
            )}

            {localMedia.length === 0 && !showMediaForm && (
              <p className="text-xs text-text-secondary text-center py-4">
                暂无媒体文件，点击上方"添加"按钮上传
              </p>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading || !name}
            className="flex-1 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
          {!isNew && location?.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <IoTrash size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}