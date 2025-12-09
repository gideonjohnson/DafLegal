# Accessibility (A11y) Guide

## Overview

DafLegal is committed to providing an accessible web experience for all users, including those with disabilities. This guide documents our accessibility features and best practices.

## WCAG 2.1 Compliance Target

We aim for **WCAG 2.1 Level AA** compliance across all features.

## Key Accessibility Features

### 1. Skip Navigation

**Location**: Root layout (applies to all pages)

```typescript
import { SkipLink } from '@/components/SkipLink'

// Automatically included in layout.tsx
```

**Features**:
- Keyboard-accessible link to skip to main content
- Visible only when focused (via Tab key)
- Positioned at top of page for screen reader users
- Automatically manages focus on target element

**Testing**:
1. Press Tab on page load
2. "Skip to main content" link should appear
3. Press Enter to jump to main content

### 2. Screen Reader Support

#### Screen Reader Only Content

```typescript
import { ScreenReaderOnly } from '@/components/ScreenReaderOnly'

<ScreenReaderOnly>
  This text is only visible to screen readers
</ScreenReaderOnly>
```

#### Announcing Updates

```typescript
import { useAriaAnnounce } from '@/hooks/useAriaAnnounce'

function MyComponent() {
  const { announce } = useAriaAnnounce()

  const handleSave = async () => {
    await saveData()
    announce('Your changes have been saved')
  }

  const handleError = () => {
    announce('An error occurred. Please try again', 'assertive')
  }

  return <button onClick={handleSave}>Save</button>
}
```

**Priorities**:
- `polite`: Announces when screen reader is idle (default)
- `assertive`: Interrupts screen reader immediately (for errors)

### 3. Focus Management

#### Focus Trap for Modals

```typescript
import { useFocusTrap } from '@/hooks/useFocusTrap'

function Modal({ isOpen, onClose }) {
  const containerRef = useFocusTrap(isOpen)

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Modal Title</h2>
      <button onClick={onClose}>Close</button>
    </div>
  )
}
```

**Features**:
- Traps Tab/Shift+Tab within modal
- Returns focus to trigger element on close
- Automatically focuses first focusable element

### 4. Keyboard Navigation

All interactive elements support keyboard navigation:

#### Standard Keys

- **Tab**: Move to next focusable element
- **Shift + Tab**: Move to previous element
- **Enter**: Activate buttons and links
- **Space**: Activate buttons
- **Escape**: Close modals and menus
- **Arrow Keys**: Navigate within menus and lists

#### Custom Navigation

```typescript
import { KeyboardKeys, isActivationKey } from '@/lib/accessibility'

function CustomButton({ onClick }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isActivationKey(e.key)) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label="Custom action"
    >
      Click me
    </div>
  )
}
```

### 5. ARIA Attributes

#### Semantic HTML First

Always use semantic HTML before ARIA:

```typescript
// ✅ Good: Semantic HTML
<button onClick={handleClick}>Submit</button>

// ❌ Bad: Div with ARIA
<div role="button" tabIndex={0} onClick={handleClick}>Submit</div>
```

#### Common ARIA Patterns

**Buttons**:
```typescript
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
  aria-expanded={isExpanded}
>
  X
</button>
```

**Forms**:
```typescript
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? 'email-error' : undefined}
/>
{hasError && <p id="email-error" role="alert">Invalid email</p>}
```

**Loading States**:
```typescript
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

**Navigation**:
```typescript
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

## Accessibility Utilities

### Focus Management

```typescript
import {
  getFocusableElements,
  isFocusable,
  FocusTrap,
} from '@/lib/accessibility'

// Get all focusable elements in container
const focusableEls = getFocusableElements(containerEl)

// Check if element is focusable
if (isFocusable(element)) {
  element.focus()
}

// Create focus trap
const trap = new FocusTrap(modalEl)
trap.activate()
// Later...
trap.deactivate()
```

### User Preferences

```typescript
import {
  prefersReducedMotion,
  prefersDarkMode,
  prefersHighContrast,
} from '@/lib/accessibility'

// Respect user preferences
if (prefersReducedMotion()) {
  // Disable or reduce animations
  animationDuration = 0
}

if (prefersHighContrast()) {
  // Increase contrast
  borderWidth = '2px'
}
```

### Color Contrast

```typescript
import { meetsContrastRequirement } from '@/lib/accessibility'

// Check if colors meet WCAG AA (4.5:1)
const isAccessible = meetsContrastRequirement('#000000', '#ffffff', 'AA')

// Check for AAA compliance (7:1)
const isHighlyAccessible = meetsContrastRequirement('#000000', '#ffffff', 'AAA')
```

### Keyboard Helpers

```typescript
import { KeyboardKeys, isActivationKey, isNavigationKey } from '@/lib/accessibility'

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === KeyboardKeys.ESCAPE) {
    closeModal()
  }

  if (isActivationKey(e.key)) {
    activateItem()
  }

  if (isNavigationKey(e.key)) {
    navigateMenu(e.key)
  }
}
```

## Best Practices

### 1. Semantic HTML

Use proper HTML elements:

```typescript
// ✅ Good
<button>Submit</button>
<nav><ul><li><a href="/">Home</a></li></ul></nav>
<main>Content</main>
<header>Header</header>
<footer>Footer</footer>

// ❌ Bad
<div onClick={submit}>Submit</div>
<div className="nav">Links</div>
<div>Content</div>
```

### 2. Labels and Descriptions

Every input needs a label:

```typescript
// ✅ Good: Visible label
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ✅ Good: aria-label for icon buttons
<button aria-label="Close">
  <X />
</button>

// ❌ Bad: No label
<input type="text" placeholder="Name" />
```

### 3. Focus Indicators

Never remove focus indicators:

```css
/* ❌ Bad */
button:focus {
  outline: none;
}

/* ✅ Good */
button:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}
```

### 4. Alt Text for Images

```typescript
// ✅ Good: Descriptive alt text
<Image src="/chart.png" alt="Sales increased 50% in Q4" />

// ✅ Good: Decorative image
<Image src="/decoration.png" alt="" />

// ❌ Bad: No alt or generic alt
<Image src="/chart.png" alt="image" />
```

### 5. Heading Hierarchy

Maintain proper heading order:

```typescript
// ✅ Good
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

// ❌ Bad: Skipping levels
<h1>Page Title</h1>
<h3>Section</h3>
```

### 6. Color and Contrast

Don't rely on color alone:

```typescript
// ❌ Bad: Color only
<span style={{ color: 'red' }}>Error</span>

// ✅ Good: Icon + color + text
<span className="text-red-600 flex items-center gap-2">
  <ErrorIcon />
  <span>Error: Invalid input</span>
</span>
```

### 7. Form Validation

Provide clear error messages:

```typescript
<form>
  <label htmlFor="email">Email *</label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby="email-error"
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-red-600">
      {errors.email}
    </p>
  )}
</form>
```

### 8. Loading States

Announce loading to screen readers:

```typescript
{isLoading && (
  <div role="status" aria-live="polite">
    <span className="sr-only">Loading...</span>
    <Spinner />
  </div>
)}
```

### 9. Modals and Dialogs

Proper dialog implementation:

```typescript
import { useFocusTrap } from '@/hooks/useFocusTrap'

function Dialog({ isOpen, onClose, title, children }) {
  const containerRef = useFocusTrap(isOpen)

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white p-6 rounded-lg">
        <h2 id="dialog-title">{title}</h2>
        {children}
        <button onClick={onClose} aria-label="Close dialog">
          Close
        </button>
      </div>
    </div>
  )
}
```

## Testing for Accessibility

### 1. Keyboard Navigation

Test all interactions with keyboard only:

1. **Tab**: Can reach all interactive elements
2. **Shift + Tab**: Can navigate backwards
3. **Enter/Space**: Can activate buttons
4. **Escape**: Can close modals
5. **Arrows**: Can navigate menus

**No mouse allowed!**

### 2. Screen Reader Testing

#### macOS VoiceOver

```bash
# Enable VoiceOver
Cmd + F5

# Navigate
Control + Option + Arrow Keys

# Interact
Control + Option + Space
```

#### Windows NVDA (Free)

Download from [nvaccess.org](https://www.nvaccess.org/)

```
# Navigate
Arrow Keys

# Activate
Enter
```

### 3. Automated Testing Tools

#### axe DevTools (Browser Extension)

1. Install axe DevTools extension
2. Open DevTools
3. Go to axe DevTools tab
4. Click "Scan ALL of my page"

#### Lighthouse (Built into Chrome)

1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility"
4. Click "Generate report"

Target: **90+ score**

#### ESLint Plugin

```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

```json
// .eslintrc.json
{
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

### 4. Manual Checks

- [ ] All images have alt text
- [ ] All inputs have labels
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators are visible
- [ ] Page can be navigated with keyboard
- [ ] Content is in logical order
- [ ] Headings are in proper hierarchy
- [ ] Forms show clear error messages
- [ ] Loading states are announced
- [ ] Modals trap focus

## Common Accessibility Issues

### Issue: Links and Buttons

**Problem**: Using divs as buttons

```typescript
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
```

### Issue: Missing Labels

**Problem**: Inputs without labels

```typescript
// ❌ Bad
<input placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Issue: Low Contrast

**Problem**: Text too light on background

```typescript
// ❌ Bad: 2:1 contrast
<p className="text-gray-400 bg-gray-100">Text</p>

// ✅ Good: 7:1 contrast
<p className="text-gray-900 bg-white">Text</p>
```

### Issue: Click-only Actions

**Problem**: No keyboard support

```typescript
// ❌ Bad
<div onClick={handleClick}>Action</div>

// ✅ Good
<button onClick={handleClick}>Action</button>

// ✅ Also good: Custom element with keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => isActivationKey(e.key) && handleClick()}
>
  Action
</div>
```

## Checklist for New Features

Before shipping:

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible and clear
- [ ] Color contrast meets WCAG AA standards
- [ ] All images have appropriate alt text
- [ ] Form inputs have associated labels
- [ ] Error messages are clear and announced
- [ ] Loading states are indicated
- [ ] Headings are in logical order
- [ ] ARIA attributes are used correctly
- [ ] Tested with keyboard only
- [ ] Tested with screen reader
- [ ] Ran axe DevTools scan (no violations)
- [ ] Lighthouse accessibility score 90+

## Resources

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [NVDA Screen Reader](https://www.nvaccess.org/) - Free for Windows

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/) - Accessibility resources
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Learning

- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)
- [Microsoft Inclusive Design](https://www.microsoft.com/design/inclusive/)
- [A11y Project](https://www.a11yproject.com/)

## Support

For accessibility issues or questions:

1. Review this guide
2. Check [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
3. Test with automated tools (axe, Lighthouse)
4. Test with actual screen readers
5. File an accessibility issue on GitHub

## Commitment

Accessibility is not a feature—it's a fundamental requirement. We are committed to:

- Maintaining WCAG 2.1 Level AA compliance
- Regular accessibility audits
- Addressing accessibility issues promptly
- Including accessibility in design and development process
- Testing with assistive technologies
- Listening to user feedback

**Everyone deserves equal access to legal technology.**

---

Last updated: December 2024
