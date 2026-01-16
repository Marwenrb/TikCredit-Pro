# 📧 Email Setup Documentation for TikCredit Pro

## Overview
This guide explains how to configure email notifications for loan submissions in **TikCredit Pro**. In development mode emails are logged to the console with a `[DEV]` prefix. In production real emails are sent to the configured recipient.

---

## 1. Choose an Email Provider
You can use any transactional email service that provides an SMTP endpoint or an HTTP API. Popular choices:
- **Resend** (simple API, free tier)
- **SendGrid**
- **Mailgun**
- **SMTP** (e.g., Gmail, Outlook)

## 2. Install the Required Package
```bash
# Example using Resend (recommended)
npm i @resend/resend
# Or using nodemailer for SMTP
npm i nodemailer
```

## 3. Environment Variables
Create a `.env.local` (development) and `.env.production` (production) file at the project root and add the following variables:
```dotenv
# General
NEXT_PUBLIC_APP_NAME="TikCredit Pro"

# Email provider selection (optional, defaults to RESEND)
EMAIL_PROVIDER="RESEND"   # or SENDGRID, SMTP

# Resend API key
RESEND_API_KEY=your_resend_api_key

# SendGrid API key (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# SMTP configuration (if using SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Recipient address (the finance team)
FINANCE_EMAIL=weshcredit@gmail.com
```
> **Important:** Never commit these files to version control. Add them to `.gitignore`.

## 4. Configure the Email Service (src/lib/email.ts)
Create a small helper module that abstracts the provider:
```ts
// src/lib/email.ts
import { Resend } from '@resend/resend';
import nodemailer from 'nodemailer';

const provider = process.env.EMAIL_PROVIDER ?? 'RESEND';

export async function sendSubmissionEmail(data: {
  name: string;
  amount: number;
  loanDuration: number;
  requestId: string;
  date: string;
}) {
  const subject = `📋 طلب تمويل جديد – ${data.name} – ${new Intl.NumberFormat('ar-DZ').format(data.amount)} د.ج – ${data.loanDuration} شهر`;
  const body = `=== طلب تمويل جديد ===\n\n📅 التاريخ: ${data.date}\n🔑 رقم الطلب: ${data.requestId}\n👤 الاسم: ${data.name}\n💰 المبلغ: ${new Intl.NumberFormat('ar-DZ').format(data.amount)} د.ج\n⏳ مدة القرض: ${data.loanDuration} شهر`;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV] Email would be sent:', { to: process.env.FINANCE_EMAIL, subject, body });
    return;
  }

  if (provider === 'RESEND') {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: 'TikCredit Pro <no-reply@tikcredit.pro>',
      to: process.env.FINANCE_EMAIL!,
      subject,
      html: `<pre>${body}</pre>`,
    });
  } else if (provider === 'SENDGRID') {
    // Implement SendGrid API call here
  } else if (provider === 'SMTP') {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: 'TikCredit Pro <no-reply@tikcredit.pro>',
      to: process.env.FINANCE_EMAIL!,
      subject,
      text: body,
    });
  }
}
```
> Keep this file **outside** of the public bundle (it lives in `src/lib`).

## 5. Hook the Email into the Submission Flow
In `src/lib/eliteSubmissionManager.ts` (or wherever the form is processed), import and call the helper after a successful Firestore write:
```ts
import { sendSubmissionEmail } from '@/lib/email';

// after saving submission
await sendSubmissionEmail({
  name: formData.fullName,
  amount: formData.requestedAmount,
  loanDuration: formData.loanDuration,
  requestId: submission.id,
  date: new Date().toLocaleString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false }),
});
```
The existing toast messages will still show the success UI; the email will be sent silently.

## 6. Testing
1. **Development** – run `npm run dev`. Submit a form and check the console for a `[DEV] Email would be sent:` log.
2. **Staging/Production** – set `NODE_ENV=production` and provide real API keys. Submit a form and verify the email arrives in `FINANCE_EMAIL`.

## 7. Common Pitfalls
- **Missing env vars** – the function will throw if the required key is undefined. Double‑check `.env` files.
- **Rate limits** – free tiers often have daily limits. Monitor usage on the provider dashboard.
- **Spam filters** – use a verified domain (`no-reply@tikcredit.pro`) and add SPF/DKIM records if using SMTP.

---

## 8. Quick Checklist
- [ ] Install provider package (`@resend/resend` or `nodemailer`).
- [ ] Add env vars (`RESEND_API_KEY`, `FINANCE_EMAIL`, etc.).
- [ ] Create `src/lib/email.ts` with the code above.
- [ ] Call `sendSubmissionEmail` after a successful submission.
- [ ] Test in dev (console log) and prod (real email).

**Your project is now ready to send real loan‑request notifications via email!**
