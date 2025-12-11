# Toast Notification System - Usage Guide

## Overview

DafLegal now has a fully functional toast notification system for providing user feedback throughout the application.

## Features

- ✅ 4 toast types: success, error, warning, info
- ✅ Auto-dismiss with configurable duration
- ✅ Manual dismiss button
- ✅ Smooth animations
- ✅ Dark mode support
- ✅ Accessible (ARIA labels, screen reader support)
- ✅ Responsive design
- ✅ Stack multiple toasts
- ✅ TypeScript support

## Basic Usage

### 1. Import the hook

```typescript
import { useToast } from '@/contexts/ToastContext'
```

### 2. Use in your component

```typescript
'use client'

import { useToast } from '@/contexts/ToastContext'

export function MyComponent() {
  const { success, error, warning, info } = useToast()

  const handleSuccess = () => {
    success('Operation completed successfully!')
  }

  const handleError = () => {
    error('Something went wrong', 'Error')
  }

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  )
}
```

## Toast Types

### Success Toast

```typescript
const { success } = useToast()

// Simple message
success('Contract uploaded successfully!')

// With title
success('Analysis complete', 'Success')
```

### Error Toast

```typescript
const { error } = useToast()

// Simple message
error('Failed to upload file')

// With title
error('Upload failed. Please try again.', 'Error')
```

### Warning Toast

```typescript
const { warning } = useToast()

warning('This action cannot be undone', 'Warning')
```

### Info Toast

```typescript
const { info } = useToast()

info('Your analysis will be ready in a few moments', 'Processing')
```

## Advanced Usage

### Custom Duration

```typescript
const { addToast } = useToast()

addToast({
  type: 'success',
  message: 'Custom duration toast',
  duration: 10000 // 10 seconds
})
```

### Persistent Toast (No Auto-Dismiss)

```typescript
addToast({
  type: 'info',
  message: 'This stays until manually dismissed',
  duration: 0 // Won't auto-dismiss
})
```

### Manual Removal

```typescript
const { addToast, removeToast } = useToast()

const toastId = addToast({
  type: 'info',
  message: 'Processing...',
  duration: 0
})

// Later, manually remove it
removeToast(toastId)
```

## Real-World Examples

### Contract Upload

```typescript
async function uploadContract(file: File) {
  try {
    info('Uploading contract...', 'Please Wait')

    const response = await uploadAPI(file)

    success('Contract uploaded and analysis started!', 'Success')
  } catch (err) {
    error('Failed to upload contract. Please try again.', 'Upload Failed')
  }
}
```

### Form Validation

```typescript
function handleSubmit(data: FormData) {
  if (!data.email) {
    warning('Email is required', 'Validation Error')
    return
  }

  if (!isValidEmail(data.email)) {
    error('Please enter a valid email address', 'Invalid Email')
    return
  }

  success('Form submitted successfully!')
}
```

### API Error Handling

```typescript
async function fetchData() {
  try {
    const response = await apiCall()
    success('Data loaded successfully')
    return response.data
  } catch (err) {
    if (err.status === 401) {
      error('Session expired. Please log in again.', 'Authentication Error')
    } else if (err.status === 500) {
      error('Server error. Please try again later.', 'Server Error')
    } else {
      error('An unexpected error occurred', 'Error')
    }
  }
}
```

## Default Durations

- **Success**: 5 seconds
- **Error**: 7 seconds (longer for users to read error messages)
- **Warning**: 6 seconds
- **Info**: 5 seconds

## Styling

The toast notifications automatically adapt to:
- ✅ Light/Dark mode
- ✅ Mobile/Desktop screens
- ✅ High contrast mode
- ✅ Reduced motion preferences

## Accessibility

- Toasts use `role="alert"` and `aria-live="assertive"` for screen readers
- Each toast has an accessible close button with `aria-label`
- Keyboard accessible (can tab to close button)
- Respects `prefers-reduced-motion` for animations

## Location

Toasts appear in the **top-right corner** of the screen and stack vertically.

## Integration Points

Consider adding toasts to:

1. **Contract Analysis** - Upload success/failure, analysis complete
2. **Compliance Checker** - Rules saved, checks completed
3. **User Settings** - Profile updated, password changed
4. **Authentication** - Login success, logout confirmation
5. **Clause Library** - Clause saved, deleted, copied
6. **Document Comparison** - Comparison started, completed
7. **API Errors** - Network errors, validation errors
8. **File Operations** - Upload/download progress, errors

## Future Enhancements

Potential improvements:
- Progress bars for long operations
- Action buttons within toasts (undo, retry)
- Toast groups/categories
- Sound notifications (opt-in)
- Position customization
- Custom toast components

## Technical Details

- **Context**: `ToastContext` (`src/contexts/ToastContext.tsx`)
- **Component**: `Toast`, `ToastContainer` (`src/components/Toast.tsx`)
- **Provider**: Wraps app in `layout.tsx`
- **Animations**: CSS keyframes in `globals.css`

## Example: Complete Feature Integration

```typescript
'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

export function ContractUploadForm() {
  const [uploading, setUploading] = useState(false)
  const { success, error, info } = useToast()

  async function handleUpload(file: File) {
    if (!file) {
      warning('Please select a file', 'No File Selected')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      error('File size must be less than 25MB', 'File Too Large')
      return
    }

    setUploading(true)
    info('Uploading your contract...', 'Processing')

    try {
      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      success('Contract uploaded successfully! Analysis will begin shortly.', 'Upload Complete')

      // Navigate or update UI
    } catch (err) {
      error('Failed to upload contract. Please try again.', 'Upload Failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

## Support

For issues or questions about the toast system, check:
- Component code: `src/components/Toast.tsx`
- Context code: `src/contexts/ToastContext.tsx`
- Animations: `src/app/globals.css`
