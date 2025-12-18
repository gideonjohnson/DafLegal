'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  variant?: 'no-documents' | 'no-results' | 'no-activity' | 'error' | 'success' | 'maintenance' | 'coming-soon'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  secondaryActionLabel?: string
  secondaryActionHref?: string
  onSecondaryAction?: () => void
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  variant = 'no-documents',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  icon,
  size = 'md'
}: EmptyStateProps) {
  // Size variants
  const sizeStyles = {
    sm: {
      container: 'py-8',
      icon: 'w-16 h-16',
      title: 'text-base',
      description: 'text-xs',
      button: 'text-xs px-3 py-2'
    },
    md: {
      container: 'py-12',
      icon: 'w-24 h-24',
      title: 'text-lg',
      description: 'text-sm',
      button: 'text-sm px-4 py-2'
    },
    lg: {
      container: 'py-16',
      icon: 'w-32 h-32',
      title: 'text-2xl',
      description: 'text-base',
      button: 'text-base px-6 py-3'
    }
  }

  const styles = sizeStyles[size]

  // Variant configurations
  const variantConfig = {
    'no-documents': {
      title: title || 'No documents yet',
      description: description || 'Upload your first document to get started with AI-powered analysis',
      actionLabel: actionLabel || 'Upload Document',
      actionHref: actionHref || '/analyze',
      illustration: (
        <svg className={`${styles.icon} text-[#d4a561]`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9" />
        </svg>
      )
    },
    'no-results': {
      title: title || 'No results found',
      description: description || 'Try adjusting your search criteria or filters',
      actionLabel: actionLabel || 'Clear Filters',
      illustration: (
        <svg className={`${styles.icon} text-[#d4a561]`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
        </svg>
      )
    },
    'no-activity': {
      title: title || 'No recent activity',
      description: description || 'Start analyzing documents to see your activity history',
      actionLabel: actionLabel || 'Analyze Document',
      actionHref: actionHref || '/analyze',
      illustration: (
        <svg className={`${styles.icon} text-[#d4a561]`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      )
    },
    'error': {
      title: title || 'Something went wrong',
      description: description || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      actionLabel: actionLabel || 'Try Again',
      secondaryActionLabel: secondaryActionLabel || 'Contact Support',
      secondaryActionHref: secondaryActionHref || '/support',
      illustration: (
        <svg className={`${styles.icon} text-red-500`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      )
    },
    'success': {
      title: title || 'All done!',
      description: description || 'Your task has been completed successfully',
      actionLabel: actionLabel || 'Continue',
      illustration: (
        <svg className={`${styles.icon} text-green-500`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    'maintenance': {
      title: title || 'Under maintenance',
      description: description || 'We are performing scheduled maintenance. Please check back soon.',
      actionLabel: actionLabel || 'Check Status',
      actionHref: actionHref || '/status',
      illustration: (
        <svg className={`${styles.icon} text-[#d4a561]`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
        </svg>
      )
    },
    'coming-soon': {
      title: title || 'Coming soon',
      description: description || 'This feature is currently under development. Stay tuned!',
      actionLabel: actionLabel || 'Notify Me',
      illustration: (
        <svg className={`${styles.icon} text-[#d4a561]`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      )
    }
  }

  const config = variantConfig[variant]

  return (
    <div className={`text-center ${styles.container}`}>
      {/* Icon/Illustration */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-[#d4a561]/20 blur-2xl rounded-full" />
          {/* Icon */}
          <div className="relative bg-[#d4a561]/10 rounded-full p-6 backdrop-blur-sm border border-[#d4a561]/20">
            {icon || config.illustration}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className={`${styles.title} font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-2`}>
        {config.title}
      </h3>

      {/* Description */}
      <p className={`${styles.description} text-[#8b7355] dark:text-[#d4c5b0] max-w-md mx-auto mb-6`}>
        {config.description}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Primary Action */}
        {(config.actionLabel || actionLabel) && (
          <>
            {(config.actionHref || actionHref) ? (
              <Link
                href={config.actionHref || actionHref || '#'}
                className={`
                  ${styles.button}
                  bg-gradient-to-r from-[#d4a561] to-[#b8965a] text-white
                  font-semibold rounded-lg
                  hover:shadow-lg hover:scale-105
                  transition-all duration-200
                  inline-flex items-center gap-2
                `}
              >
                {config.actionLabel || actionLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <button
                onClick={onAction}
                className={`
                  ${styles.button}
                  bg-gradient-to-r from-[#d4a561] to-[#b8965a] text-white
                  font-semibold rounded-lg
                  hover:shadow-lg hover:scale-105
                  transition-all duration-200
                  inline-flex items-center gap-2
                `}
              >
                {config.actionLabel || actionLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </>
        )}

        {/* Secondary Action */}
        {(config.secondaryActionLabel || secondaryActionLabel) && (
          <>
            {(config.secondaryActionHref || secondaryActionHref) ? (
              <Link
                href={config.secondaryActionHref || secondaryActionHref || '#'}
                className={`
                  ${styles.button}
                  bg-white/50 dark:bg-[#2d5a2d]/50
                  text-[#1a2e1a] dark:text-[#f5edd8]
                  border border-[#d4a561]/20
                  font-medium rounded-lg
                  hover:bg-[#d4a561]/10 hover:border-[#d4a561]/50
                  transition-all duration-200
                `}
              >
                {config.secondaryActionLabel || secondaryActionLabel}
              </Link>
            ) : (
              <button
                onClick={onSecondaryAction}
                className={`
                  ${styles.button}
                  bg-white/50 dark:bg-[#2d5a2d]/50
                  text-[#1a2e1a] dark:text-[#f5edd8]
                  border border-[#d4a561]/20
                  font-medium rounded-lg
                  hover:bg-[#d4a561]/10 hover:border-[#d4a561]/50
                  transition-all duration-200
                `}
              >
                {config.secondaryActionLabel || secondaryActionLabel}
              </button>
            )}
          </>
        )}
      </div>

      {/* Additional help text for errors */}
      {variant === 'error' && (
        <p className="text-xs text-[#8b7355]/70 dark:text-[#d4c5b0]/70 mt-4">
          Error code: {Math.random().toString(36).substring(2, 10).toUpperCase()}
        </p>
      )}
    </div>
  )
}

// Preset empty state components for common scenarios
export function NoDocumentsState() {
  return <EmptyState variant="no-documents" />
}

export function NoResultsState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      variant="no-results"
      actionLabel="Clear Filters"
      onAction={onClearFilters}
    />
  )
}

export function NoActivityState() {
  return <EmptyState variant="no-activity" />
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      actionLabel="Try Again"
      onAction={onRetry}
    />
  )
}

export function SuccessState({ title, description, actionLabel, actionHref }: {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <EmptyState
      variant="success"
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionHref={actionHref}
    />
  )
}

export function MaintenanceState() {
  return <EmptyState variant="maintenance" />
}

export function ComingSoonState({ featureName }: { featureName?: string }) {
  return (
    <EmptyState
      variant="coming-soon"
      title={featureName ? `${featureName} Coming Soon` : undefined}
    />
  )
}
