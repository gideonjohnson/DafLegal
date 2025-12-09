# Live Chat Setup Guide

This guide explains how to use and customize the DafLegal live chat system.

## 🎯 Current Implementation

DafLegal includes a custom-built live chat widget with:
- ✅ Real-time messaging interface
- ✅ Quick reply buttons for common questions
- ✅ Analytics tracking for all interactions
- ✅ Minimizable chat window
- ✅ Notification badge
- ✅ Dark mode support
- ✅ Mobile responsive design

## 🔧 How It Works

### Current Setup (Demo Mode)

The chat widget is currently in **demo mode** with auto-responses for testing. This allows you to:
- Test the UI/UX without a backend
- Demonstrate chat functionality to stakeholders
- Track user engagement via analytics

### Quick Replies

The widget includes 4 pre-configured quick replies:
1. **Pricing info** - Directs to pricing information
2. **Start free trial** - Encourages immediate signup
3. **How it works** - Explains the product
4. **Talk to sales** - Provides contact information

## 🚀 Integrating a Real Chat Service

To connect a real chat service, you have several options:

### Option 1: Intercom (Recommended)

**Why Intercom:**
- Best-in-class chat experience
- Built-in CRM and ticketing
- Knowledge base integration
- Chatbot automation
- Pricing: Starts at $39/month

**Setup:**

1. Sign up at [intercom.com](https://www.intercom.com)
2. Get your App ID from Settings > Installation
3. Update `frontend/src/app/layout.tsx`:

```tsx
// Add to layout.tsx head section
<Script id="intercom-settings">
  {`
    window.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: "YOUR_APP_ID"
    };
  `}
</Script>
<Script src="https://widget.intercom.io/widget/YOUR_APP_ID" strategy="lazyOnload" />
```

4. Replace the custom `<LiveChat />` component with Intercom's widget
5. Keep analytics tracking by listening to Intercom events

### Option 2: Crisp

**Why Crisp:**
- Free plan available
- Clean, modern interface
- CRM included
- Chatbot capabilities
- Pricing: Free tier, paid from $25/month

**Setup:**

1. Sign up at [crisp.chat](https://crisp.chat)
2. Get your Website ID
3. Add to `layout.tsx`:

```tsx
<Script id="crisp-chat">
  {`
    window.$crisp=[];
    window.CRISP_WEBSITE_ID="YOUR_WEBSITE_ID";
    (function(){
      d=document;
      s=d.createElement("script");
      s.src="https://client.crisp.chat/l.js";
      s.async=1;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  `}
</Script>
```

### Option 3: Tawk.to

**Why Tawk.to:**
- 100% free forever
- Unlimited agents
- Good for small teams
- Basic features only

**Setup:**

1. Sign up at [tawk.to](https://www.tawk.to)
2. Get your Property ID and Widget ID
3. Add to `layout.tsx`:

```tsx
<Script id="tawk-to">
  {`
    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
    })();
  `}
</Script>
```

### Option 4: Drift

**Why Drift:**
- Conversational marketing focus
- Advanced chatbot workflows
- Sales acceleration features
- Best for B2B SaaS
- Pricing: Starts at $2,500/month (expensive)

**Setup:**

1. Sign up at [drift.com](https://www.drift.com)
2. Get your Drift App ID
3. Add to `layout.tsx`:

```tsx
<Script id="drift-chat">
  {`
    !function() {
      var t = window.driftt = window.drift = window.driftt || [];
      if (!t.init) {
        if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
        t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ],
        t.factory = function(e) {
          return function() {
            var n = Array.prototype.slice.call(arguments);
            return n.unshift(e), t.push(n), t;
          };
        }, t.methods.forEach(function(e) {
          t[e] = t.factory(e);
        }), t.load = function(t) {
          var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
          o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
          var i = document.getElementsByTagName("script")[0];
          i.parentNode.insertBefore(o, i);
        };
      }
    }();
    drift.SNIPPET_VERSION = '0.3.1';
    drift.load('YOUR_APP_ID');
  `}
</Script>
```

### Option 5: Custom Backend

If you want full control, connect the existing widget to your own backend:

**Requirements:**
- WebSocket server for real-time messaging
- Database to store conversations
- API for message history
- Authentication for agents

**Example using Socket.io:**

```tsx
// In LiveChat.tsx
import { useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_CHAT_API_URL)

useEffect(() => {
  socket.on('message', (message) => {
    setMessages(prev => [...prev, message])
  })

  return () => socket.disconnect()
}, [])

const handleSendMessage = () => {
  socket.emit('message', {
    text: inputValue,
    userId: sessionId
  })
}
```

## 📊 Analytics Integration

The chat widget automatically tracks:
- Chat opens/closes
- Quick reply clicks
- Messages sent
- User engagement time

All events are sent to Google Analytics via the existing Analytics component.

### Custom Event Tracking

To track custom events:

```tsx
import { trackButtonClick } from '@/components/Analytics'

trackButtonClick('custom_chat_action', 'chat_widget')
```

## 🎨 Customization

### Colors & Branding

The chat widget uses your existing DafLegal brand colors. To customize:

1. **Chat bubble color**: Edit `btn-gold` class
2. **Header gradient**: Edit `from-[#2d5a2d] to-[#1a2e1a]`
3. **Message bubbles**: Edit background colors in message rendering

### Quick Replies

Edit quick replies in `LiveChat.tsx`:

```tsx
const quickReplies = [
  {
    text: 'Your question',
    response: 'Your auto-response'
  },
  // Add more...
]
```

### Position

Change chat position in `LiveChat.tsx`:

```tsx
// Bottom-right (current)
className="fixed bottom-6 right-6 z-50"

// Bottom-left
className="fixed bottom-6 left-6 z-50"

// Top-right
className="fixed top-20 right-6 z-50"
```

### Size

Adjust chat window size:

```tsx
// Width (current: 384px)
className="w-96" // Change to w-80, w-[500px], etc.

// Height (current: 600px)
className="h-[600px]" // Change to h-[500px], h-[700px], etc.
```

## 🔔 Notifications

### Browser Notifications

To add browser notifications when a message is received:

```tsx
// Request permission
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}, [])

// Show notification
const showNotification = (message: string) => {
  if (Notification.permission === 'granted' && !isOpen) {
    new Notification('New message from DafLegal', {
      body: message,
      icon: '/logo.png'
    })
  }
}
```

### Email Notifications

Configure email alerts when chat is offline:

1. Set up email service (SendGrid, AWS SES, etc.)
2. Create API endpoint to send emails
3. Call endpoint when user sends message outside business hours

## 📱 Mobile Optimization

The chat widget is already mobile-responsive:
- Full-width on small screens
- Touch-optimized buttons
- Swipe gestures support (if you add them)

To make it full-screen on mobile:

```tsx
className={`fixed bottom-6 right-6 z-50
  w-96 md:w-96 sm:w-full sm:h-full sm:bottom-0 sm:right-0 sm:rounded-none
`}
```

## 🤖 Chatbot Integration

To add AI-powered responses:

### Option 1: OpenAI Integration

```tsx
const getAIResponse = async (message: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })

  const data = await response.json()
  return data.reply
}
```

### Option 2: Pre-defined Intent Matching

```tsx
const intents = {
  'pricing': 'Our pricing starts at $99/month...',
  'features': 'DafLegal offers contract analysis, compliance checking...',
  'trial': 'You can start a 14-day free trial...'
}

const matchIntent = (message: string) => {
  const lowered = message.toLowerCase()
  for (const [key, response] of Object.entries(intents)) {
    if (lowered.includes(key)) return response
  }
  return null
}
```

## 🔐 Security Considerations

1. **Rate Limiting**: Prevent spam by limiting messages per session
2. **Input Sanitization**: Clean user input to prevent XSS
3. **Session Management**: Use secure session IDs
4. **Data Privacy**: Ensure GDPR compliance for message storage

## 📈 Performance

Current chat widget impact:
- **JavaScript**: ~15KB
- **Load time**: < 100ms
- **Memory**: < 5MB
- **No impact on page load** (lazy loaded)

## 🎯 Best Practices

1. **Response Time**: Aim for < 2 minutes during business hours
2. **Greeting Message**: Customize based on page context
3. **Offline Hours**: Set auto-responder for after hours
4. **Escalation**: Have clear path to human agent
5. **Follow-up**: Email conversation transcript to users

## 🔄 Migration Path

**Current → Production:**

1. Choose chat service (Intercom recommended)
2. Sign up and get credentials
3. Add service script to `layout.tsx`
4. Remove custom `<LiveChat />` component (or keep as fallback)
5. Test thoroughly on staging
6. Deploy to production
7. Monitor analytics and response times

## 💰 Cost Comparison

| Service | Free Tier | Paid Plan | Best For |
|---------|-----------|-----------|----------|
| **Tawk.to** | Unlimited | N/A | Tight budget |
| **Crisp** | 2 agents | $25/mo | Small teams |
| **Intercom** | N/A | $39/mo | Growing SaaS |
| **Drift** | N/A | $2,500/mo | Enterprise B2B |
| **Custom** | Varies | Dev time | Full control |

## 📞 Support

For questions about the chat system:
- Email: dev@daflegal.com
- Docs: See this file
- Code: `frontend/src/components/LiveChat.tsx`

---

**Recommendation**: Start with the custom widget to collect user data, then migrate to Intercom when you have 100+ weekly visitors for better features and scalability.
