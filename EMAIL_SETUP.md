# 📧 Email Notification Setup Guide

## Overview

The contact form now sends email notifications to the site admin whenever a new message is submitted.

---

## 🔧 Setup Steps

### 1. **Get Resend API Key**

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain `onboarding@resend.dev`)
3. Generate an API key from the dashboard

### 2. **Add to Environment Variables**

Add to your `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
ADMIN_EMAIL=your-email@example.com
```

### 3. **Update Database**

Run the migration to add `admin_email` column:

```sql
-- In Supabase SQL Editor
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS admin_email VARCHAR(255) DEFAULT 'admin@craftedanomaly.com';
```

Or simply run the file:
```bash
# Copy contents of add-admin-email-column.sql and run in Supabase
```

### 4. **Configure Admin Email in Settings**

1. Go to `/admin/settings`
2. Scroll to **"Contact Information"**
3. Set **"Admin Email (Notification Recipient)"**
4. Click **"Save Changes"**

---

## 📨 How It Works

### Contact Form Flow

1. **User submits form** → Data validated with Zod schema
2. **Message saved to database** → `contact_messages` table
3. **Email sent to admin** → Via Resend API
4. **User sees success toast** → "Message sent successfully!"

### Email Template

- **From**: `Crafted Anomaly Contact Form <onboarding@resend.dev>`
- **To**: Admin email from settings or `.env.local`
- **Reply-To**: Customer's email address
- **Subject**: `New Contact Form Submission: [Subject]`
- **Content**: Beautiful HTML email with:
  - Customer name, email, subject
  - Full message
  - Reply button
  - Link to admin panel

### API Route

**Endpoint**: `/api/contact/send`

**Method**: `POST`

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'd like to work with you..."
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_abc123"
}
```

---

## 🎨 Email Design

The email includes:
- ✅ Branded header with Crafted Anomaly colors
- ✅ Formatted contact information
- ✅ Message in a styled box
- ✅ Reply button (mailto link)
- ✅ Link to admin panel
- ✅ Responsive design

---

## 🔒 Security Features

- ✅ **Field validation** with Zod
- ✅ **Rate limiting** (recommended: add rate-limit middleware)
- ✅ **Email validation** before sending
- ✅ **Silent failure** - doesn't break UX if email fails
- ✅ **Reply-To header** for easy responses

---

## 🧪 Testing

### Test with Resend Test Domain

Resend provides a test domain `onboarding@resend.dev`:

1. Use this for testing before setting up your domain
2. Emails sent from this domain work for testing
3. **Note**: Some email providers may mark these as spam

### Verify Email Delivery

1. Submit a test message via `/contact`
2. Check admin email inbox
3. Verify email formatting
4. Test "Reply" button

### Check Admin Panel

1. Go to `/admin/messages`
2. Verify message is saved in database
3. Check status is "unread"

---

## 📊 Monitoring

### View Sent Emails

- Check Resend dashboard for email delivery status
- View bounce rates and opens (if enabled)
- Monitor API usage

### Database Messages

All messages are stored in `contact_messages` table regardless of email status:

```sql
SELECT * FROM contact_messages 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Email Not Sending

1. **Check API key**: Verify `RESEND_API_KEY` is set correctly
2. **Check admin email**: Verify in settings or `.env.local`
3. **Check logs**: Look for errors in terminal/Vercel logs
4. **Check Resend dashboard**: See failed sends and reasons

### Email in Spam

1. **Verify your domain** with Resend
2. **Set up SPF/DKIM** records
3. **Use custom sending domain** instead of `onboarding@resend.dev`

### Silent Failures

The system is designed to fail silently for email errors:

- Message still saves to database ✅
- User still sees success message ✅
- Error logged in console ✅
- Admin notification skipped ❌

This ensures UX isn't broken if Resend is down.

---

## 🚀 Production Recommendations

### 1. Custom Domain

Set up a verified domain in Resend:

```
from: contact@craftedanomaly.com
```

### 2. Rate Limiting

Add rate limiting to prevent spam:

```typescript
// middleware.ts or API route
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});
```

### 3. Email Templates

Consider moving to Resend React Email templates for better maintainability.

### 4. Backup Email

Set multiple recipient emails:

```typescript
to: [
  settings?.admin_email,
  'backup@craftedanomaly.com'
]
```

---

## 📝 Environment Variables Summary

```env
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional (fallback if not set in admin settings)
ADMIN_EMAIL=admin@craftedanomaly.com

# Site URL for email links
NEXT_PUBLIC_SITE_URL=https://craftedanomaly.com
```

---

## ✅ Verification Checklist

- [ ] Resend account created
- [ ] API key added to `.env.local`
- [ ] Database column added (`admin_email`)
- [ ] Admin email configured in `/admin/settings`
- [ ] Test email sent and received
- [ ] Email formatting looks good
- [ ] Reply button works
- [ ] Message saved in database
- [ ] Admin panel shows message

---

## 🎉 Done!

Your contact form now sends beautiful email notifications! 📧✨
