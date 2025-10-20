import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  // Load PT Sans fonts
  const fontRegular = fetch(
    new URL('../../../public/fonts/PTSans-Regular.ttf', import.meta.url),
  ).then(res => res.arrayBuffer());

  const fontBold = fetch(
    new URL('../../../public/fonts/PTSans-Bold.ttf', import.meta.url),
  ).then(res => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Top Section with Logo and Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '60px 80px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path d="M20 3v4" />
              <path d="M22 5h-4" />
              <path d="M4 17v2" />
              <path d="M5 18H3" />
            </svg>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 700,
                fontFamily: 'PT Sans',
                color: 'white',
                marginLeft: '12px',
              }}
            >
              PayKit
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#22c55e',
              padding: '8px 20px',
              borderRadius: '999px',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontFamily: 'PT Sans',
                fontWeight: 700,
                color: '#000',
              }}
            >
              Open Source
            </span>
          </div>
        </div>

        {/* Main Content - Controversial Statement */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            padding: '0 80px',
            marginTop: '-60px',
          }}
        >
          {/* Strikethrough text */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                fontFamily: 'PT Sans',
                color: '#71717a',
                textDecoration: 'line-through',
                textDecorationColor: '#ef4444',
                textDecorationThickness: '4px',
              }}
            >
              Locked into Stripe forever?
            </div>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontSize: '80px',
              fontWeight: 700,
              fontFamily: 'PT Sans',
              color: 'white',
              marginBottom: '32px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Switch providers
            <br />
            <span
              style={{
                background: 'linear-gradient(to right, #2563eb, #9333ea, #db2777)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              in one line of code.
            </span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontSize: '28px',
              fontFamily: 'PT Sans',
              color: '#a1a1aa',
              maxWidth: '800px',
              lineHeight: 1.5,
            }}
          >
            Stop being held hostage by your payment provider.
            <br />
            Build once, deploy anywhere.
          </p>
        </div>

        {/* Bottom Badge */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            padding: '0 80px 60px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 24px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span style={{ fontSize: '18px', fontFamily: 'PT Sans', color: '#a1a1aa' }}>
              TypeScript • React • Node.js
            </span>
          </div>
          <span style={{ fontSize: '18px', fontFamily: 'PT Sans', color: '#52525b' }}>
            usepaykit.dev
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'PT Sans',
          data: await fontRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'PT Sans',
          data: await fontBold,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );
}
