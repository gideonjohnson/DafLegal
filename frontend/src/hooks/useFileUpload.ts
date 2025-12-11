import { useState, useCallback } from 'react'
import axios, { AxiosProgressEvent } from 'axios'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  speed: number // bytes per second
  timeRemaining: number // seconds
  fileName: string
  fileSize: number
}

export interface UseFileUploadOptions {
  apiUrl: string
  headers?: Record<string, string>
  onSuccess?: (response: any) => void
  onError?: (error: Error) => void
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  let startTime: number
  let lastLoaded: number = 0
  let lastTime: number = 0

  const upload = useCallback(async (file: File, endpoint: string) => {
    setUploading(true)
    setError(null)
    setProgress({
      loaded: 0,
      total: file.size,
      percentage: 0,
      speed: 0,
      timeRemaining: 0,
      fileName: file.name,
      fileSize: file.size
    })

    startTime = Date.now()
    lastTime = startTime
    lastLoaded = 0

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(
        `${options.apiUrl}${endpoint}`,
        formData,
        {
          headers: {
            ...options.headers,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const now = Date.now()
            const timeDiff = (now - lastTime) / 1000 // seconds
            const loaded = progressEvent.loaded || 0
            const total = progressEvent.total || file.size
            const loadedDiff = loaded - lastLoaded

            // Calculate speed (bytes per second)
            const instantSpeed = timeDiff > 0 ? loadedDiff / timeDiff : 0
            const avgSpeed = (loaded / ((now - startTime) / 1000)) || 0
            // Use weighted average: 70% instant, 30% average for smoother display
            const speed = instantSpeed * 0.7 + avgSpeed * 0.3

            // Calculate time remaining
            const remaining = total - loaded
            const timeRemaining = speed > 0 ? remaining / speed : 0

            const percentage = Math.round((loaded * 100) / total)

            setProgress({
              loaded,
              total,
              percentage,
              speed,
              timeRemaining,
              fileName: file.name,
              fileSize: file.size
            })

            lastLoaded = loaded
            lastTime = now
          },
        }
      )

      setUploading(false)
      options.onSuccess?.(response.data)
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Upload failed'
      setError(errorMessage)
      setUploading(false)
      options.onError?.(err)
      throw err
    }
  }, [options])

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(null)
    setError(null)
  }, [])

  return {
    upload,
    uploading,
    progress,
    error,
    reset
  }
}

// Utility functions for formatting
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}
