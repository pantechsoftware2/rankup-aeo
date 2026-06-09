import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RankUp AEO SEO and AEO visibility audit';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#050505',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
          height: '100%',
          justifyContent: 'center',
          padding: 72,
          width: '100%',
        }}
      >
        <div
          style={{
            border: '1px solid rgba(34,197,94,0.4)',
            borderRadius: 999,
            color: '#4ade80',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            marginBottom: 36,
            padding: '14px 24px',
            textTransform: 'uppercase',
          }}
        >
          SEO + AEO Visibility
        </div>
        <div
          style={{
            fontSize: 86,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.02,
            maxWidth: 920,
            textAlign: 'center',
          }}
        >
          RankUp AEO
        </div>
        <div
          style={{
            color: '#cbd5e1',
            fontSize: 34,
            lineHeight: 1.35,
            marginTop: 28,
            maxWidth: 900,
            textAlign: 'center',
          }}
        >
          Google rankings, answer-engine readiness, and citeable proof for businesses.
        </div>
      </div>
    ),
    size
  );
}
