# Email Marketing Setup Guide

This guide explains how to set up email marketing and newsletter functionality for DafLegal.

## 🎯 Current Implementation

DafLegal includes a newsletter signup system with:
- ✅ Newsletter signup component (3 variants: default, footer, inline)
- ✅ API endpoint for subscriptions
- ✅ Email validation
- ✅ Success/error handling
- ✅ Analytics tracking
- ✅ Demo mode for testing

## 📧 Newsletter Signup Variants

### 1. Default Variant (Full Section)
Large, prominent signup section with icon and benefits list.
```tsx
<NewsletterSignup />
```

### 2. Footer Variant (Compact)
Compact version for footer placement.
```tsx
<NewsletterSignup variant="footer" />
```

### 3. Inline Variant (Content)
Inline version for blog posts or content pages.
```tsx
<NewsletterSignup variant="inline" />
```

## 🔧 Email Service Provider Integration

### Option 1: Mailchimp (Recommended for Beginners)

**Why Mailchimp:**
- Free up to 500 subscribers
- Easy to use interface
- Drag-and-drop email builder
- Built-in templates
- Pricing: Free tier, then $13/month

**Setup:**

1. Create account at [mailchimp.com](https://mailchimp.com)
2. Create an audience/list
3. Get API credentials:
   - Go to Account > Extras > API keys
   - Create new API key
   - Note your data center (e.g., `us19`)
4. Add to `.env.local`:

```bash
MAILCHIMP_API_KEY=your-api-key-here
MAILCHIMP_LIST_ID=your-list-id
MAILCHIMP_DC=us19
```

5. Update `src/app/api/newsletter/subscribe/route.ts`:

```typescript
const response = await fetch(
  `https://${process.env.MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`anystring:${process.env.MAILCHIMP_API_KEY}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        SOURCE: 'website',
        SIGNUP_DATE: new Date().toISOString(),
      },
    }),
  }
)
```

### Option 2: SendGrid

**Why SendGrid:**
- Transactional emails
- 100 emails/day free
- Powerful API
- Email templates
- Pricing: Free tier, then $19.95/month

**Setup:**

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Create API key: Settings > API Keys
3. Verify sender identity
4. Add to `.env.local`:

```bash
SENDGRID_API_KEY=your-api-key
```

5. Install SDK:

```bash
npm install @sendgrid/client @sendgrid/mail
```

6. Update API route:

```typescript
import sgClient from '@sendgrid/client'
import sgMail from '@sendgrid/mail'

sgClient.setApiKey(process.env.SENDGRID_API_KEY!)
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// Add to contact list
await sgClient.request({
  method: 'PUT',
  url: '/v3/marketing/contacts',
  body: {
    list_ids: [process.env.SENDGRID_LIST_ID],
    contacts: [{ email }]
  }
})

// Send welcome email
await sgMail.send({
  to: email,
  from: 'hello@daflegal.com',
  templateId: 'd-xyz123', // Your template ID
  dynamicTemplateData: {
    subject: 'Welcome to DafLegal Newsletter!',
  }
})
```

### Option 3: ConvertKit

**Why ConvertKit:**
- Built for creators
- Simple automation
- Landing pages included
- Email sequences
- Pricing: Free up to 300 subscribers, then $15/month

**Setup:**

1. Create account at [convertkit.com](https://convertkit.com)
2. Get API secret: Settings > Advanced > API Secret
3. Add to `.env.local`:

```bash
CONVERTKIT_API_SECRET=your-api-secret
CONVERTKIT_FORM_ID=your-form-id
```

4. Update API route:

```typescript
const response = await fetch(
  `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_secret: process.env.CONVERTKIT_API_SECRET,
      email: email,
      fields: {
        source: 'website'
      }
    })
  }
)
```

### Option 4: Resend (Modern Alternative)

**Why Resend:**
- Developer-friendly
- Beautiful emails with React
- 3,000 emails/month free
- Simple API
- Pricing: Free tier, then $20/month

**Setup:**

1. Create account at [resend.com](https://resend.com)
2. Get API key
3. Add to `.env.local`:

```bash
RESEND_API_KEY=re_123456789
```

4. Install SDK:

```bash
npm install resend
```

5. Update API route:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Add to audience
await resend.contacts.create({
  email: email,
  audienceId: 'your-audience-id'
})

// Send welcome email
await resend.emails.send({
  from: 'DafLegal <hello@daflegal.com>',
  to: email,
  subject: 'Welcome to DafLegal!',
  react: WelcomeEmail({ name: email.split('@')[0] })
})
```

## 📝 Email Templates

### Welcome Email

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2d5a2d, #1a2e1a); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #f5edd8; }
    .button { display: inline-block; padding: 12px 30px; background: #d4a561; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to DafLegal! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>Thanks for subscribing to the DafLegal newsletter! You're now part of a community of 5,000+ legal professionals staying ahead of legal tech trends.</p>
      <p><strong>Here's what to expect:</strong></p>
      <ul>
        <li>Weekly insights on AI and legal technology</li>
        <li>Contract analysis best practices</li>
        <li>Product updates and new features</li>
        <li>Exclusive tips from legal tech experts</li>
      </ul>
      <p>Ready to transform your legal workflow?</p>
      <a href="https://daflegal.com/auth/signup" class="button">Start Your Free Trial →</a>
      <p>Best regards,<br>The DafLegal Team</p>
    </div>
    <div class="footer">
      <p>DafLegal - AI-Powered Legal Assistant</p>
      <p><a href="https://daflegal.com">Website</a> | <a href="https://daflegal.com/blog">Blog</a> | <a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
```

### Weekly Newsletter Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Legal Tech Weekly 📰</h1>
      <p>Week of [DATE]</p>
    </div>
    <div class="content">
      <h2>This Week's Top Story</h2>
      <img src="[FEATURED_IMAGE]" alt="Featured" style="width: 100%; border-radius: 8px; margin: 15px 0;">
      <h3>[ARTICLE_TITLE]</h3>
      <p>[ARTICLE_EXCERPT]</p>
      <a href="[ARTICLE_URL]" class="button">Read More →</a>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <h2>More from the Blog</h2>
      <ul>
        <li><a href="[URL]">[TITLE]</a></li>
        <li><a href="[URL]">[TITLE]</a></li>
        <li><a href="[URL]">[TITLE]</a></li>
      </ul>

      <h2>Product Update</h2>
      <p>[UPDATE_CONTENT]</p>

      <h2>Quick Tip</h2>
      <p><strong>[TIP_TITLE]:</strong> [TIP_CONTENT]</p>
    </div>
    <div class="footer">
      <p>You're receiving this because you subscribed to DafLegal updates.</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">Update preferences</a></p>
    </div>
  </div>
</body>
</html>
```

## 🤖 Automation Workflows

### Welcome Sequence

1. **Immediate:** Welcome email
2. **Day 1:** "Getting Started with DafLegal"
3. **Day 3:** "Top 5 Contract Analysis Tips"
4. **Day 7:** "Join Our Free Trial" (if not signed up)
5. **Day 14:** Case study or success story

### Re-engagement Campaign

For inactive subscribers (90+ days):
1. "We miss you!" email
2. "What's new in legal tech" roundup
3. Special offer or exclusive content
4. Final "Stay subscribed?" email

## 📊 Tracking & Analytics

The newsletter component automatically tracks:
- `newsletter_subscribe` event to Google Analytics
- Source page where signup occurred
- Email provider (if using OAuth)

### Additional Tracking

Add UTM parameters to links in emails:

```
https://daflegal.com/blog/article?utm_source=newsletter&utm_medium=email&utm_campaign=weekly
```

Track in email service:
- Open rates
- Click-through rates
- Unsubscribe rates
- Conversion rates

## 🔒 Compliance

### GDPR Compliance

1. **Clear consent:** Checkbox for opt-in
2. **Privacy policy:** Link in signup form
3. **Unsubscribe:** One-click unsubscribe in every email
4. **Data retention:** Delete data upon request

### CAN-SPAM Compliance

1. **Physical address:** Include in footer
2. **Unsubscribe link:** In every email
3. **Accurate subject lines:** No deceptive headers
4. **Clear sender:** Identify as DafLegal

### Implementation

Add to newsletter form:

```tsx
<label className="flex items-center gap-2 text-xs">
  <input type="checkbox" required />
  I agree to receive emails from DafLegal.
  <a href="/privacy" className="underline">Privacy Policy</a>
</label>
```

## 🎨 Best Practices

### Email Content

1. **Personalization:** Use subscriber's name
2. **Value first:** Lead with useful content
3. **Clear CTA:** One primary action per email
4. **Mobile-friendly:** 50%+ opens are mobile
5. **Testing:** A/B test subject lines

### Sending Schedule

- **Frequency:** Weekly or bi-weekly
- **Day:** Tuesday-Thursday perform best
- **Time:** 10 AM - 2 PM in subscriber's timezone
- **Consistency:** Same day/time each week

### Subject Lines

Good examples:
- "5 contract clauses you should never miss"
- "How [Company] saved 65% on legal costs"
- "New: AI-powered compliance checking"

Avoid:
- All caps: "AMAZING NEW FEATURE!!!"
- Spam words: "Free", "Act now", "$$$"
- Misleading: Don't promise what you can't deliver

## 📈 Growth Strategies

### On-site

1. **Exit-intent popup:** Offer newsletter signup
2. **Blog sidebar:** Signup form on every post
3. **Footer:** Always visible signup
4. **Content upgrades:** PDF guides for email

### Off-site

1. **LinkedIn:** Share newsletter in posts
2. **Guest posting:** Include signup link in bio
3. **Partnerships:** Co-marketing with related tools
4. **Webinars:** Collect emails from attendees

## 🧪 Testing

Test your newsletter signup:

1. Visit `http://localhost:3000`
2. Find newsletter signup section
3. Enter your email
4. Should see success message
5. Check console for API call

Test email sending (after integration):

```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 🚀 Production Checklist

- [ ] Choose email service provider
- [ ] Set up account and get API keys
- [ ] Add environment variables
- [ ] Update API route with integration
- [ ] Create email templates
- [ ] Set up welcome email automation
- [ ] Test subscription flow end-to-end
- [ ] Add unsubscribe functionality
- [ ] Include privacy policy and terms
- [ ] Set up tracking and analytics
- [ ] Create first newsletter
- [ ] Schedule sending time

## 📚 Resources

- [Mailchimp API Docs](https://mailchimp.com/developer/)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [ConvertKit API](https://developers.convertkit.com/)
- [Resend Docs](https://resend.com/docs)
- [Email Design Best Practices](https://www.campaignmonitor.com/best-practices/)

---

**Need Help?** Contact dev@daflegal.com or check the email service provider's documentation.
