'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { LoadingSpinner } from './LoadingAnimation'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
  href?: string
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  href,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Size styles
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  }

  // Variant styles with improved hover effects
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-[#3d6b3d] to-[#2d5a2d]
      text-white font-semibold
      hover:from-[#4a7c4a] hover:to-[#3d6b3d]
      hover:shadow-xl hover:scale-105
      active:scale-100
      transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
    secondary: `
      border-2 border-[#d4a561]
      bg-transparent
      text-[#d4a561] font-semibold
      hover:bg-[#d4a561] hover:text-[#1a2e1a]
      hover:shadow-lg hover:scale-105
      active:scale-100
      transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
    ghost: `
      bg-transparent
      text-[#1a2e1a] dark:text-[#f5edd8] font-medium
      hover:bg-[#3d6b3d]/10 dark:hover:bg-[#d4a561]/10
      hover:scale-105
      active:scale-100
      transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
    gold: `
      bg-gradient-to-r from-[#d4a561] to-[#e8b977]
      text-[#1a2e1a] font-bold
      hover:from-[#e8b977] hover:to-[#d4a561]
      hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5
      active:scale-100 active:translate-y-0
      transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
      shadow-lg
    `
  }

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-lg font-medium
    focus:outline-none focus:ring-2 focus:ring-[#d4a561] focus:ring-offset-2
    transform
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  const isDisabled = disabled || loading

  const content = (
    <>
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </>
  )

  if (href && !isDisabled) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    )
  }

  return (
    <button
      className={baseStyles}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </button>
  )
}

// Icon button variant
export function IconButton({
  children,
  className = '',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <button
      className={`
        ${sizeStyles[size]}
        inline-flex items-center justify-center
        rounded-lg
        bg-[#d4a561]/10 hover:bg-[#d4a561]/20
        text-[#d4a561]
        hover:scale-110 active:scale-100
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-[#d4a561] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

// Floating Action Button (FAB)
export function FAB({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14
        inline-flex items-center justify-center
        rounded-full
        bg-gradient-to-r from-[#d4a561] to-[#e8b977]
        text-[#1a2e1a]
        shadow-2xl
        hover:scale-110 hover:-translate-y-1
        active:scale-100 active:translate-y-0
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-[#d4a561] focus:ring-offset-2
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
