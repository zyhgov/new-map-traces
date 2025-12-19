import { IoLocationSharp, IoSquare, IoEllipse, IoClose } from 'react-icons/io5'

interface EditToolbarProps {
  editMode: 'none' | 'point' | 'polygon' | 'circle'
  onModeChange: (mode: 'none' | 'point' | 'polygon' | 'circle') => void
  onExit: () => void
}

export default function EditToolbar({ editMode, onModeChange, onExit }: EditToolbarProps) {
  const tools = [
    { mode: 'point' as const, icon: IoLocationSharp, label: '打点' },
    { mode: 'polygon' as const, icon: IoSquare, label: '多边形' },
    { mode: 'circle' as const, icon: IoEllipse, label: '圆形' },
  ]

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] rounded-2xl shadow-xl p-1.5 flex gap-1"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
    >
      {tools.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onModeChange(editMode === mode ? 'none' : mode)}
          className="px-3 sm:px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95"
          style={{
            backgroundColor: editMode === mode ? 'var(--color-accent)' : 'transparent',
            color: editMode === mode ? '#ffffff' : 'var(--color-text-primary)',
          }}
        >
          <Icon size={18} />
          <span className="text-sm font-medium hidden sm:inline">{label}</span>
        </button>
      ))}

      <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0 4px' }} />

      <button
        onClick={onExit}
        className="px-3 sm:px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95"
        style={{ color: '#ef4444' }}
      >
        <IoClose size={18} />
        <span className="text-sm font-medium hidden sm:inline">退出</span>
      </button>
    </div>
  )
}