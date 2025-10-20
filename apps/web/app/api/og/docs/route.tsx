import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Documentation';
    const description = searchParams.get('description') || 'Learn how to use PayKit';

    // Load PT Sans fonts
    const fontRegular = fetch(
      new URL('../../../../public/fonts/PTSans-Regular.ttf', import.meta.url),
    ).then(res => res.arrayBuffer());

    const fontBold = fetch(
      new URL('../../../../public/fonts/PTSans-Bold.ttf', import.meta.url),
    ).then(res => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#09090b',
            backgroundImage:
              'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            padding: '80px',
            position: 'relative',
          }}
        >
          {/* Header with Logo and URL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '60px',
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
                  fontSize: '32px',
                  fontWeight: 700,
                  fontFamily: 'PT Sans',
                  color: 'white',
                  marginLeft: '16px',
                }}
              >
                PayKit
              </span>
            </div>
            <span style={{ fontSize: '18px', fontFamily: 'PT Sans', color: '#52525b' }}>
              usepaykit.dev
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              padding: '8px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              alignSelf: 'flex-start',
              marginBottom: '32px',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontFamily: 'PT Sans',
                color: '#60a5fa',
                fontWeight: 700,
              }}
            >
              Documentation
            </span>
          </div>

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 700,
                fontFamily: 'PT Sans',
                color: 'white',
                marginBottom: '28px',
                lineHeight: 1.1,
                maxWidth: '950px',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '32px',
                fontFamily: 'PT Sans',
                color: '#a1a1aa',
                lineHeight: 1.4,
                maxWidth: '950px',
              }}
            >
              {description}
            </p>
          </div>

          {/* Footer with tech stack */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '10px 20px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ fontSize: '16px', fontFamily: 'PT Sans', color: '#71717a' }}>
                TypeScript • React • Node.js
              </span>
            </div>
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
  } catch (e: unknown) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
