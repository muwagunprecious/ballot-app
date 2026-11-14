import { ImageResponse } from 'next/og';

export const alt = 'My 2027 Ballot Lineup Nigeria — #my2027lineup';
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
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0B0F0D',
          border: '14px solid #16241B',
          padding: '50px 60px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#131C16',
                border: '2px solid #20C878',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              🗳️
            </div>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              My 2027 ballot line-up Nigeria
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#15251B',
              border: '2px solid #20C878',
              borderRadius: '999px',
              padding: '8px 20px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#20C878',
            }}
          >
            #my2027lineup
          </div>
        </div>

        {/* Center Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>
          <div style={{ fontSize: '56px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#ffffff' }}>
            Build & Share Your Personal 2027 Election Slate
          </div>
          <div style={{ fontSize: '24px', color: '#A0ADA4', lineHeight: 1.4 }}>
            Select your candidates for President, Governor, Senate, and House of Representatives across all 36 States and the FCT.
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '20px',
            borderTop: '2px solid #1A251E',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', color: '#20C878', fontWeight: 700 }}>
            <span>make yours at www.lineup2027.com</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#FBBF24',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            NOT OFFICIAL BALLOT
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
