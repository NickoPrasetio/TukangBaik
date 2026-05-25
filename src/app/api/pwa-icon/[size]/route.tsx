import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size: sizeStr } = await params;
  const size = Math.min(Math.max(parseInt(sizeStr, 10) || 192, 16), 1024);
  const radius = Math.round(size * 0.2);
  const fontSize = Math.round(size * 0.42);
  const subSize = Math.round(size * 0.22);

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
          borderRadius: `${radius}px`,
          gap: `${Math.round(size * 0.02)}px`,
        }}
      >
        {/* Hammer icon using shapes */}
        <div style={{ display: 'flex', position: 'relative', width: `${Math.round(size * 0.55)}px`, height: `${Math.round(size * 0.55)}px` }}>
          {/* Handle */}
          <div
            style={{
              position: 'absolute',
              background: 'rgba(255,255,255,0.9)',
              width: `${Math.round(size * 0.12)}px`,
              height: `${Math.round(size * 0.38)}px`,
              borderRadius: '9999px',
              bottom: '4%',
              right: '10%',
              transform: 'rotate(-40deg)',
              transformOrigin: 'bottom right',
            }}
          />
          {/* Head */}
          <div
            style={{
              position: 'absolute',
              background: 'white',
              width: `${Math.round(size * 0.36)}px`,
              height: `${Math.round(size * 0.18)}px`,
              borderRadius: `${Math.round(size * 0.04)}px`,
              top: '10%',
              left: '5%',
              transform: 'rotate(-40deg)',
              transformOrigin: 'center',
            }}
          />
        </div>
        {/* "TB" text */}
        <div
          style={{
            fontFamily: '"Arial Black", Arial, sans-serif',
            fontWeight: 900,
            fontSize: `${subSize}px`,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: `${Math.round(size * 0.01)}px`,
            lineHeight: 1,
          }}
        >
          TUKANGBAIK
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
