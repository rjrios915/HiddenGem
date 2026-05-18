'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, style, ...props }, ref) => {

    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      borderRadius: '10px',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      transition: 'all 0.18s ease',
      border: '1px solid transparent',
      outline: 'none',
      letterSpacing: '0.01em',
    }

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { fontSize: '12px', padding: '6px 14px', height: '32px' },
      md: { fontSize: '13px', padding: '8px 18px', height: '38px' },
      lg: { fontSize: '15px', padding: '11px 24px', height: '44px' },
    }

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: '#1A3050',
        color: '#FFFFFF',
        border: '1px solid #1A3050',
        boxShadow: '0 1px 3px rgba(26,48,80,0.25), 0 4px 12px rgba(26,48,80,0.12)',
      },
      secondary: {
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        color: '#0D0D0D',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      },
      ghost: {
        background: 'transparent',
        border: '1px solid transparent',
        color: '#666666',
      },
      danger: {
        background: 'transparent',
        border: '1px solid #D4855A',
        color: '#9A3B1E',
      },
    }

    const hoverClass = variant === 'primary'
      ? 'hover:bg-[#122340] hover:-translate-y-px active:translate-y-0'
      : variant === 'secondary'
      ? 'hover:bg-[#F0F5FA] hover:border-[#D0D0D0] active:bg-[#E5EFF8]'
      : variant === 'danger'
      ? 'hover:bg-[#FAECE4]'
      : 'hover:text-[#0D0D0D] hover:bg-[#F0F5FA]'

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(hoverClass, className)}
        style={{ ...base, ...sizeStyles[size], ...variantStyles[variant], ...style }}
        {...props}
      >
        {loading && (
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            style={{ animation: 'spin-slow 0.8s linear infinite', flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
