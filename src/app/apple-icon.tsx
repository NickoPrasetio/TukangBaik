import { ImageResponse } from 'next/og';

export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px',
          gap: '4px',
        }}
      >
        {/* Hammer */}
        <div style={{ display: 'flex', position: 'relative', width: '100px', height: '100px' }}>
          <div
            style={{
              position: 'absolute',
              background: 'rgba(255,255,255,0.9)',
              width: '22px',
              height: '68px',
              borderRadius: '9999px',
              bottom: '4%',
              right: '10%',
              transform: 'rotate(-40deg)',
              transformOrigin: 'bottom right',
            }}
          />
          <div
            style={{
              position: 'absolute',
              background: 'white',
              width: '65px',
              height: '32px',
              borderRadius: '8px',
              top: '10%',
              left: '5%',
              transform: 'rotate(-40deg)',
              transformOrigin: 'center',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: '"Arial Black", Arial, sans-serif',
            fontWeight: 900,
            fontSize: '28px',
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '1px',
            lineHeight: 1,
          }}
        >
          TUKANGBAIK
        </div>
      </div>
    ),
    { ...size },
  );
}
