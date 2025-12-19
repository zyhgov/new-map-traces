import { useState } from 'react'
import { IoClose, IoEye, IoEyeOff } from 'react-icons/io5'
import { supabase } from '../lib/supabase'

interface AuthModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: queryError } = await supabase
        .from('map_admin')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single()

      if (queryError || !data) {
        setError('用户名或密码错误')
        return
      }

      onSuccess()
    } catch {
      setError('验证失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-xl animate-slideUp"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-lg sm:text-xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            管理员验证
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <IoClose size={20} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                '--tw-ring-color': 'var(--color-accent)',
              } as React.CSSProperties}
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  '--tw-ring-color': 'var(--color-accent)',
                } as React.CSSProperties}
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
            }}
          >
            {loading ? '验证中...' : '确认'}
          </button>
        </form>
      </div>
    </div>
  )
}