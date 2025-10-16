import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get dynamic parameters
    const title = searchParams.get('title') || 'Crafted Anomaly';
    const subtitle = searchParams.get('subtitle') || 'Design Studio';

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #0b0b0c 0%, #151517 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background decorative elements */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '200px',
              height: '200px',
              background: 'rgba(232, 255, 58, 0.1)',
              borderRadius: '50%',
              filter: 'blur(40px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              right: '15%',
              width: '150px',
              height: '150px',
              background: 'rgba(232, 255, 58, 0.05)',
              borderRadius: '50%',
              filter: 'blur(30px)',
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 20 ? '48px' : '64px',
                fontWeight: 'bold',
                color: '#e8ff3a',
                margin: '0 0 16px 0',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>

            {/* Accent line */}
            <div
              style={{
                width: '120px',
                height: '4px',
                background: '#e8ff3a',
                borderRadius: '2px',
                margin: '0 0 24px 0',
              }}
            />

            {/* Subtitle */}
            <p
              style={{
                fontSize: '28px',
                color: '#e6e6e6',
                margin: '0',
                opacity: 0.9,
                fontWeight: '500',
              }}
            >
              {subtitle}
            </p>

            {/* Bottom tagline */}
            <p
              style={{
                fontSize: '18px',
                color: '#9aa0a6',
                margin: '32px 0 0 0',
                opacity: 0.8,
              }}
            >
              Transforming visions into tangible experiences
            </p>
          </div>

          {/* Brand mark - bottom right */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                background: '#e8ff3a',
                borderRadius: '50%',
              }}
            />
            <span
              style={{
                color: '#9aa0a6',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              craftedanomaly.com
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
