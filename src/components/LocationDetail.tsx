import { IoChevronBack, IoCalendar, IoLocation, IoPlay } from 'react-icons/io5'
import type { LocationWithDetails } from '../types'
import { useMemo, useState } from 'react'

interface LocationDetailProps {
  location: LocationWithDetails
  onBack: () => void
  formatDate: (date: string | null) => string
  getTypeLabel: (type: string) => string
}

interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video'
  content: string
  caption?: string
  position: number
}

export default function LocationDetail({
  location,
  onBack,
  formatDate,
  getTypeLabel,
}: LocationDetailProps) {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const contentBlocks = useMemo(() => {
    const blocks: ContentBlock[] = []

    if (location.description) {
      const paragraphs = location.description.split('\n').filter(p => p.trim())
      paragraphs.forEach((p, index) => {
        blocks.push({
          id: `text-${index}`,
          type: 'text',
          content: p,
          position: index,
        })
      })
    }

    if (location.media && location.media.length > 0) {
      location.media.forEach((m) => {
        blocks.push({
          id: m.id,
          type: m.media_type as 'image' | 'video',
          content: m.url,
          caption: m.caption || undefined,
          position: m.position ?? blocks.length,
        })
      })
    }

    return blocks.sort((a, b) => a.position - b.position)
  }, [location])

  return (
    <div className="p-3">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 mb-4 transition-colors active:opacity-70"
        style={{ color: 'var(--color-accent)' }}
      >
        <IoChevronBack size={20} />
        <span className="font-medium text-sm">返回</span>
      </button>

      {/* 头部信息 */}
      <div 
        className="rounded-2xl p-4 shadow-sm mb-3"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <h2 
        className="text-xl sm:text-2xl font-bold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
        >
        {location.name}
        </h2>

        <div className="flex flex-wrap gap-2 mb-3">
          <span 
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ 
              backgroundColor: 'rgba(0, 113, 227, 0.1)',
              color: 'var(--color-accent)',
            }}
          >
            {getTypeLabel(location.location_type)}
          </span>
          {location.tags?.map(tag => (
            <span
              key={tag.id}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ 
                backgroundColor: `${tag.color}20`, 
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center gap-2">
            <IoCalendar size={14} />
            <span>{formatDate(location.visit_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <IoLocation size={14} />
            <span className="font-mono">
              {location.longitude.toFixed(5)}, {location.latitude.toFixed(5)}
            </span>
          </div>
        </div>
      </div>

      {/* 内容 */}
      {contentBlocks.length > 0 && (
        <div 
          className="rounded-2xl p-4 shadow-sm"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <div className="space-y-4">
            {contentBlocks.map((block) => {
              if (block.type === 'text') {
                return (
                  <p 
                    key={block.id} 
                    className="leading-relaxed text-base font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {block.content}
                  </p>
                )
              }

              if (block.type === 'image') {
                return (
                  <figure key={block.id}>
                    <img
                      src={block.content}
                      alt={block.caption || location.name}
                      className="w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                    {block.caption && (
                      <figcaption 
                        className="text-xs mt-2 text-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              if (block.type === 'video') {
                return (
                  <figure key={block.id}>
                    <div className="relative rounded-xl overflow-hidden bg-black">
                      {playingVideo === block.id ? (
                        <video
                          src={block.content}
                          controls
                          autoPlay
                          className="w-full"
                          onEnded={() => setPlayingVideo(null)}
                        />
                      ) : (
                        <div
                          className="relative cursor-pointer"
                          onClick={() => setPlayingVideo(block.id)}
                        >
                          <video src={block.content} className="w-full" muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <IoPlay size={24} className="ml-1" style={{ color: 'var(--color-text-primary)' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {block.caption && (
                      <figcaption 
                        className="text-xs mt-2 text-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              }

              return null
            })}
          </div>
        </div>
      )}

      {contentBlocks.length === 0 && (
        <div 
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            暂无详细内容
          </p>
        </div>
      )}
    </div>
  )
}