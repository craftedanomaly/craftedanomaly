import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Crafted Anomaly - Category';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Category display names
const categoryNames: Record<string, string> = {
  'visual-design': 'Visual Design',
  'spatial-design': 'Spatial Design',
  'films': 'Films',
  'games': 'Games',
  'books': 'Books',
};

export default async function Image({ params }: { params: { category: string } }) {
  const categoryName = categoryNames[params.category] || params.category;

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
            top: '15%',
            left: '15%',
            width: '180px',
            height: '180px',
            background: 'rgba(232, 255, 58, 0.15)',
            borderRadius: '50%',
            filter: 'blur(35px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '25%',
            right: '20%',
            width: '120px',
            height: '120px',
            background: 'rgba(232, 255, 58, 0.08)',
            borderRadius: '50%',
            filter: 'blur(25px)',
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
          {/* Brand name - smaller */}
          <p
            style={{
              fontSize: '24px',
              color: '#9aa0a6',
              margin: '0 0 16px 0',
              fontWeight: '500',
              letterSpacing: '0.05em',
            }}
          >
            CRAFTED ANOMALY
          </p>

          {/* Category name - main focus */}
          <h1
            style={{
              fontSize: categoryName.length > 12 ? '52px' : '64px',
              fontWeight: 'bold',
              color: '#e8ff3a',
              margin: '0 0 16px 0',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            {categoryName}
          </h1>

          {/* Accent line */}
          <div
            style={{
              width: '100px',
              height: '3px',
              background: '#e8ff3a',
              borderRadius: '2px',
              margin: '0 0 24px 0',
            }}
          />

          {/* Subtitle */}
          <p
            style={{
              fontSize: '22px',
              color: '#e6e6e6',
              margin: '0',
              opacity: 0.8,
              fontWeight: '400',
            }}
          >
            Portfolio & Projects
          </p>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '60px',
            right: '60px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: '#9aa0a6',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Design Studio
          </span>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
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
      </div>
    ),
    {
      ...size,
    }
  );
}
