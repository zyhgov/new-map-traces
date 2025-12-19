import { IoClose, IoGlobe, IoOpenOutline } from 'react-icons/io5'

interface AboutModalProps {
  onClose: () => void
}

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div 
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        >
          <IoClose size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        {/* 头部装饰 */}
        <div 
          className="h-1.5"
          style={{ background: 'linear-gradient(to right, var(--color-accent), #60a5fa, var(--color-accent))' }}
        />

        {/* 内容 */}
        <div className="p-6 sm:p-8">
          {/* Logo 展示 */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex flex-col items-center">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-3 shadow-sm"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <img src="/logo.svg" alt="UNHub" className="w-full h-full object-contain" />
              </div>
              <span 
                className="text-xs mt-2 font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                联合库 UNHub
              </span>
            </div>
            
            <div 
              className="text-2xl font-light"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ×
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-3 shadow-sm"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <img src="/amap.svg" alt="高德地图" className="w-full h-full object-contain" />
              </div>
              <span 
                className="text-xs mt-2 font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                高德地图
              </span>
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center mb-6">
            <h2 
              className="text-xl sm:text-2xl font-bold mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              杖雍皓行踪轨迹
            </h2>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Personal Journey Tracker
            </p>
          </div>

          {/* 介绍文字 */}
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            <p>
              本站由<span className="font-semibold" style={{ color: 'var(--color-accent)' }}>联合库 UNHub</span>
              携手<span className="font-semibold">高德开放平台</span>倾力打造，
              是一款专业级个人出行轨迹记录与可视化展示平台。
            </p>
            
            <p>
              通过精准的地理坐标定位、灵活的区域范围标注以及流畅的行程轨迹绘制，
              结合丰富的多媒体内容呈现，为每一段旅程赋予独特的空间叙事。
            </p>

            {/* 版本说明卡片 */}
            <div 
              className="p-4 rounded-2xl space-y-3"
              style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
              <div className="flex items-start gap-3">
                <IoGlobe size={20} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <div>
                  <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    关于站点升级
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    本站为「杖雍皓的行踪轨迹」全新升级版本。原站点 
                    <span style={{ color: 'var(--color-accent)' }}> map.zyhorg.cn </span>
                    数据将永久保留，域名维持不变，但不再更新。
                    全新内容将统一发布于本站。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 链接按钮 */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="https://maps.zyhorg.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
              }}
            >
              <span>新版站点</span>
              <IoOpenOutline size={16} />
            </a>
            <a
              href="https://map.zyhorg.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              <span>旧版站点</span>
              <IoOpenOutline size={16} />
            </a>
          </div>

          {/* 底部版权 */}
          <div 
            className="mt-6 pt-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <p 
              className="text-center text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              © {new Date().getFullYear()} 联合库 UNHub · 保留所有权利
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}