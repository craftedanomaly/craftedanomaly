import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Crafted Anomaly - Design Studio';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#e8ff3a',
              margin: '0 0 16px 0',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            Crafted Anomaly
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
            Design Studio
          </p>

          {/* Categories */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              margin: '32px 0 0 0',
            }}
          >
            {['Visual Design', 'Spatial Design', 'Films', 'Games', 'Books'].map((category, index) => (
              <div
                key={category}
                style={{
                  background: 'rgba(232, 255, 58, 0.1)',
                  color: '#e8ff3a',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {category}
              </div>
            ))}
          </div>
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
      ...size,
    }
  );
}
