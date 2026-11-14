import type { CSSProperties } from 'react';
import type { FeedItem, FeedKind } from '../data/types';
import { color } from '../theme';

const chip = (bg: string, fg: string): CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  borderRadius: 4,
  padding: '2px 6px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  background: bg,
  color: fg,
});

export const FEED_CHIP: Record<FeedKind, CSSProperties> = {
  pr: chip('#E6EDFB', '#1D47AB'),
  commit: chip('#EDEDEA', '#3D3D3A'),
  fire: chip('#FDEDE4', '#A63A0B'),
  rank: chip('#E7F4EE', '#1E6B47'),
};

const BOLT = (
  <svg viewBox="0 0 12 12"><path d="M7 0 L2 7 H5.5 L4.5 12 L10 4.5 H6.5Z" fill="#FFD84D" stroke="#2B2D45" strokeWidth=".8" /></svg>
);
const CONE = (
  <svg viewBox="0 0 12 12">
    <path d="M6 0.8 L10 10 H2Z" fill="#FF9A3C" stroke="#2B2D45" strokeWidth="1" strokeLinejoin="round" />
    <path d="M4.2 5.2 H7.8 M3.3 7.6 H8.7" stroke="#fff" strokeWidth="1.2" />
    <rect x="0.8" y="10" width="10.4" height="1.6" rx=".6" fill="#2B2D45" />
  </svg>
);

export function FeedList({ items }: { items: FeedItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {items.map((f, k) => {
        const cls = f.kind === 'pr' ? 'feed-row feed-row--boost' : f.kind === 'fire' ? 'feed-row feed-row--slip' : 'feed-row';
        const icon = f.kind === 'pr' ? BOLT : f.kind === 'fire' ? CONE : null;
        return (
          <div key={`${f.time}-${k}-${f.text}`} className={cls}>
            <span className="time">{f.time}</span>
            <span className="tag" style={f.kind === 'rank' ? { background: '#E7F4EE', color: '#1E6B47' } : undefined}>
              {icon}
              {icon ? <span>{f.type}</span> : f.type}
            </span>
            <span className="msg">{f.text}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LiveFeed({ items }: { items: FeedItem[] }) {
  return (
    <>
      <section style={{ background: '#FFFFFF', border: '1px dashed #B9B9B4', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>파트별 주행 기록 보기</div>
        <div style={{ fontSize: 13, color: color.textMuted, lineHeight: 1.5 }}>왼쪽 순위나 트랙 위 말을 누르면 기획, 디자인, 개발, 문서 파트가 각각 얼마나 달렸는지 여기에 열려요</div>
      </section>
      <section style={{ flexGrow: 1, minHeight: 0, background: '#FFFFFF', border: `1px solid ${color.line}`, borderRadius: 10, padding: '22px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h2 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>실시간 중계</h2>
        <FeedList items={items} />
      </section>
    </>
  );
}
