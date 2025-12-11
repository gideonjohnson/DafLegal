# File Upload Progress System - Usage Guide

## Overview

DafLegal now has a comprehensive file upload progress tracking system with real-time speed monitoring, time estimation, and beautiful UI components.

## Features

- ✅ Real-time upload progress tracking
- ✅ Upload speed calculation (bytes/second)
- ✅ Time remaining estimation
- ✅ File size display with proper formatting
- ✅ Beautiful progress UI (full and compact versions)
- ✅ Dark mode support
- ✅ Smooth animations
- ✅ Processing status indicators
- ✅ TypeScript support
- ✅ Reusable across the entire app

## Quick Start

### 1. Use the upload hook

```typescript
import { useFileUpload } from '@/hooks/useFileUpload'
import { UploadProgress } from '@/components/UploadProgress'

export function MyUploadComponent() {
  const { upload, uploading, progress, error } = useFileUpload({
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    onSuccess: (data) => {
      console.log('Upload complete!', data)
    },
    onError: (err) => {
      console.error('Upload failed', err)
    }
  })

  const handleFileSelect = async (file: File) => {
    try {
      await upload(file, '/api/v1/contracts/analyze')
    } catch (err) {
      // Error handled by hook
    }
  }

  return (
    <div>
      {uploading && progress ? (
        <UploadProgress progress={progress} status="uploading" />
      ) : (
        <input type="file" onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }} />
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
```

## Components

### UploadProgress (Full Version)

Beautiful, detailed progress display with stats grid.

```typescript
import { UploadProgress } from '@/components/UploadProgress'

<UploadProgress
  progress={progress}
  status="uploading" // 'uploading' | 'processing' | 'complete'
  processingMessage="AI is analyzing your contract..."
/>
```

**Features:**
- Large circular progress indicator
- Percentage display
- File name
- Progress bar with shimmer effect
- 4-stat grid (Uploaded, Total Size, Speed, Time Remaining)
- Processing step indicators
- Completion checkmark

**Best for:** Main upload areas, full-page uploads

---

### UploadProgressCompact

Smaller, inline progress indicator.

```typescript
import { UploadProgressCompact } from '@/components/UploadProgress'

<UploadProgressCompact
  progress={progress}
  status="uploading"
/>
```

**Features:**
- Small circular spinner (40px)
- File name (truncated)
- Size and speed info
- Compact progress bar

**Best for:** Sidebars, list items, modal uploads

---

## Upload Hook API

### useFileUpload(options)

```typescript
interface UseFileUploadOptions {
  apiUrl: string                              // Base API URL
  headers?: Record<string, string>            // Custom headers (auth, etc.)
  onSuccess?: (response: any) => void        // Success callback
  onError?: (error: Error) => void           // Error callback
}
```

**Returns:**
```typescript
{
  upload: (file: File, endpoint: string) => Promise<any>,
  uploading: boolean,
  progress: UploadProgress | null,
  error: string | null,
  reset: () => void
}
```

**Progress Object:**
```typescript
interface UploadProgress {
  loaded: number          // Bytes uploaded
  total: number           // Total file size
  percentage: number      // 0-100
  speed: number           // Bytes per second
  timeRemaining: number   // Seconds remaining
  fileName: string        // Original file name
  fileSize: number        // Total size in bytes
}
```

---

## Utility Functions

### formatBytes(bytes, decimals?)

```typescript
import { formatBytes } from '@/hooks/useFileUpload'

formatBytes(1024)           // "1 KB"
formatBytes(1048576)        // "1 MB"
formatBytes(1073741824, 1)  // "1.0 GB"
```

### formatSpeed(bytesPerSecond)

```typescript
import { formatSpeed } from '@/hooks/useFileUpload'

formatSpeed(102400)  // "100 KB/s"
formatSpeed(2097152) // "2 MB/s"
```

### formatTime(seconds)

```typescript
import { formatTime } from '@/hooks/useFileUpload'

formatTime(45)   // "45s"
formatTime(125)  // "2m 5s"
formatTime(3720) // "1h 2m"
```

---

## Real-World Examples

### Example 1: Contract Upload with Drag & Drop

```typescript
'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFileUpload } from '@/hooks/useFileUpload'
import { UploadProgress } from '@/components/UploadProgress'
import { useToast } from '@/contexts/ToastContext'

export function ContractUploader() {
  const { success, error: showError } = useToast()
  const { upload, uploading, progress, error } = useFileUpload({
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    headers: { 'Authorization': `Bearer ${apiKey}` },
    onSuccess: (data) => {
      success('Contract uploaded and analysis started!')
      router.push(`/contracts/${data.contract_id}`)
    },
    onError: () => {
      showError('Failed to upload contract')
    }
  })

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]

    // Validate
    if (file.size > 25 * 1024 * 1024) {
      showError('File too large (max 25MB)')
      return
    }

    await upload(file, '/api/v1/contracts/analyze')
  }, [upload, showError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div className="card-beige p-8">
      {uploading && progress ? (
        <UploadProgress
          progress={progress}
          status={progress.percentage < 100 ? 'uploading' : 'processing'}
          processingMessage="AI is analyzing your contract (10-20s)..."
        />
      ) : (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer ${
          isDragActive ? 'border-[#d4a561] bg-[#f5edd8]/50' : 'border-gray-300'
        }`}>
          <input {...getInputProps()} />
          <p>Drag & drop your contract here</p>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}
```

### Example 2: Multiple File Upload

```typescript
'use client'

import { useState } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { UploadProgressCompact } from '@/components/UploadProgress'

interface UploadItem {
  id: string
  file: File
  progress: any
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

export function MultiFileUploader() {
  const [uploads, setUploads] = useState<UploadItem[]>([])

  const handleFiles = async (files: FileList) => {
    const newUploads: UploadItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(),
      file,
      progress: null,
      status: 'pending'
    }))

    setUploads(prev => [...prev, ...newUploads])

    // Upload sequentially
    for (const upload of newUploads) {
      await uploadFile(upload)
    }
  }

  const uploadFile = async (item: UploadItem) => {
    const fileUpload = useFileUpload({
      apiUrl: process.env.NEXT_PUBLIC_API_URL!,
      onSuccess: () => {
        setUploads(prev => prev.map(u =>
          u.id === item.id ? { ...u, status: 'complete' } : u
        ))
      },
      onError: (err) => {
        setUploads(prev => prev.map(u =>
          u.id === item.id ? { ...u, status: 'error', error: err.message } : u
        ))
      }
    })

    setUploads(prev => prev.map(u =>
      u.id === item.id ? { ...u, status: 'uploading' } : u
    ))

    await fileUpload.upload(item.file, '/api/v1/documents/upload')
  }

  return (
    <div>
      <input type="file" multiple onChange={(e) => {
        if (e.target.files) handleFiles(e.target.files)
      }} />

      <div className="space-y-4 mt-6">
        {uploads.map(upload => (
          <div key={upload.id} className="card-beige p-4">
            {upload.status === 'uploading' && upload.progress ? (
              <UploadProgressCompact progress={upload.progress} />
            ) : (
              <div className="flex items-center justify-between">
                <span>{upload.file.name}</span>
                <span className={`text-sm ${
                  upload.status === 'complete' ? 'text-green-600' :
                  upload.status === 'error' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {upload.status}
                </span>
              </div>
            )}
            {upload.error && (
              <p className="text-red-500 text-sm mt-2">{upload.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 3: Upload with Retry

```typescript
'use client'

import { useState } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { UploadProgress } from '@/components/UploadProgress'

export function UploadWithRetry() {
  const [file, setFile] = useState<File | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const { upload, uploading, progress, error, reset } = useFileUpload({
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    onSuccess: () => {
      console.log('Upload successful!')
      setRetryCount(0)
    },
    onError: (err) => {
      console.error('Upload failed', err)
    }
  })

  const handleUpload = async () => {
    if (!file) return

    try {
      await upload(file, '/api/v1/files')
    } catch (err) {
      // Error already handled by hook
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    reset()
    handleUpload()
  }

  return (
    <div>
      <input type="file" onChange={(e) => {
        const f = e.target.files?.[0]
        if (f) {
          setFile(f)
          setRetryCount(0)
          reset()
        }
      }} />

      {file && !uploading && !error && (
        <button onClick={handleUpload}>Upload</button>
      )}

      {uploading && progress && (
        <UploadProgress progress={progress} />
      )}

      {error && (
        <div className="mt-4">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={handleRetry} disabled={retryCount >= 3}>
            Retry ({retryCount}/3)
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Advanced Features

### Custom Progress Tracking

You can track custom events during upload/processing:

```typescript
const { upload, uploading, progress } = useFileUpload({...})

// During upload
if (progress) {
  trackAnalytics('upload_progress', {
    percentage: progress.percentage,
    speed: progress.speed,
    fileSize: progress.fileSize
  })
}
```

### Pausing/Canceling Uploads

For advanced use cases, you can implement cancel functionality using axios cancel tokens:

```typescript
import axios, { CancelTokenSource } from 'axios'

let cancelToken: CancelTokenSource

const upload = async (file: File) => {
  cancelToken = axios.CancelToken.source()

  try {
    await axios.post(url, formData, {
      cancelToken: cancelToken.token,
      onUploadProgress: (e) => { /* ... */ }
    })
  } catch (err) {
    if (axios.isCancel(err)) {
      console.log('Upload canceled')
    }
  }
}

const cancelUpload = () => {
  cancelToken.cancel('User canceled upload')
}
```

---

## Styling & Customization

All components use Tailwind CSS and respect your theme (light/dark mode). Key color variables:

- Primary: `#d4a561`
- Background: `#f5edd8` (light) / `#1a2e1a` (dark)
- Text: `#1a2e1a` (light) / `#f5edd8` (dark)

To customize, modify the component classes or extend with your own variants.

---

## Performance Notes

- Speed calculation uses a weighted average (70% instant, 30% average) for smooth display
- Progress updates throttled by browser's upload events
- Lightweight components with minimal re-renders
- No external animation libraries required

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

### Progress stuck at 100%

This is normal! When `percentage === 100`, the file is uploaded but the server is still processing it. Use `status="processing"` to show processing UI.

### Speed shows as 0 or fluctuates wildly

- Small files upload too fast for accurate speed calculation
- Network conditions cause speed variations
- The weighted average smooths this out after a few seconds

### Time remaining shows negative or infinity

- This can happen at the start before speed stabilizes
- Component shows `--` when time is unreliable
- After 1-2 seconds, estimation becomes accurate

---

## Integration with Existing Code

To upgrade the existing `ContractUpload` component:

```typescript
// Replace the manual progress tracking with:
const { upload, uploading, progress, error } = useFileUpload({...})

// Replace the progress UI with:
{uploading && progress && (
  <UploadProgress progress={progress} status="uploading" />
)}
```

---

## Future Enhancements

Potential improvements:
- Chunked uploads for very large files
- Resume capability after network interruption
- Parallel multi-file uploads
- Compression before upload
- Client-side virus scanning

---

## Support

For issues or questions:
- Check component code: `src/components/UploadProgress.tsx`
- Check hook code: `src/hooks/useFileUpload.ts`
- Check animations: `src/app/globals.css`
