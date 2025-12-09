# Authentication Setup Guide

This guide explains how to set up and use authentication in DafLegal.

## 🎯 Current Implementation

DafLegal uses **NextAuth.js v5** (Auth.js) for authentication with:
- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ JWT-based sessions
- ✅ Protected routes with middleware
- ✅ Beautiful sign-in/sign-up pages
- ✅ User dashboard
- ✅ Session management

## 🔑 Demo Credentials

For testing, use these demo credentials:
- **Email**: `demo@daflegal.com`
- **Password**: `demo123`

## 🚀 Environment Setup

### Required Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional but recommended)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Or use this Node.js command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://daflegal.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

## 📁 File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/
│   │   │   └── route.ts           # NextAuth API routes
│   │   ├── auth/
│   │   │   ├── signin/page.tsx    # Sign in page
│   │   │   └── signup/page.tsx    # Sign up page
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Protected dashboard
│   │   └── layout.tsx             # Root layout with AuthProvider
│   ├── components/
│   │   ├── Providers.tsx          # SessionProvider wrapper
│   │   └── UserMenu.tsx           # User dropdown menu
│   ├── lib/
│   │   └── auth.ts                # NextAuth configuration
│   └── middleware.ts              # Route protection
```

## 🔐 Authentication Flow

### Sign In Process

1. User visits `/auth/signin`
2. Enters credentials or clicks "Sign in with Google"
3. NextAuth validates credentials
4. On success, creates JWT session
5. Redirects to `/dashboard`

### Sign Up Process

1. User visits `/auth/signup`
2. Enters details (name, email, password)
3. **Note**: Currently in demo mode
4. In production, would create user in database
5. Auto-signs in after successful registration

### Protected Routes

Routes in `middleware.ts` config require authentication:
- `/dashboard/*` - User dashboard
- `/settings/*` - User settings
- `/profile/*` - User profile

Unauthenticated users are redirected to `/auth/signin`

## 🛠️ Customization

### Adding New OAuth Providers

Edit `src/lib/auth.ts` to add providers:

```tsx
import GitHubProvider from 'next-auth/providers/github'
import LinkedInProvider from 'next-auth/providers/linkedin'

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({...}),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    // ... other providers
  ],
}
```

Supported providers:
- GitHub
- GitLab
- Facebook
- Twitter/X
- LinkedIn
- Microsoft
- Apple
- And 80+ more!

### Customizing Sign In Page

Edit `src/app/auth/signin/page.tsx`:

```tsx
// Change logo
<img src="/your-logo.png" alt="Your App" />

// Change colors
className="bg-[#yourcolor]"

// Add social providers
<button onClick={() => signIn('github')}>
  Sign in with GitHub
</button>
```

### Customizing Dashboard

Edit `src/app/dashboard/page.tsx` to add:
- Recent activity feed
- Usage statistics
- Quick actions
- Notifications
- Team members list

## 🗄️ Database Integration

### Current State: Demo Mode

The app currently uses in-memory authentication (demo credentials only).

### Production Setup with Database

#### 1. Install Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

#### 2. Initialize Prisma

```bash
npx prisma init
```

#### 3. Define Schema

Edit `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 4. Update Auth Config

```tsx
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  // ... rest of config
}
```

#### 5. Implement Signup API

Create `src/app/api/auth/register/route.ts`:

```tsx
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { email }
    })

    if (exists) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
```

## 🔒 Security Best Practices

### 1. Password Requirements

Enforce strong passwords in signup:

```tsx
const validatePassword = (password: string) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasNonalphas = /\W/.test(password)

  if (password.length < minLength) {
    return 'Password must be at least 8 characters'
  }
  if (!hasUpperCase || !hasLowerCase) {
    return 'Password must contain uppercase and lowercase letters'
  }
  if (!hasNumbers) {
    return 'Password must contain at least one number'
  }
  return null
}
```

### 2. Rate Limiting

Prevent brute force attacks:

```tsx
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
})
```

### 3. Email Verification

Add email verification:

```tsx
// Generate verification token
const token = crypto.randomBytes(32).toString('hex')

// Send verification email
await sendVerificationEmail(user.email, token)

// Verify on callback
const verified = await verifyToken(token)
```

### 4. Two-Factor Authentication

Add 2FA:

```bash
npm install speakeasy qrcode
```

```tsx
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

// Generate secret
const secret = speakeasy.generateSecret({
  name: 'DafLegal'
})

// Generate QR code
const qrCode = await QRCode.toDataURL(secret.otpauth_url)

// Verify token
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userInputCode
})
```

## 📊 User Management

### Getting Current User

In Server Components:

```tsx
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return <div>Hello {session.user.name}</div>
}
```

In Client Components:

```tsx
'use client'
import { useSession } from 'next-auth/react'

export function Component() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Loading />
  if (!session) return <SignInPrompt />

  return <div>Hello {session.user.name}</div>
}
```

### Updating User Profile

```tsx
// API route: /api/user/profile
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, image } = await req.json()

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, image }
  })

  return NextResponse.json({ user: updated })
}
```

## 🎨 UI Components

### Protected Link

Create a component that shows different UI based on auth state:

```tsx
'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export function ProtectedLink({ href, children }) {
  const { data: session } = useSession()

  if (!session) {
    return <Link href="/auth/signin">Sign in to access</Link>
  }

  return <Link href={href}>{children}</Link>
}
```

### Loading State

```tsx
'use client'
import { useSession } from 'next-auth/react'

export function AuthGuard({ children }) {
  const { status } = useSession()

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  return children
}
```

## 🧪 Testing

### Test Demo Login

1. Visit `http://localhost:3000/auth/signin`
2. Enter demo credentials
3. Should redirect to `/dashboard`
4. User menu should appear in navigation
5. Click "Sign out" to test logout

### Test Protected Routes

1. Visit `http://localhost:3000/dashboard` while logged out
2. Should redirect to `/auth/signin`
3. Sign in
4. Should redirect back to `/dashboard`

### Test OAuth

1. Click "Sign in with Google"
2. Complete Google auth flow
3. Should redirect to `/dashboard`
4. User info should be populated from Google

## 📈 Analytics Integration

Track auth events:

```tsx
import { trackButtonClick } from '@/components/Analytics'

// Track sign in
trackButtonClick('sign_in_success', 'auth')

// Track sign up
trackButtonClick('sign_up_success', 'auth')

// Track OAuth provider
trackButtonClick(`sign_in_${provider}`, 'auth')
```

## 🐛 Troubleshooting

### "NEXTAUTH_SECRET is not defined"

Add to `.env.local`:
```bash
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### "Redirect URI mismatch" (Google OAuth)

1. Check authorized redirect URIs in Google Console
2. Must match exactly: `http://localhost:3000/api/auth/callback/google`
3. No trailing slash

### Session not persisting

1. Check cookies are enabled
2. Verify NEXTAUTH_URL matches your domain
3. Clear browser cookies and try again

### Middleware not protecting routes

1. Check `middleware.ts` matcher config
2. Ensure middleware file is in `src/` root
3. Restart dev server

## 🚀 Production Deployment

### Checklist

- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Set production NEXTAUTH_URL
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set up database (if using)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up email service for notifications
- [ ] Add rate limiting
- [ ] Enable logging and monitoring
- [ ] Test all auth flows in production

### Environment Variables

```bash
# Production .env
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://daflegal.com
GOOGLE_CLIENT_ID=<prod-client-id>
GOOGLE_CLIENT_SECRET=<prod-client-secret>
DATABASE_URL=<your-database-url>
```

## 📚 Resources

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Auth.js Docs](https://authjs.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [OAuth Providers](https://next-auth.js.org/providers/)

---

**Need Help?** Contact dev@daflegal.com or check the docs above.
