import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get admin email from site settings
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: settings } = await supabase
      .from('site_settings')
      .select('admin_email, site_name')
      .limit(1)
      .single();

    const adminEmail = settings?.admin_email || process.env.ADMIN_EMAIL || 'admin@craftedanomaly.com';
    const siteName = settings?.site_name || 'Crafted Anomaly';

    // Send email to admin
    const { data, error } = await resend.emails.send({
      from: `${siteName} Contact Form <onboarding@resend.dev>`, // Resend verified domain
      to: [adminEmail],
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #0b0b0c 0%, #1a1a1c 100%);
                color: #e8ff3a;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .field {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f0f0f0;
              }
              .field:last-child {
                border-bottom: none;
              }
              .label {
                font-weight: 600;
                color: #666;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .value {
                color: #333;
                font-size: 16px;
              }
              .message-box {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 6px;
                border-left: 4px solid #e8ff3a;
                margin-top: 10px;
                white-space: pre-wrap;
              }
              .footer {
                background: #f5f5f5;
                padding: 20px;
                border-radius: 0 0 8px 8px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
              .button {
                display: inline-block;
                background: #e8ff3a;
                color: #0b0b0c;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">From</div>
                <div class="value"><strong>${name}</strong></div>
              </div>
              
              <div class="field">
                <div class="label">Email</div>
                <div class="value">
                  <a href="mailto:${email}" style="color: #e8ff3a; text-decoration: none;">${email}</a>
                </div>
              </div>
              
              <div class="field">
                <div class="label">Subject</div>
                <div class="value">${subject}</div>
              </div>
              
              <div class="field">
                <div class="label">Message</div>
                <div class="message-box">${message}</div>
              </div>
              
              <a href="mailto:${email}" class="button">Reply to ${name}</a>
            </div>
            <div class="footer">
              <p>This message was sent via the contact form on ${siteName}</p>
              <p style="margin-top: 10px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/messages" style="color: #666;">View in Admin Panel</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
